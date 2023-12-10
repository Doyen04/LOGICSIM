let body = document.getElementsByTagName('body')[0]
let cnvs = document.getElementById('canvas')
let cnt = canvas.getContext('2d')
let section = document.getElementsByTagName('section')[0]
let button_click = false
let is_mouse_down = false
let mouse_drag = false
let mouse_pos = { x: 0, y: 0 }
let gap = 10
// let mousedist = 0

let wires = []
let node_list = []
let node_selected = []
// let selectedline = []
// let lineNodes = []
// let toconnect = { frm: '', to: '', bridge: [] }

cnvs.addEventListener('mousemove', handle_mouse_move)
cnvs.addEventListener('click', handle_click)
cnvs.addEventListener('mousedown', handle_mouse_down)
cnvs.addEventListener('mouseup', handle_mouse_up)
cnvs.addEventListener('contextmenu', handle_right_click)
window.addEventListener('resize', handle_window_resize)

function handle_mouse_move(params) {

}

function handle_click(params) {

}

function handle_mouse_down(params) {

}

function handle_mouse_up(params) {

}

function handle_right_click(params) {

}

function handle_window_resize(ev) {
    let side_bar = 40
    cnvs.setAttribute('width', `${section.offsetWidth - side_bar}px`)
    cnvs.setAttribute('height', `${section.offsetHeight}px`)
}
handle_window_resize()

let logics = document.getElementsByClassName('box')
for (const logic of logics) {
    logic.addEventListener('click', insert_node)
}

function insert_node(ev) {
    if (button_click && node_selected != '' && node_selected[0].name != ev.target.innerText) {
        node_selected = []

    }

    button_click = true

    let area = ev.target.getBoundingClientRect()
    let canvasarea = canvas.getBoundingClientRect()

    let [x, y] = [0, area.y - canvasarea.y]
    let name = ev.target.innerText

    mouse_pos = { x: x, y: y }//storing to preventing jumping

    if (ev.target.innerText == 'AND') node_selected.push(new AND(x, y))
    if (ev.target.innerText == 'NOT') node_selected.push(new NOT(x, y))

    // arrangelogic(selectedlogic, x)
}

class NODE {
    constructor(x, y, name, fill, stroke) {
        this.name = name
        this.custom_name = ''
        this.x = x
        this.y = y
        this.top = 0
        this.bottom = 0
        this.left = 0
        this.right = 0
        this.stroke = stroke
        this.fill = fill
    }
    calculate_bounding_rect = () => {
        this.bottom = Math.floor(this.y + this.h)
        this.top = Math.floor(this.y)
        this.left = Math.floor(this.x)
        this.right = Math.floor(this.x + this.w)
    }
    init = (inpin_len, outpin_len) => {
        let r = 6
        for (let x = 0; x < inpin_len; x++) {
            this.inpin.push(new PIN(0, 0, r, 'IN', this.fill, this.stroke,))
        }
        for (let x = 0; x < outpin_len; x++) {
            this.outpin.push(new PIN(0, 0, r, 'OUT', this.fill, this.stroke,))
        }
        //touch this
        this.w = 80
        this.h = 40
        this.calculate_pin_pos(inpin_len, outpin_len, r)
        this.calculate_bounding_rect()
        this.
        this.draw()
    }
    calculate_pin_pos = (inpin_len, outpin_len, r) => {
        let in_y = this.space_evenly(this.y, (this.y + this.h), inpin_len, r)
        let out_y = this.space_evenly(this.y, (this.y + this.h), outpin_len, r)
        console.log(in_y);
        this.inpin.forEach((pin, x) => {
            pin.x = this.x
            pin.y = in_y[x]
        });
        this.outpin.forEach((pin, x) => {
            pin.x = this.x + this.w
            pin.y = out_y[x]
        });
    }
    space_evenly = (y1, y2, len, r) => {
        let coord = []
        let spacing = (((y2 - y1) - ((r * 2) * len)) / (len + 1))
        for (let x = 0; x < len; x++) {
            let y = 0
            y = y1 + spacing + (spacing * x) + ((r * 2) * x) + r
            coord.push(y)
        } return coord
    }
    draw = () => {
        let new_cnvs = new CANVAS
        new_cnvs.draw_rect(this.x, this.y, this.fill, this.stroke, this.w, this.h, 1)
        new_cnvs.draw_text(this.x, this.y, this.w, this.h, this.name)
        this.inpin.forEach(pin => {
            new_cnvs.draw_circle(pin.x, pin.y, pin.r, pin.fill, pin.stroke, 1)
        })

        this.outpin.forEach(pin => {
            new_cnvs.draw_circle(pin.x, pin.y, pin.r, pin.fill, pin.stroke, 1)
        })

    }
}
class PIN extends NODE {
    constructor(x, y, r, name, fill = 'blue', stroke = 'grey') {
        super(x, y, name, fill, stroke)
        this.connected = []
        this.state = 0
        this.r = r
        this.outpin = []
    }
}

class AND extends NODE {
    constructor(x, y, fill = 'brown', stroke = 'grey') {
        super(x, y, 'AND', fill, stroke)
        this.w = 0
        this.h = 0
        this.inpin = []
        this.outpin = []
        this.init(2, 1)
    }
}
class NOT extends NODE {
    constructor(x, y, fill = 'brown', stroke = 'grey') {
        super(x, y, 'AND', fill, stroke)
        this.inpin = []
        this.outpin = []
        this.init(1, 1)
    }
}

class CANVAS {
    draw_circle = (x, y, r, fill, stroke, lwidth) => {
        cnt.lineWidth = lwidth
        cnt.beginPath()
        cnt.strokeStyle = stroke
        cnt.arc(x, y, r, 0, 2 * Math.PI)
        cnt.fillStyle = fill
        cnt.fill()
        cnt.stroke()
    }
    draw_rect = (x, y, fill, stroke, w, h, lwidth) => {

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
    drawline = (x1, y1, x2, y2, pattern, stroke, lwidth) => {
        cnt.beginPath()

        cnt.moveTo(x1, y1)
        cnt.lineTo(x2, y2)
        cnt.lineWidth = lwidth
        cnt.strokeStyle = stroke
        cnt.setLineDash(pattern)
        cnt.stroke()
    }
}

