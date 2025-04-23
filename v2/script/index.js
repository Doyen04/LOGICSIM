
import { AND, NOT, IN, OUT } from './gate.js'
import { CANVAS, gates } from './canvas.js'



// function windowLoadHandler() {
// console.log(888);
// function menuClickHandler(ev) {
//     console.log(88888);
// }
// }
// window.addEventListener('DOMContentLoaded', windowLoadHandler)


const menuClickHandler = (ev) => {
    let menu_container = document.querySelector(".menu-items")
    menu_container.style.display = (menu_container.style.display == '' || menu_container.style.display == 'none') ? 'flex' : 'none';
}
document.querySelector('.menu').addEventListener('click', menuClickHandler)

const getGateCoord = (ev) => {
    let circuitBoard = document.querySelector('#canvas')
    let sideBar = ev.target.getBoundingClientRect()
    let BoardRect = circuitBoard.getBoundingClientRect()

    const getY = (y) => {
        let lastY = y
        let yGap = 5
        gates.forEach((gate) => {
            if (gate.name == ('INPUT') || gate.name == ('OUTPUT')) {
                lastY = gate.bottom + gate.r + yGap
            } else {
                lastY = gate.bottom + (yGap)
            }
        })
        return lastY
    }
    // mouse_pos = { x: 0, y: sideBar.y - BoardRect.y }

    return [0, getY(sideBar.y - BoardRect.y)]
}

const checkGates = (ev)=>{
    if (/*button_click &&*/ gates != '' && (gates[0].name != ev.target.getAttribute('name'))) {
        gates.reset()
    }

    // button_click = true
}

const andHandler = (ev) => {
    checkGates(ev)
    let [x, y] = getGateCoord(ev);
    gates.push(new AND(x, y))
}
document.querySelector('#and').addEventListener('click', andHandler)

const notHandler = (ev) => {
    checkGates(ev)
    let [x, y] = getGateCoord(ev);
    gates.push(new NOT(x, y))
}
document.querySelector('#not').addEventListener('click', notHandler)

const inHandler = (ev) => {
    checkGates(ev)
    let [x, y] = getGateCoord(ev)
    gates.push(new IN(x, y))
}
document.querySelector('#in').addEventListener('click', inHandler)

const outHandler = (ev) => {
    checkGates(ev)
    let [x, y] = getGateCoord(ev);
    gates.push(new OUT(x, y))
}
document.querySelector('#out').addEventListener('click', outHandler)

new CANVAS().render()
