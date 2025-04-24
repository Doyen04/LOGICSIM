import { AndGate, NotGate, InputGate, OutputGate } from './gate.js'
import { calculateGateCoordinates, validateGateSelection, dragLogic, toggleInput, createConnection } from './util.js'
import { gates, chipset } from './canvas.js'
import { mousePos } from './class.js'


// let mousePos = { x: 0, y: 0 }
let isMouseDown = false
let isMouseDrag = false
let isAddGateButtonClick = false

const onCanvasMouseEnter =(ev)=>{
    mousePos.x = ev.offsetX
    mousePos.y = ev.offsetY
}
//allow moving wwhen the mouse is out of the screen pls
const onCanvasMouseLeave =(ev)=>{
    mousePos.x = ev.offsetX
    mousePos.y = ev.offsetY
}

const onCanvasMouseMove = (ev) => {
    // console.log(ev.offsetX, mousePos.x, ev.offsetX, mousePos.x);

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


export {
    onCanvasMouseMove, onCanvasMouseClick, onCanvasMouseDown,onCanvasMouseLeave,
    onCanvasMouseUp, onCanvasRightClick, addAndGateHandler, addNotGateHandler,
    addInputGateHandler, addOutputGateHandler, toggleMenuHandler, onCanvasMouseEnter
}