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
    node_clicked,
    isInspectMode,
    removeInspectTree
} from './util.js'
import { gates, chipset, mousePos, connectionList, connection } from './class.js'
import { canvas } from './canvas.js'



let isMouseDown = false
let isMouseDrag = false
let isAddGateButtonClick = false

const onCanvasMouseEnter = (ev) => {
}

const onCanvasMouseLeave = (ev) => {
    mousePos.x = ev.offsetX
    mousePos.y = ev.offsetY

    chipset[0].push(...gates)
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
        chipset[0].push(...gates)
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
    if (isAddGateButtonClick == false && ev.button == 0 && isInspectMode() == false) {
        isMouseDown = true
        chipset[0].forEach(gate => {
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

        const gate = chipset[0].find(chip => chip.collide(mousePos.x, mousePos.y));
        const connect = canvas.getLineCollision()[0];
        const pin = node_clicked(ev, chipset[0])

        const inspectElem = document.querySelector('.inspect');
        const deleteElem = document.querySelector('.delete');
        const colorElems = document.querySelectorAll('.color');
        const inputElems = document.querySelector('.input');

        deleteElem.style.display = (isInspectMode() == false && (gate || connect) && !pin) ? 'block' : 'none'
        inputElems.style.display = (pin && isInspectMode() == false) ? 'block' : 'none'
        const showColors = ((gate && (gate.name === 'INPUT' || gate.name === 'OUTPUT')) || connect) && !pin;
        colorElems.forEach(elem => { elem.style.display = (showColors && isInspectMode() == false) ? 'block' : 'none' });
        inspectElem.style.display = (gate && gate.name == 'COMPOUND') ? 'block' : 'none'

        if (gate && (isInspectMode() == false || (gate.name == 'COMPOUND' && isInspectMode()))) {
            displayContextMenu(ev, gate);

        } else if (pin && isInspectMode() == false) {
            document.querySelector('.text').value = pin.hint
            displayContextMenu(ev, pin);
        } else if (connect && isInspectMode() == false) {
            displayContextMenu(ev, connect);
        } else {
            hideContextMenu()
        }
    }
}

const onContextMenuClick = (ev) => {
    let x = parseInt(ev.currentTarget.getAttribute('nodeX'))
    let y = parseInt(ev.currentTarget.getAttribute('nodeY'))
    let gate = chipset[0].find(chip => chip.collide(x, y))
    let connect = canvas.getLineCollision()[0]
    const pin = node_clicked({ offsetX: x, offsetY: y }, chipset[0])

    if (ev.target.innerHTML.toLowerCase() == 'delete') {
        if (gate) deleteGate(gate)
        else if (connect) deleteLine(connect)
        hideContextMenu()
    } else if (ev.target.innerHTML.toLowerCase() == 'inspect') {
        inspectGate(ev, gate)
        hideContextMenu()
    } else if (ev.target.classList.contains('color')) {

        if (gate) gate.changeColor(ev.target.innerHTML.toLowerCase())
        else if (connect) connect.changeLineColor(ev.target.innerHTML.toLowerCase())
            hideContextMenu()
    } else if (ev.target.classList.contains('submit')) {
        pin.hint = document.querySelector('.text').value
        hideContextMenu()
    }
    
}

const addGateChecker = (gate, ev) => {
    if (isInspectMode() == false) {
        validateGateSelection(ev)
        let [x, y] = calculateGateCoordinates(ev);
        gates.push(new gate(x, y))
        isAddGateButtonClick = true
    }
}

const addAndGateHandler = (ev) => {
    addGateChecker(AndGate, ev)
}

const addNotGateHandler = (ev) => {
    addGateChecker(NotGate, ev)
}

const addInputGateHandler = (ev) => {
    addGateChecker(InputGate, ev)
}

const addOutputGateHandler = (ev) => {
    addGateChecker(OutputGate, ev)
}

const addDisplayHandler = (ev) => {
    addGateChecker(Display, ev)
}

const toggleMenuHandler = (ev) => {
    if (isInspectMode() == false) {
        let menu_container = document.querySelector(".menu-items")
        menu_container.style.display = (menu_container.style.display == 'flex') ? 'none' : 'flex';
    }
}

const saveToLocalStorage = () => {
    if (isInspectMode() == false) {
        const serializedData = {
            nodes: chipset[0].map(node => node.toJSON()), // Serialize all nodes
            connection: connectionList[0].map(wire => ({
                sourcePin: wire.sourcePin.id,
                destinationPin: wire.destinationPin.id,
                connectionCoord: wire.connectionCoord,
            })), // Serialize wires
            fill: generateRandomColor(),
            stroke: generateRandomColor(),
        };

        const name = prompt('Enter a name for your circuit:');
        if (localStorage.getItem(name)) {
            alert('Another chip exist with this name')
            if (confirm('Do you want to proceed')) {

            } else {
                return
            }
        }
        if (name) {
            localStorage.setItem(name, JSON.stringify(serializedData));
            console.log(`Circuit saved as "${name}"`);
        } else {
            console.log('Save canceled.');
        }
    }
};

const displayLibrary = () => {
    if (isInspectMode() == false) {
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
            <button class="delete-button" data-key="${key}" title="Click to remove circuit">
                <img class="delete-icon" src="./assets/cancel.png" />
            </button>
            <button class="edit-button" data-key="${key}" title="Click to edit circuit">
                <img class="edit-icon" src="./assets/edit.png" />
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
        container.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', editCircuit);
        });
    }
}

const loadCircuit = (ev) => {
    if (isInspectMode() == false) {
        const key = ev.currentTarget.getAttribute('name');
        const circuitObject = JSON.parse(localStorage.getItem(key))
        validateGateSelection(ev)
        let [x, y] = calculateCompoundGateCoordinates(ev)
        gates.push(new CompoundGate(x - 50, y, key, circuitObject['fill'], circuitObject['stroke']))
        isAddGateButtonClick = true
    }
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

const editCircuit = (ev) => {
    ev.stopPropagation()
    const key = ev.currentTarget.dataset.key;
    //add error handling
    const circuitObject = JSON.parse(localStorage.getItem(key))
    const gate = new CompoundGate(0, 0, key, '', '')
    if (chipset[0].length > 0) {
        alert('Save current file and create a new file to continue')
    } else {
        chipset[0].push(...gate.savedNode)
        connectionList[0].push(...gate.savedConnection)
    }
}
const toggleLibrary = () => {
    let modal = document.querySelector('.floating-sidebar');
    modal.classList.toggle('toggle-sidebar');
}
const createNewFile = () => {
    if (isInspectMode() == false) {
        chipset[0].length = 0;
        connectionList[0].length = 0
    }
}
const inspectTreeNavigationHandler = (ev) => {

    if (chipset.length > 1) {
        chipset.shift()
        connectionList.shift()
        removeInspectTree()
    }
    if (chipset.length == 1) {
        const inspectTreeContent = document.querySelector('.inspect-tree-content')
        inspectTreeContent.innerHTML = ''
        const inspectTree = document.querySelector('.inspect-tree')
        inspectTree.style.display = 'none'
    }
}
export {
    onCanvasMouseMove, onCanvasMouseClick, onCanvasMouseDown, onCanvasMouseLeave, onContextMenuClick,
    onCanvasMouseUp, onCanvasRightClick, addAndGateHandler, addNotGateHandler, inspectTreeNavigationHandler,
    saveToLocalStorage, addDisplayHandler, onCanvasMouseEnter, displayLibrary, createNewFile,
    addInputGateHandler, addOutputGateHandler, toggleMenuHandler, toggleLibrary
}