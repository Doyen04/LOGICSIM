import { AND, NOT, IN, OUT } from './gate.js'
import { checkGates, getGateCoord } from './util.js'
import { gates } from './canvas.js'

const handleMouseMove = (ev) => {

}

const handleMouseClick = (ev) => {

}

const handleMouseDown = (ev) => {

}

const handleMouseUp = (ev) => {

}
const handleRightClick = (ev) => {

}

const andHandler = (ev) => {
    checkGates(ev)
    let [x, y] = getGateCoord(ev);
    gates.push(new AND(x, y))
}

const notHandler = (ev) => {
    checkGates(ev)
    let [x, y] = getGateCoord(ev);
    gates.push(new NOT(x, y))
}

const inHandler = (ev) => {
    checkGates(ev)
    let [x, y] = getGateCoord(ev)
    gates.push(new IN(x, y))
}

const outHandler = (ev) => {
    checkGates(ev)
    let [x, y] = getGateCoord(ev);
    gates.push(new OUT(x, y))
}

const menuClickHandler = (ev) => {
    let menu_container = document.querySelector(".menu-items")
    menu_container.style.display = (menu_container.style.display == '' || menu_container.style.display == 'none') ? 'flex' : 'none';
}


export {
    handleMouseMove, handleMouseClick, handleMouseDown,
    handleMouseUp, handleRightClick, andHandler, notHandler,
    inHandler, outHandler, menuClickHandler
}