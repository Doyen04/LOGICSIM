import { CustomArray } from "./util.js" 

let cnvs = document.querySelector('#canvas')
let cnt = cnvs.getContext('2d')



const gates = new CustomArray()
const chipset = new CustomArray()

class CANVAS {
    offset = 0
    draw_circle = (x, y, r, fill, stroke, lwidth) => {
        cnt.lineWidth = lwidth
        cnt.lineDashOffset = 0
        cnt.setLineDash([])
        cnt.beginPath()
        cnt.strokeStyle = stroke
        cnt.arc(x, y, r, 0, 2 * Math.PI)
        cnt.fillStyle = fill
        cnt.fill()
        cnt.stroke()
    }
    draw_rect = (x, y, fill, stroke, w, h, lwidth) => {
        cnt.lineDashOffset = 0
        cnt.lineWidth = lwidth
        cnt.beginPath()
        cnt.strokeStyle = stroke
        cnt.rect(x, y, w, h)
        cnt.setLineDash([])
        cnt.fillStyle = fill
        cnt.fillRect(x, y, w, h)
        cnt.stroke()
    }
    draw_text = (x, y, w, h, name) => {
        cnt.beginPath()
        cnt.fillStyle = 'white'
        cnt.font = '12px cursive'
        let text = cnt.measureText(name)
        let textheight = text.actualBoundingBoxAscent
        cnt.fillText(name, x + ((w - text.width) / 2), y + ((h + textheight) / 2));
        cnt.stroke()
    }
    draw_line = (x1, y1, x2, y2, pattern, stroke, lwidth, offset) => {
        cnt.beginPath()

        cnt.moveTo(x1, y1)
        cnt.lineTo(x2, y2)
        // cnt.lineJoin = "round";
        cnt.lineCap = "round";
        cnt.lineWidth = lwidth
        cnt.strokeStyle = stroke
        cnt.lineDashOffset = -offset;
        cnt.setLineDash(pattern)
        cnt.stroke()
    }
    get_line_collision = () => {
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
                if (this.line_collide(x1, y1, x2, y2)) {
                    result = { start_pos: [x1, y1], end_pos: [x2, y2], node: wire }
                }
            }
        } return result
    }
    line_collide = (x1, y1, x2, y2) => {
        cnt.beginPath()
        cnt.lineWidth = 10
        cnt.moveTo(x1, y1)
        cnt.lineTo(x2, y2)
        if (cnt.isPointInStroke(mouse_pos.x, mouse_pos.y)) {
            return true
        } else {
            return false

        }
    }
    draw_wires = () => {
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
                    this.draw_line(x1, y1, x2, y2, [], 'white', 10)
                }
                let stroke = (wire.out_node.state == 0) ? 'black' : 'red'
                let dash = (wire.out_node.state == 0) ? [] : [5, 10]
                this.draw_line(x1, y1, x2, y2, dash, stroke, 5, this.offset)
            }
        })
    }
    render = () => {
        cnt.clearRect(0, 0, cnt.canvas.width, cnt.canvas.height)
    
        // if (temp_canvas_class != null) temp_canvas_class.draw_wires()
        gates.forEach(gate => {
            gate.draw()
        })
        chipset.forEach(gate => {
            gate.draw()
        })
        requestAnimationFrame(this.render)
    }
}

const handleWindowResize = (ev)=>{
    const section = document.querySelectorAll('.canvas-sidebar-container')[0]
    const root = document.documentElement
    const styles = getComputedStyle(root)

    const side_bar = parseInt(styles.getPropertyValue('--side-bar').trim())
    cnvs.setAttribute('width', `${section.offsetWidth - side_bar}px`)
    cnvs.setAttribute('height', `${section.offsetHeight}px`)
}
handleWindowResize()

window.addEventListener('resize', handleWindowResize)

export {CANVAS, gates}
