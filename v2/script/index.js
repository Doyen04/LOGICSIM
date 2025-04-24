import { CANVAS, } from './canvas.js'
import {
    handleMouseMove, handleMouseClick, handleMouseDown, handleMouseUp,
    handleRightClick, inHandler, outHandler, notHandler, andHandler, menuClickHandler
} from './eventhandler.js'



// function windowLoadHandler() {
// console.log(888);
// function menuClickHandler(ev) {
//     console.log(88888);
// }
// }
// window.addEventListener('DOMContentLoaded', windowLoadHandler)


const menuToggleButton = document.querySelector('.menu')
menuToggleButton.addEventListener('click', menuClickHandler)

const andGateButton = document.querySelector('#and')
andGateButton.addEventListener('click', andHandler)


const notGateButton = document.querySelector('#not')
notGateButton.addEventListener('click', notHandler)

const inputGateButton = document.querySelector('#in')
inputGateButton.addEventListener('click', inHandler)

const outputGateButton = document.querySelector('#out')
outputGateButton.addEventListener('click', outHandler)

const canvasElement = document.getElementById('canvas')
canvasElement.addEventListener('mousemove', handleMouseMove)
canvasElement.addEventListener('click', handleMouseClick)
canvasElement.addEventListener('mousedown', handleMouseDown)
canvasElement.addEventListener('mouseup', handleMouseUp)
canvasElement.addEventListener('contextmenu', handleRightClick)

new CANVAS().render()
