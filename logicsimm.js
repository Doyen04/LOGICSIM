let body = document.getElementsByTagName('body')[0]
let cnvs = document.getElementById('canvas')
let cnt = cnvs.getContext('2d')
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

function handle_mouse_move(ev) {

    let newx = ev.offsetX - mouse_pos.x
    let newy = ev.offsetY - mouse_pos.y
    if (node_selected != '') {
        drag_logic(newx, newy)
    }

    if (is_mouse_down) {
        mouse_drag = true
    }
    // selectedline = mouseinline()
    mouse_pos = {
        x: ev.offsetX,
        y: ev.offsetY
    }
}

function handle_click(ev) {
    console.log(ev.type);
    node_list.push(...node_selected)
    node_selected = []
    // match = [[], []]

    if (mouse_drag == false && button_click == false) {
        // toogleinput(ev)
        // completeconnection(ev)
    }
    button_click = false
    mouse_drag = false

}
function select_node(ev) {
    node_list.forEach(node => {
        if (node.collide(ev.offsetX, ev.offsetY)) node_selected.push(node)
    })
}
function handle_mouse_down(ev) {
    console.log(ev.type);
    //check chrome bug
    if (button_click != true) {
        is_mouse_down = true
    }
    if (ev.button == 0) select_node(ev)
    // use is dragging

}

function handle_node_right_click(ev) {
    let clicked_node = ''
    node_list.forEach(node => {
        if (node.collide(ev.offsetX, ev.offsetY)) {
            let pop_elm = document.getElementsByClassName('pop-up')[0]
            pop_elm.style.left = `${ev.x + 5}px`
            pop_elm.style.top = `${ev.y}px`
            pop_elm.style.display = 'flex'
            pop_elm.addEventListener('click', handle_pop_up_click)
            clicked_node = node
        }
    })
    function handle_pop_up_click(ev) {
        if (ev.target.innerText == 'DELETE') {
            console.log(node_list.length);
            let index = node_list.indexOf(clicked_node)
            node_list[index] = node_list[node_list.length - 1]
            node_list.pop()
        } else {
            console.log(ev.target.innerText);
        }
        document.getElementsByClassName('pop-up')[0].style.display = 'none'
    }
}

function handle_mouse_up(ev) {
    console.log(ev.type);
    if (is_mouse_down) {
        node_list.push(...node_selected)
        node_selected = []
    }
    is_mouse_down = false
}

function handle_right_click(ev) {
    ev.preventDefault()
    console.log(ev.type);
    // toconnect = { frm: '', bridge: [], to: '' }
    handle_node_right_click(ev)
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

    let side_bar = ev.target.getBoundingClientRect()
    let canvas_area = cnvs.getBoundingClientRect()

    let [x, y] = [0, get_new_y(side_bar.y - canvas_area.y)]

    mouse_pos = { x: x, y: side_bar.y - canvas_area.y }//storing to preventing jumping

    if (ev.target.innerText == 'AND') node_selected.push(new AND(x, y))
    if (ev.target.innerText == 'NOT') node_selected.push(new NOT(x, y))
    if (ev.target.innerText == 'IN') node_selected.push(new INPUT(x, y))
    // arrangelogic(selectedlogic, x
}
const get_new_y = (y) => {
    let last_node = y
    node_selected.forEach((node, x) => {
        last_node = node.bottom + (gap)
    })
    return last_node
}

const drag_logic = (cx, cy) => {
    node_selected.forEach(node => {
        node.move(cx, cy)
    })
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
    collide = (cx, cy) => {
        if (cx > this.x && cy > this.y &&
            cx < (this.right) && cy < (this.bottom)) {
            return true
        } else {
            return false
        }
    }
    move = (cx, cy) => {
        this.x += cx
        this.y += cy
        this.calculate_bounding_rect()
        this.calculate_pin_pos(this.inpin.length, this.outpin.length, 6)
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
        this.calculate_bounding_rect()
        this.calculate_pin_pos(inpin_len, outpin_len, r)
        this.draw()
    }
    calculate_pin_pos = (inpin_len, outpin_len, r) => {
        let in_y = this.space_evenly(this.y, (this.y + this.h), inpin_len, r)
        let out_y = this.space_evenly(this.y, (this.y + this.h), outpin_len, r)

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
    constructor(x, y, fill = 'green', stroke = 'indigo') {
        super(x, y, 'NOT', fill, stroke)
        this.w = 0
        this.h = 0
        this.inpin = []
        this.outpin = []
        this.init(1, 1)
    }
}
class INPUT extends NODE {
    constructor(x, y, name = 'INPUT', fill = 'blue', stroke = 'white') {
        super(x, y, name, fill, stroke)
        this.state = 0
        this.r = 20
        this.gap = 40
        this.outlet = ''
        this.outlet_pos()
    }
    outlet_pos = () => {
        let x = this.x + this.gap
        let y = this.y
        this.outlet = new PIN(x, y, 6, '', this.fill, this.stroke)
    }
    draw = () => {
        let new_cnvs = new CANVAS
        let sc = this.outlet
        new_cnvs.draw_circle(this.x, this.y, this.r, this.fill, this.stroke)
        new_cnvs.draw_line((this.x + (this.gap / 2)), this.y, sc.x, this.y, [], this.fill, 1)

        new_cnvs.draw_circle(sc.x, sc.y, sc.r, sc.fill, sc.stroke)
    }
    calculate_bounding_rect = () => {
        this.bottom = Math.floor(this.y + this.r)
        this.top = Math.floor(this.y - this.r)
        this.left = Math.floor(this.x - this.r)
        this.right = Math.floor(this.x + this.r)
    }
    move = (cx, cy) => {
        this.x += cx
        this.y += cy
        this.calculate_bounding_rect()
        this.outlet_pos()
    }
    collide = (cx, cy) => {
        let dx = cx - this.x
        let dy = cy - this.y
        let dist = dx * dx + dy * dy//2 *2 + 4*4

        return (dist < (this.r * this.r)) ? true : false
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
    draw_line = (x1, y1, x2, y2, pattern, stroke, lwidth) => {
        cnt.beginPath()

        cnt.moveTo(x1, y1)
        cnt.lineTo(x2, y2)
        cnt.lineWidth = lwidth
        cnt.strokeStyle = stroke
        cnt.setLineDash(pattern)
        cnt.stroke()
    }
}


const render = () => {
    cnt.clearRect(0, 0, cnt.canvas.width, cnt.canvas.height)

    node_list.forEach(node => {
        node.draw()
    })
    node_selected.forEach(node => {
        node.draw()
    })
    requestAnimationFrame(render)
}
render()