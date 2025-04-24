
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


const menuButton = document.querySelector('.menu')
menuButton.addEventListener('click', menuClickHandler)

const andButton = document.querySelector('#and')
andButton.addEventListener('click', andHandler)


const notButton = document.querySelector('#not')
notButton.addEventListener('click', notHandler)

const inButton = document.querySelector('#in')
inButton.addEventListener('click', inHandler)

const outButton = document.querySelector('#out')
outButton.addEventListener('click', outHandler)

const cnvs = document.getElementById('canvas')
cnvs.addEventListener('mousemove', handleMouseMove)
cnvs.addEventListener('click', handleMouseClick)
cnvs.addEventListener('mousedown', handleMouseDown)
cnvs.addEventListener('mouseup', handleMouseUp)
cnvs.addEventListener('contextmenu', handleRightClick)

new CANVAS().render()
