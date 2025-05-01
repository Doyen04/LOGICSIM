import { AndGate, NotGate, InputGate, OutputGate, CompoundGate } from './gate.js'
import {
    calculateGateCoordinates, validateGateSelection,
    dragLogic, toggleInput, createConnection, calculateCompoundGateCoordinates,
    generateRandomColor,
    deleteGate,
    displayContextMenu,
    hideContextMenu
} from './util.js'
import { gates, chipset, mousePos, connectionList, connection } from './class.js'



let isMouseDown = false
let isMouseDrag = false
let isAddGateButtonClick = false

const onCanvasMouseEnter = (ev) => {
}

const onCanvasMouseLeave = (ev) => {
    mousePos.x = ev.offsetX
    mousePos.y = ev.offsetY

    chipset.push(...gates)
    gates.reset()
    isAddGateButtonClick = false
    isMouseDrag = false
}

const onCanvasMouseMove = (ev) => {//console.log(chipset, ev)
    let newx = ev.offsetX - mousePos.x
    let newy = ev.offsetY - mousePos.y
    if (gates != '' && (isAddGateButtonClick || isMouseDrag)) {
        dragLogic(newx, newy)
    }
    if (isMouseDown && ev.movementX != 0 && ev.movementY != 0) isMouseDrag = true;

    // if (temp_canvas_class == null) temp_canvas_class = new CANVAS
    // line_selected = temp_canvas_class.get_line_collision()
    mousePos.x = ev.offsetX
    mousePos.y = ev.offsetY
    //console.log(chipset);
}

const onCanvasMouseClick = (ev) => {

    console.log(ev.type);

    if (isAddGateButtonClick) {
        chipset.push(...gates)
    }
    gates.reset()

    if (isMouseDrag == false && isAddGateButtonClick == false) {
        toggleInput(ev)
        createConnection(ev)
    }

    isAddGateButtonClick = false
    isMouseDrag = false
}

const onCanvasMouseDown = (ev) => {
    console.log(ev.type);
    if (isAddGateButtonClick == false && ev.button == 0) {
        isMouseDown = true
        chipset.forEach(gate => {
            if (gate.collide(mousePos.x, mousePos.y)) gates.push(gate)
        })
    }
}

const onCanvasMouseUp = (ev) => {
    console.log(ev.type);
    isMouseDown = false
}
const onCanvasRightClick = (ev) => {
    console.log(ev.type);

    ev.preventDefault()
    if (connection.destinationPin == '' || connection.sourcePin == '') {
        connection.reset()
    } if ((isMouseDown == false || isMouseDrag == false) && isAddGateButtonClick == false) {
        let gate = chipset.find(chip => chip.collide(mousePos.x, mousePos.y))
        if (gate) displayContextMenu(ev, gate)
    }
}

const onContextMenuClick = (ev) => {
    let x = parseInt(ev.currentTarget.getAttribute('nodeX'))
    let y = parseInt(ev.currentTarget.getAttribute('nodeY'))
    let gate = chipset.find(chip => chip.collide(x, y))
    if (ev.target.innerHTML.toLowerCase() == 'delete') {
        if (gate) deleteGate(gate)
        hideContextMenu()
    } else if (ev.target.innerHTML.toLowerCase() == 'inspect') {
        console.log(ev.target);
    }
}

const addAndGateHandler = (ev) => {
    validateGateSelection(ev)
    let [x, y] = calculateGateCoordinates(ev);
    gates.push(new AndGate(x, y))
    isAddGateButtonClick = true
}

const addNotGateHandler = (ev) => {
    validateGateSelection(ev)
    let [x, y] = calculateGateCoordinates(ev);
    gates.push(new NotGate(x, y))
    isAddGateButtonClick = true
}

const addInputGateHandler = (ev) => {
    validateGateSelection(ev)
    let [x, y] = calculateGateCoordinates(ev)
    gates.push(new InputGate(x, y))
    isAddGateButtonClick = true
}

const addOutputGateHandler = (ev) => {
    validateGateSelection(ev)
    let [x, y] = calculateGateCoordinates(ev);
    gates.push(new OutputGate(x, y))
    isAddGateButtonClick = true
}

const toggleMenuHandler = (ev) => {
    let menu_container = document.querySelector(".menu-items")
    menu_container.style.display = (menu_container.style.display == '' || menu_container.style.display == 'none') ? 'flex' : 'none';
}

const saveToLocalStorage = () => {

    const serializedData = {
        nodes: chipset.map(node => node.toJSON()), // Serialize all nodes
        connection: connectionList.map(wire => ({
            sourcePin: wire.sourcePin.id,
            destinationPin: wire.destinationPin.id,
            connectionCoord: wire.connectionCoord,
        })), // Serialize wires
        fill: generateRandomColor(),
        stroke: generateRandomColor(),
    };
    console.dir(serializedData, { depth: null, colors: true });

    const name = prompt('Enter a name for your circuit:');
    if (name) {
        localStorage.setItem(name, JSON.stringify(serializedData));
        console.log(`Circuit saved as "${name}"`);
    } else {
        console.log('Save canceled.');
    }
};

const displayLibrary = () => {
    toggleMenuHandler()
    let modal = document.querySelector('.floating-sidebar');
    modal.classList.toggle('toggle-sidebar');

    let container = document.querySelector('.library-container');
    container.innerHTML = ''; // Clear previous content

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i); // Get the key (circuit name)

        // Create an element for each library item
        let item = document.createElement('article');
        item.classList.add('chips');
        item.innerHTML = `
            <h3  data-key="${key}">${key}</h3>
            <button class="delete-button" data-key="${key}">
                <img class="delete-icon" src="./assets/cancel.png" />
            </button>
        `;

        // Append the item to the container
        item.setAttribute('name', key)
        item.addEventListener('click', loadCircuit)
        container.appendChild(item);
    }
    container.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', deleteCircuit);
    });

}

const loadCircuit = (ev) => {
    const key = ev.currentTarget.getAttribute('name');
    const circuitObject = JSON.parse(localStorage.getItem(key))
    validateGateSelection(ev)
    // console.log(circuitObject['fill'], circuitObject['stroke']);

    let [x, y] = calculateCompoundGateCoordinates(ev)
    gates.push(new CompoundGate(x - 50, y, key, circuitObject['fill'], circuitObject['stroke']))
    // console.log(gates[0]);
    isAddGateButtonClick = true
}


const deleteCircuit = (ev) => {
    ev.stopPropagation()
    const key = ev.currentTarget.dataset.key;
    //add error handling
    if (confirm(`Are you sure you want to delete the circuit "${key}"?`)) {
        localStorage.removeItem(key);
        console.log(`Circuit "${key}" deleted.`);
        displayLibrary(); // Refresh the library display
    }
}

const closeLibrary = () => {
    let modal = document.querySelector('.floating-sidebar');
    modal.classList.toggle('toggle-sidebar');
}
export {
    onCanvasMouseMove, onCanvasMouseClick, onCanvasMouseDown, onCanvasMouseLeave, displayLibrary, onContextMenuClick,
    onCanvasMouseUp, onCanvasRightClick, addAndGateHandler, addNotGateHandler, saveToLocalStorage,
    addInputGateHandler, addOutputGateHandler, toggleMenuHandler, onCanvasMouseEnter, closeLibrary
}