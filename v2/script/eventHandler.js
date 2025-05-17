import { AndGate, NotGate, InputGate, OutputGate, CompoundGate, Display } from './gate.js'
import {
    calculateGateCoordinates, validateGateSelection,
    dragLogic, toggleInput, createConnection, calculateCompoundGateCoordinates,
    generateRandomColor,
    deleteGate,
    displayContextMenu,
    hideContextMenu,
    deleteLine,
    inspectGate,
    node_clicked
} from './util.js'
import { gates, chipset, mousePos, connectionList, connection, selectedLine } from './class.js'
import { canvas } from './canvas.js'



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

const onCanvasMouseMove = (ev) => {
    let newx = ev.offsetX - mousePos.x
    let newy = ev.offsetY - mousePos.y
    if (gates != '' && (isAddGateButtonClick || isMouseDrag)) {
        dragLogic(newx, newy)
    }
    if (isMouseDown && (ev.movementX != 0 || ev.movementY != 0)) isMouseDrag = true;

    mousePos.x = ev.offsetX
    mousePos.y = ev.offsetY
}

const onCanvasMouseClick = (ev) => {

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
    hideContextMenu()
    if (document.querySelector('.floating-sidebar')
        .classList.contains('toggle-sidebar')) {
        toggleLibrary()
    }
}

const onCanvasMouseDown = (ev) => {
    if (isAddGateButtonClick == false && ev.button == 0) {
        isMouseDown = true
        chipset.forEach(gate => {
            if (gate.collide(mousePos.x, mousePos.y)) gates.push(gate)
        })
    }
}

const onCanvasMouseUp = (ev) => {
    isMouseDown = false
}
const onCanvasRightClick = (ev) => {

    ev.preventDefault()
    if (connection.destinationPin == '' || connection.sourcePin == '') {
        connection.reset()
    }
    if ((isMouseDown == false || isMouseDrag == false) && isAddGateButtonClick == false) {

        const gate = chipset.find(chip => chip.collide(mousePos.x, mousePos.y));
        const connect = canvas.getLineCollision();
        const pin = node_clicked(ev, chipset)

        const inspectElem = document.querySelector('.inspect');
        const colorElems = document.querySelectorAll('.color');

        if (gate) {
            inspectElem.style.display = (gate.name === 'COMPOUND') ? 'block' : 'none';

            if (gate.name !== 'COMPOUND') {
                const showColors = (gate.name === 'INPUT' || gate.name === 'OUTPUT');
                colorElems.forEach(elem => { elem.style.display = (showColors) ? 'block' : 'none' });
            } else {
                colorElems.forEach(elem => { elem.style.display = 'none' });
            }
            displayContextMenu(ev, gate);
        } else if (pin) {
            inspectElem.style.display = 'block';
            displayContextMenu(ev, pin);
        }
         else if (connect.length > 0) {
            inspectElem.style.display = 'none';
            colorElems.forEach(elem => { elem.style.display = 'block' });
            displayContextMenu(ev, connection);
        }
    }
}

const onContextMenuClick = (ev) => {
    let x = parseInt(ev.currentTarget.getAttribute('nodeX'))
    let y = parseInt(ev.currentTarget.getAttribute('nodeY'))
    let gate = chipset.find(chip => chip.collide(x, y))
    let connect = canvas.getLineCollision()[0]

    if (ev.target.innerHTML.toLowerCase() == 'delete') {
        if (gate) deleteGate(gate)
        if (connect) deleteLine(connect)
        hideContextMenu()
    } else if (ev.target.innerHTML.toLowerCase() == 'inspect') {
        inspectGate(ev, gate)
    } else if (ev.target.classList.contains('color')) {

        if (connect) connect.changeLineColor(ev.target.innerHTML.toLowerCase())
        if (gate) gate.changeColor(ev.target.innerHTML.toLowerCase())
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

const addDisplayHandler = (ev) => {
    validateGateSelection(ev)
    let [x, y] = calculateGateCoordinates(ev);
    gates.push(new Display(x, y))
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
    toggleLibrary()

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

    let [x, y] = calculateCompoundGateCoordinates(ev)
    gates.push(new CompoundGate(x - 50, y, key, circuitObject['fill'], circuitObject['stroke']))
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

const toggleLibrary = () => {
    let modal = document.querySelector('.floating-sidebar');
    modal.classList.toggle('toggle-sidebar');
}
export {
    onCanvasMouseMove, onCanvasMouseClick, onCanvasMouseDown, onCanvasMouseLeave, onContextMenuClick,
    onCanvasMouseUp, onCanvasRightClick, addAndGateHandler, addNotGateHandler,
    saveToLocalStorage, addDisplayHandler, onCanvasMouseEnter, displayLibrary,
    addInputGateHandler, addOutputGateHandler, toggleMenuHandler, toggleLibrary
}