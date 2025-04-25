import { canvas } from './canvas.js'
import {
    onCanvasMouseMove, onCanvasMouseClick, onCanvasMouseDown, saveToLocalStorage,closeLibrary,
    onCanvasMouseUp, onCanvasRightClick, addAndGateHandler, addNotGateHandler,displayLibrary,
    addInputGateHandler, addOutputGateHandler, toggleMenuHandler, onCanvasMouseEnter, onCanvasMouseLeave
} from './eventHandler.js'



// function windowLoadHandler() {
// console.log(888);
// function menuClickHandler(ev) {
//     console.log(88888);
// }
// }
// window.addEventListener('DOMContentLoaded', windowLoadHandler)

const saveAs = document.querySelector('.saveas')
saveAs.addEventListener('click', saveToLocalStorage)

const cancel = document.querySelector('.cancel')
cancel.addEventListener('click', closeLibrary)


const library = document.querySelector('.library')
library.addEventListener('click', displayLibrary)

const menuToggleButton = document.querySelector('.menu')
menuToggleButton.addEventListener('click', toggleMenuHandler)

const andGateButton = document.querySelector('#and')
andGateButton.addEventListener('click', addAndGateHandler)


const notGateButton = document.querySelector('#not')
notGateButton.addEventListener('click', addNotGateHandler)

const inputGateButton = document.querySelector('#in')
inputGateButton.addEventListener('click', addInputGateHandler)

const outputGateButton = document.querySelector('#out')
outputGateButton.addEventListener('click', addOutputGateHandler)

const canvasElement = document.getElementById('canvas')
canvasElement.addEventListener('mousemove', onCanvasMouseMove)
canvasElement.addEventListener('click', onCanvasMouseClick)
canvasElement.addEventListener('mousedown', onCanvasMouseDown)
canvasElement.addEventListener('mouseup', onCanvasMouseUp)
canvasElement.addEventListener('contextmenu', onCanvasRightClick)
canvasElement.addEventListener('mouseenter', onCanvasMouseEnter)
canvasElement.addEventListener('mouseleave', onCanvasMouseLeave)

canvas.renderCanvas()