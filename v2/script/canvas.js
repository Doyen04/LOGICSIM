import { CustomArray } from "./util.js"

let canvasElement = document.querySelector('#canvas')
let canvasContext = canvasElement.getContext('2d')



const gates = new CustomArray()
const chipset = new CustomArray()

class CANVAS {
    offset = 0
    drawCircle = (x, y, r, fill, stroke, lwidth) => {
        canvasContext.lineWidth = lwidth
        canvasContext.lineDashOffset = 0
        canvasContext.setLineDash([])
        canvasContext.beginPath()
        canvasContext.strokeStyle = stroke
        canvasContext.arc(x, y, r, 0, 2 * Math.PI)
        canvasContext.fillStyle = fill
        canvasContext.fill()
        canvasContext.stroke()
    }
    drawRectangle = (x, y, fill, stroke, w, h, lwidth) => {
        canvasContext.lineDashOffset = 0
        canvasContext.lineWidth = lwidth
        canvasContext.beginPath()
        canvasContext.strokeStyle = stroke
        canvasContext.rect(x, y, w, h)
        canvasContext.setLineDash([])
        canvasContext.fillStyle = fill
        canvasContext.fillRect(x, y, w, h)
        canvasContext.stroke()
    }
    drawText = (x, y, w, h, name) => {
        canvasContext.beginPath()
        canvasContext.fillStyle = 'white'
        canvasContext.font = '12px cursive'
        let text = canvasContext.measureText(name)
        let textheight = text.actualBoundingBoxAscent
        canvasContext.fillText(name, x + ((w - text.width) / 2), y + ((h + textheight) / 2));
        canvasContext.stroke()
    }
    drawLine = (x1, y1, x2, y2, pattern, stroke, lwidth, offset) => {
        canvasContext.beginPath()

        canvasContext.moveTo(x1, y1)
        canvasContext.lineTo(x2, y2)
        // cnt.lineJoin = "round";
        canvasContext.lineCap = "round";
        canvasContext.lineWidth = lwidth
        canvasContext.strokeStyle = stroke
        canvasContext.lineDashOffset = -offset;
        canvasContext.setLineDash(pattern)
        canvasContext.stroke()
    }
    detectLineCollision = () => {
        let result = { start_pos: [], end_pos: [], node: '' }
        for (let nn = 0; nn < wires.length; nn++) {
            const wire = wires[nn];
            let lines = []
            lines.push([wire.out_node.x, wire.out_node.y])
            lines.push(...wire.connector)
            lines.push([wire.in_node.x, wire.in_node.y])
            for (let ii = 1; ii < lines.length; ii++) {
                let [x1, y1] = lines[ii - 1]
                let [x2, y2] = lines[ii]
                if (this.isLineColliding(x1, y1, x2, y2)) {
                    result = { start_pos: [x1, y1], end_pos: [x2, y2], node: wire }
                }
            }
        } return result
    }
    isLineColliding = (x1, y1, x2, y2) => {
        canvasContext.beginPath()
        canvasContext.lineWidth = 10
        canvasContext.moveTo(x1, y1)
        canvasContext.lineTo(x2, y2)
        if (canvasContext.isPointInStroke(mouse_pos.x, mouse_pos.y)) {
            return true
        } else {
            return false

        }
    }
    renderWires = () => {
        this.offset = (this.offset + 1) % 100
        wires.forEach(wire => {
            let array = []
            array.push([wire.out_node.x, wire.out_node.y])
            array.push(...wire.connector)
            array.push([wire.in_node.x, wire.in_node.y])
            for (let c = 1; c < array.length; c++) {
                let [x1, y1] = array[c - 1]
                let [x2, y2] = array[c]

                let [sx, sy] = line_selected.start_pos
                let [ex, ey] = line_selected.end_pos
                if (sx == x1 && sy == y1 && ex == x2 && ey == y2) {
                    this.drawLine(x1, y1, x2, y2, [], 'white', 10)
                }
                let stroke = (wire.out_node.state == 0) ? 'black' : 'red'
                let dash = (wire.out_node.state == 0) ? [] : [5, 10]
                this.drawLine(x1, y1, x2, y2, dash, stroke, 5, this.offset)
            }
        })
    }
    
    renderCanvas = () => {
        canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height)

        // if (temp_canvas_class != null) temp_canvas_class.draw_wires()
        gates.forEach(gate => {
            gate.renderNode()
        })
        chipset.forEach(gate => {
            gate.renderNode()
        })
        requestAnimationFrame(this.renderCanvas)
    }
}

const adjustCanvasSize = (ev) => {
    const section = document.querySelectorAll('.canvas-sidebar-container')[0]
    const root = document.documentElement
    const styles = getComputedStyle(root)

    const side_bar = parseInt(styles.getPropertyValue('--side-bar').trim())
    canvasElement.setAttribute('width', `${section.offsetWidth - side_bar}px`)
    canvasElement.setAttribute('height', `${section.offsetHeight}px`)
}
adjustCanvasSize()

window.addEventListener('resize', adjustCanvasSize)

export { CANVAS, gates }
