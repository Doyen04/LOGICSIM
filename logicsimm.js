let body = document.getElementsByTagName('body')[0]
let cnvs = document.getElementById('canvas')
let cnt = canvas.getcnt('2d')
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
    init = (inpin_len, outpin_len) => {

    }
    space_evenly = () => {

    }
    draw = () => {

    }
}
class PIN extends NODE {
    constructor(x, y, fill = 'blue', stroke = 'grey') {
        super(x, y, 'INPUT', fill, stroke)
        this.connected = []
        this.outpin = []
    }
}

class AND extends NODE {
    constructor(x, y, fill = 'brown', stroke = 'grey') {
        super(x, y, 'AND', fill, stroke)
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
    draw_circle = (x,y,r,fill,stroke) => {
        cnt.lineWidth = 1
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