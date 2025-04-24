import { gates } from "./canvas.js"

class CustomArray extends Array {
    reset = () => {
        this.length = 0
    }

}

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

const checkGates = (ev) => {
    if (/*button_click &&*/ gates != '' && (gates[0].name != ev.target.getAttribute('name'))) {
        gates.reset()
    }
    // button_click = true
}
export { CustomArray, getGateCoord,checkGates }