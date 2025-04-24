import { AndGate, NotGate, InputGate, OutputGate } from './gate.js'
import { calculateGateCoordinates, validateGateSelection } from './util.js'
import { gates } from './canvas.js'

const onCanvasMouseMove = (ev) => {

}

const onCanvasMouseClick = (ev) => {

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
}

const addNotGateHandler = (ev) => {
    validateGateSelection(ev)
    let [x, y] = calculateGateCoordinates(ev);
    gates.push(new NotGate(x, y))
}

const addInputGateHandler = (ev) => {
    validateGateSelection(ev)
    let [x, y] = calculateGateCoordinates(ev)
    gates.push(new InputGate(x, y))
}

const addOutputGateHandler = (ev) => {
    validateGateSelection(ev)
    let [x, y] = calculateGateCoordinates(ev);
   
    
    gates.push(new OutputGate(x, y))
}

const toggleMenuHandler = (ev) => {
    let menu_container = document.querySelector(".menu-items")
    menu_container.style.display = (menu_container.style.display == '' || menu_container.style.display == 'none') ? 'flex' : 'none';
}


export {
    onCanvasMouseMove, onCanvasMouseClick, onCanvasMouseDown,
    onCanvasMouseUp, onCanvasRightClick, addAndGateHandler, addNotGateHandler,
    addInputGateHandler, addOutputGateHandler, toggleMenuHandler
}