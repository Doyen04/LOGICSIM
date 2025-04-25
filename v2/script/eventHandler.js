import { AndGate, NotGate, InputGate, OutputGate } from './gate.js'
import { calculateGateCoordinates, validateGateSelection, dragLogic, toggleInput, createConnection } from './util.js'
import { gates, chipset, mousePos, connectionList } from './class.js'


// let mousePos = { x: 0, y: 0 }
let isMouseDown = false
let isMouseDrag = false
let isAddGateButtonClick = false

const onCanvasMouseEnter = (ev) => {
    mousePos.x = ev.offsetX
    mousePos.y = ev.offsetY
}
//allow moving wwhen the mouse is out of the screen pls
const onCanvasMouseLeave = (ev) => {
    mousePos.x = ev.offsetX
    mousePos.y = ev.offsetY
}

const onCanvasMouseMove = (ev) => {

    let newx = ev.offsetX - mousePos.x
    let newy = ev.offsetY - mousePos.y
    if (gates != '') {
        dragLogic(newx, newy)
    }

    if (isMouseDown && ev.movementX != 0 && ev.movementY != 0) {
        isMouseDrag = true
    }
    // if (temp_canvas_class == null) temp_canvas_class = new CANVAS
    // line_selected = temp_canvas_class.get_line_collision()
    mousePos.x = ev.offsetX
    mousePos.y = ev.offsetY

}

const onCanvasMouseClick = (ev) => {

    // console.log(isMouseDown, isMouseDrag, gates);
    // console.log(ev.type);
    if (/*isMouseDown ||*/ isAddGateButtonClick) {
        chipset.push(...gates)
        // gates.reset()
    }
    gates.reset()

    if (isMouseDrag == false && isAddGateButtonClick == false) {
        toggleInput(ev)
        createConnection(ev)
    }
    // document.getElementsByClassName('pop-up')[0].style.display = 'none'

    isAddGateButtonClick = false
    isMouseDrag = false
    // console.log(gates, chipset);

}

const onCanvasMouseDown = (ev) => {

}

const onCanvasMouseUp = (ev) => {

}
const onCanvasRightClick = (ev) => {

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
        item.addEventListener('click', loadCircuit)
        container.appendChild(item);
    }
    container.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', deleteCircuit);
    });

}

const loadCircuit = () => {
    
}

const deleteCircuit = (ev) => { ev.stopPropagation()
    const key = ev.currentTarget.dataset.key;
    
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
    onCanvasMouseMove, onCanvasMouseClick, onCanvasMouseDown, onCanvasMouseLeave, displayLibrary,
    onCanvasMouseUp, onCanvasRightClick, addAndGateHandler, addNotGateHandler, saveToLocalStorage,
    addInputGateHandler, addOutputGateHandler, toggleMenuHandler, onCanvasMouseEnter, closeLibrary
}