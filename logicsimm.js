let body = document.getElementsByTagName('body')[0]
let cnvs = document.getElementById('canvas')
let cnt = cnvs.getContext('2d')
let section = document.getElementsByTagName('section')[0]
let menu = document.getElementsByClassName('menu')[0]
let menu_list = document.getElementsByClassName('menu-list')[0]

let button_click = false
let is_mouse_down = false
let mouse_drag = false

let mouse_pos = { x: 0, y: 0 }
let gap = 10
// let mousedist = 0

let wires = []
let node_list = []
let node_selected = []
let line_selected = { start_pos: [], end_pos: [], node: '' }
// let lineNodes = []
let temp_connect = { out_node: '', in_node: '', connector: [] }

cnvs.addEventListener('mousemove', handle_mouse_move)
cnvs.addEventListener('click', handle_click)
cnvs.addEventListener('mousedown', handle_mouse_down)
cnvs.addEventListener('mouseup', handle_mouse_up)
cnvs.addEventListener('contextmenu', handle_right_click)
window.addEventListener('resize', handle_window_resize)
menu.addEventListener('click', handle_menu_press)
menu_list.addEventListener('click', handle_menu_list_press)

window.addEventListener('click', ()=>{(menu_list.style.display == 'none')?menu_list.style.display = 'none':''})

let temp_canvas_class = null
function handle_mouse_move(ev) {
    let newx = ev.offsetX - mouse_pos.x
    let newy = ev.offsetY - mouse_pos.y
    if (node_selected != '') {
        drag_logic(newx, newy)
    }

    if (is_mouse_down && ev.movementX != 0 && ev.movementY != 0) {
        mouse_drag = true
    }
    if (temp_canvas_class == null) temp_canvas_class = new CANVAS
    line_selected = temp_canvas_class.get_line_collision()
    mouse_pos = {
        x: ev.offsetX,
        y: ev.offsetY
    }
}
function toogle_input(ev) {
    console.log(node_list);
    node_list.forEach(node => {
        if (node.collide(ev.offsetX, ev.offsetY) && node.name == 'INPUT') {
            node.toogle_state()
            console.log("node clicked :", node);
        }
    })
}
function handle_click(ev) {
    console.log(is_mouse_down, mouse_drag, node_list);
    console.log(ev.type);
    if (mouse_drag || button_click) {
        node_list.push(...node_selected)
        node_selected = []
    }
    node_selected = []
    if (mouse_drag == false && button_click == false) {
        toogle_input(ev)
        create_connection(ev)
    }
    document.getElementsByClassName('pop-up')[0].style.display = 'none'
    button_click = false
    mouse_drag = false
}
function select_node(ev) {
    let indx = -1
    let s_node = ''
    node_list.forEach((node, index) => {
        if (node.collide(ev.offsetX, ev.offsetY)) {
            indx = index
            s_node = node
        }
    })
    if (indx != -1) {
        node_list[indx] = node_list[node_list.length - 1]
        node_list.pop()
        node_selected.push(s_node)
    }
}
function handle_mouse_down(ev) {
    console.log(is_mouse_down, mouse_drag, node_list);
    console.log(ev.type);
    //check chrome bug
    if (button_click != true) {
        is_mouse_down = true
    }
    if (ev.button == 0) select_node(ev)
    // use is dragging

}
let index = -1
//remove delected from wire
//and from connected elem
function handle_pop_up_click(ev) {
    if (ev.target.innerText == 'DELETE') {
        node_list[index] = node_list[node_list.length - 1]
        node_list.pop()
    } else {
        console.log(ev.target.innerText);
    }
    let pop_elm = document.getElementsByClassName('pop-up')[0]
    pop_elm.removeEventListener('click', handle_node_right_click)
    pop_elm.style.display = 'none'
}
function handle_node_right_click(ev) {
    let pop_elm = document.getElementsByClassName('pop-up')[0]
    pop_elm.addEventListener('click', handle_pop_up_click)

    node_list.forEach((node, x) => {
        if (node.collide(ev.offsetX, ev.offsetY)) {
            pop_elm.style.left = `${ev.x + 5}px`
            pop_elm.style.top = `${ev.y}px`
            pop_elm.style.display = 'flex'
            index = x
        }
    })
}

function handle_mouse_up(ev) {
    console.log(is_mouse_down, mouse_drag, node_list);
    console.log(ev.type);
    // if (is_mouse_down && mouse_drag) {
    node_list.push(...node_selected)
    node_selected = []
    // }
    is_mouse_down = false
    console.log(is_mouse_down);
}

function handle_right_click(ev) {
    ev.preventDefault()
    console.log(ev.type);
    temp_connect = { in_node: '', connector: [], out_node: '' }
    handle_node_right_click(ev)
}

function handle_window_resize(ev) {
    let side_bar = 40
    cnvs.setAttribute('width', `${section.offsetWidth - side_bar}px`)
    cnvs.setAttribute('height', `${section.offsetHeight}px`)
}
handle_window_resize()

function handle_menu_press(ev) {
    menu_list.style.display = (menu_list.style.display == 'block') ? 'none' : 'block';
    menu_list.style.left = `${40}px`
    menu_list.style.top = `${40}px`
    ev.stopPropagation()
}
function handle_menu_list_press(ev) {
    if (ev.target.innerText == 'Save As') {
        save_node_list()
    }else if(ev.target.innerText == 'Library'){
        display_library()
    }

}

let logics = document.getElementsByClassName('box')
for (const logic of logics) {
    logic.addEventListener('click', insert_node)
}

function insert_node(ev) {
    if (button_click && node_selected != '' && (node_selected[0].name != ev.target.innerText)) {
        node_selected = []

    }

    button_click = true

    let side_bar = ev.target.getBoundingClientRect()
    let canvas_area = cnvs.getBoundingClientRect()

    let [x, y] = [0, get_new_y(side_bar.y - canvas_area.y)]

    mouse_pos = { x: x, y: side_bar.y - canvas_area.y }//storing to preventing jumping

    if (ev.target.innerText == 'AND') node_selected.push(new AND(x, y))
    if (ev.target.innerText == 'NOT') node_selected.push(new NOT(x, y))
    if (ev.target.innerText == 'INPUT') node_selected.push(new INPUT(x, y))
    if (ev.target.innerText == 'OUTPUT') node_selected.push(new OUTPUT(x, y))
    if (ev.target.innerText == 'CUSTOM') node_selected.push(new CUSTOM(x, y))
    
    // arrangelogic(selectedlogic, x
}

const get_new_y = (y) => {
    let last_node = y
    node_selected.forEach((node, x) => {
        if (node.name == ('INPUT') || node.name == ('OUTPUT')) {
            last_node = node.bottom + (gap * 3)
        } else {
            last_node = node.bottom + (gap)
        }
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
        this.id = ''
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
        this.randId();
    }
    randId () {
        let result = ''
        let array = [1, 2, 3, 4, 5, 6,7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f']
        for (let xx = 0; xx < 6; xx++) {
            result += array[Math.floor(Math.random() * array.length)]
        } 
        this.id = result
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
            this.inpin.push(new PIN(this, 0, 0, r, 'IN', this.fill, this.stroke,))
        }
        for (let x = 0; x < outpin_len; x++) {
            this.outpin.push(new PIN(this, 0, 0, r, 'OUT', this.fill, this.stroke,))
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
    toJSON () {
        return {
            id: this.id,
            name: this.name,
            custom_name: this.custom_name,
            x: this.x,
            y: this.y,
            top: this.top,
            bottom: this.bottom,
            left: this.left,
            right: this.right,
            stroke: this.stroke,
            fill: this.fill,
            w: this.w,
            h: this.h,
            inpin: this.inpin,
            outpin: this.outpin,
            outlet: this.outlet,
            inlet: this.inlet,
            is_evaluated: false,
        }
    }
    
}
class PIN extends NODE {
    constructor(parent, x, y, r, name, fill = 'blue', stroke = 'grey') {
        super(x, y, name, fill, stroke)
        this.parent = parent
        this.connected_nodes = []
        this.state = 0
        this.r = r
        this.outpin = []
    }
    toJSON = ()=>{
        return{
            ...super.toJSON(),
            parent : this.parent.id,
            state : this.state,
            connected_nodes : this.ret(),
            
        }
    }
    ret (){
        let idArray = []
        for (let xx = 0; xx < this.connected_nodes.length; xx++) {

            idArray.push(this.connected_nodes[xx].id)
        }
        return idArray
    }
    collide = (cx, cy) => {
        let dx = cx - this.x
        let dy = cy - this.y
        let dist = dx * dx + dy * dy//2 *2 + 4*4

        return (dist < ((this.r + 5) * (this.r + 5))) ? true : false
    }
}

class AND extends NODE {

    constructor(x, y, fill = 'brown', stroke = 'grey') {
        super(x, y, 'AND', fill, stroke)
        this.w = 0
        this.h = 0
        this.inpin = []
        this.outpin = []
        this.is_evaluated = false
        this.init(2, 1)
    }
    evaluate = () => {
        this.outpin[0].state = (this.inpin[0].state == 1 && this.inpin[1].state == 1) ? 1 : 0;
        console.log('and', this.outpin[0].state);
    }
}
class NOT extends NODE {
    constructor(x, y, fill = 'green', stroke = 'indigo') {
        super(x, y, 'NOT', fill, stroke)
        this.w = 0
        this.h = 0
        this.inpin = []
        this.outpin = []
        this.is_evaluated = false
        this.init(1, 1)
    }
    evaluate = () => {
        this.outpin[0].state = (this.inpin[0].state == 0) ? 1 : 0;
        console.log('not', this.outpin[0].state);
    }
}
class INPUT extends NODE {
    constructor(x, y, name = 'INPUT', fill = 'blue', stroke = 'white') {
        super(x, y, name, fill, stroke)
        this.state = 0
        this.r = 20
        this.gap = 40
        this.outlet = ''
        this.init()
    }
    toogle_state = () => {
        this.state = (this.state == 0) ? 1 : 0;
        console.log(this.state);
        this.fill = (this.state == 0) ? 'blue' : 'red';
        this.outlet.state = this.state
        evaluate_node_list()

        evaluate_node_list()

    }
    init = () => {
        this.outlet = new PIN(this, 0, 0, 6, 'OUTLET', this.fill, this.stroke)
        this.outlet_pos()
        this.calculate_bounding_rect()
        this.draw()
    }
    outlet_pos = () => {
        let x = this.x + this.gap
        let y = this.y
        this.outlet.x = x
        this.outlet.y = y
    }
    draw = () => {
        let new_cnvs = new CANVAS
        let sc = this.outlet
        new_cnvs.draw_circle(this.x, this.y, this.r, this.fill, this.stroke, 1)
        new_cnvs.draw_line((this.x + (this.gap / 2)), this.y, sc.x, this.y, [], this.fill, 1)

        new_cnvs.draw_circle(sc.x, sc.y, sc.r, sc.fill, sc.stroke, 1)
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
class OUTPUT extends NODE {
    constructor(x, y, name = 'OUTPUT', fill = 'blue', stroke = 'white') {
        super(x, y, name, fill, stroke)
        this.state = 0
        this.r = 20
        this.gap = 40
        this.inlet = ''
        this.init()
    }
    init = () => {
        this.inlet = new PIN(this, 0, 0, 6, 'INLET', this.fill, this.stroke)
        this.inlet_pos()
        this.calculate_bounding_rect()
        this.draw()
    }
    inlet_pos = () => {
        let x = this.x - this.gap
        let y = this.y
        this.inlet.x = x
        this.inlet.y = y

    }
    draw = () => {
        let new_cnvs = new CANVAS
        let sc = this.inlet
        this.state = sc.state
        let fill = (this.state == 0) ? 'blue' : 'red';
        new_cnvs.draw_line(this.x, this.y, sc.x, this.y, [], fill, 1)
        new_cnvs.draw_circle(this.x, this.y, this.r, fill, this.stroke)

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
        this.inlet_pos()
    }
    collide = (cx, cy) => {
        let dx = cx - this.x
        let dy = cy - this.y
        let dist = dx * dx + dy * dy//2 *2 + 4*4

        return (dist < (this.r * this.r)) ? true : false
    }
}
//another name for group
class CUSTOM extends NODE {
    constructor(name, fill, stroke, node_lst) {
        super(0, 0, 'CUSTOM', fill, stroke)
        this.custom_name = name
        this.w = 0
        this.h = 0
        this.inpin = []
        this.outpin = []

    }
    init = (node_lst) => {
        let r = 6
        //touch this
        let inpins = node_list.filter(node => node.name == 'INPUT')
        let outpins = node_list.filter(node => node.name == 'OUTPUT')

        let pin_count = Math.max(inpins.length, outpins.length)
        this.w = 80
        this.h = (pin_count * (r * 3)) + (gap * (pin_count + 1))
        // this.calculate_bounding_rect()
        // this.calculate_pin_pos(inpin_len, outpin_len, r)
        // this.draw()
    }

}
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
}

const save_node_list = () => {
    if (node_list == '') return
    if (!node_list.some(node => node.name == 'INPUT')) return
    if (!node_list.some(node => node.name == 'OUTPUT')) return

    let name = prompt('Enter Descriptive Name For Chip maxlength(10):')
    if (name != '' && name.length <= 10) {

        localStorage.setItem(name, JSON.stringify(node_list))

    } else {
        save_node_list()
    }
}

const display_library = () =>{
    let modal = document.getElementsByClassName('modal-container')[0]
    modal.classList.toggle("toggle-modal")
    let container = document.getElementsByClassName('chips-container')[0]
    for (let cc = 0; cc < localStorage.length; cc++) {
        const key = localStorage.key(cc);
        let elm = document.createElement('article')
        elm.classList.add('chips')
        elm.innerHTML = key
        container.appendChild(elm)
    }

}
const reset_node_evaluation_state = () => {
    node_list.forEach(node => {
        if (node.name == 'AND' || node.name == 'NOT') node.is_evaluated = false
    })
}

const node_clicked = (ev) => {
    let node_clk = ''
    node_list.forEach(node => {
        if (node.name == 'INPUT') {
            if (node.outlet.collide(ev.offsetX, ev.offsetY)) node_clk = node.outlet
        } else if (node.name == 'OUTPUT') {
            if (node.inlet.collide(ev.offsetX, ev.offsetY)) node_clk = node.inlet
        } else {
            node.inpin.forEach(pin => {
                if (pin.collide(ev.offsetX, ev.offsetY)) node_clk = pin
            })
            node.outpin.forEach(pin => {
                if (pin.collide(ev.offsetX, ev.offsetY)) node_clk = pin
            })
        }
    })
    return node_clk;
}

const connect_rules = (node_a, node_b, container) => {
    let can_connect = false
    if (node_a.name == 'OUTLET' && node_b.name == 'IN' && container.in_node == '') {
        can_connect = true
        console.log(0);
    } else if (node_a.name == 'OUT' && node_b.name == 'IN' && container.in_node == '') {
        can_connect = true
        console.log(1);
    } else if (node_a.name == 'OUT' && node_b.name == 'INLET' && container.in_node == '') {
        can_connect = true
        console.log(2);
    } else if ((node_a.name == 'OUTLET' || node_a.name == 'OUT') && container.out_node == '') {
        can_connect = true
        console.log(3);
    } else if ((node_b.name == 'INLET' || node_b.name == 'IN') && container.in_node == '') {
        can_connect = true
        console.log(4);
    } console.log("can_connect :", can_connect, node_a.name, node_b.name);
    return can_connect
}

const create_connection = (ev) => {
    let node = node_clicked(ev)
    console.log(node.name, node.x, node.y);
    if (node) {
        if (connect_rules(node, temp_connect.in_node, temp_connect)) {
            temp_connect.out_node = node
        } else if (connect_rules(temp_connect.out_node, node, temp_connect)) {
            temp_connect.in_node = node
        }
    }
    console.log(temp_connect);
    //make sure it not under any logic
    if (node == '' && line_selected.start_pos == '' && !node_list.some((node) => node.collide(ev.offsetX, ev.offsetY))) {
        if (temp_connect.out_node) {
            temp_connect.connector.push([ev.offsetX, ev.offsetY])
        } else if (temp_connect.in_node) {
            temp_connect.connector = temp_connect.connector.reverse()
            temp_connect.connector.push([ev.offsetX, ev.offsetY])
            temp_connect.connector = temp_connect.connector.reverse()
        }
    }

    if (node == '' && line_selected.start_pos != '') {
        if (temp_connect.out_node) {//make sure it connect to mutiple wire whn it has mutilpe
            temp_connect.connector.push([ev.offsetX, ev.offsetY])

            update_connector(line_selected.node.connector, line_selected.end_pos, frm = true)
            temp_connect.in_node = line_selected.node.in_node
        } else if (temp_connect.in_node) {

            temp_connect.out_node = line_selected.node.out_node
            let temp = temp_connect.connector
            temp_connect.connector = []
            update_connector(line_selected.node.connector, line_selected.start_pos,)
            temp_connect.connector.push([ev.offsetX, ev.offsetY])
            temp_connect.connector.push(...temp)

        } else if (temp_connect.out_node == '' && temp_connect.in_node == '') {
            temp_connect.out_node = line_selected.node.out_node
            update_connector(line_selected.node.connector, line_selected.start_pos,)
            temp_connect.connector.push([ev.offsetX, ev.offsetY])
        }
    }
    if (temp_connect.out_node && temp_connect.in_node) {
        connect_node()
        wires.push(clone_temp_connect(temp_connect))
        console.log(temp_connect);
        temp_connect = { out_node: '', connector: [], in_node: '' }
        evaluate_node_list()
        evaluate_node_list()
        // console.log(node_list);
    }
}

const evaluate_node_list = (array = []) => {
    let start_node = []
    let pins = []
    if (array != '') {
        start_node = array
        start_node.forEach(node => pins.push(...node.outpin))
    } else {
        start_node = node_list.filter(node => node.name == 'INPUT')
        start_node.forEach(node => pins.push(node.outlet))
    }
    let next_node = []
    pins.forEach(pin => {
        if (pin.parent.name == 'AND' || pin.parent.name == 'NOT') pin.parent.evaluate()
        pin.connected_nodes.forEach(node => {
            node.state = pin.state
            console.log(`${pin.name}:`, node.state, array.length);
            if (next_node.every(logic => logic != node.parent)
                && !node.parent.is_evaluated && node.parent.name != 'OUTPUT') {
                next_node.push(node.parent)
            }
            node.parent.is_evaluated = true
        })
    })
    // node_list.forEach(node =>{
    //     if(node.name == 'AND' || node.name == 'NOT') node.evaluate()
    // })
    if (next_node != '') {
        evaluate_node_list(next_node)
    }
    reset_node_evaluation_state()
}

const update_connector = (connector, elm, frm = false) => {
    let index = connector.findIndex(e => e[0] == elm[0] && e[1] == elm[1])

    let x = 0
    let end = 0
    if (frm) {
        x = index
        end = connector.length
    } else {
        end = index + 1
    }
    // console.log(index, frm, x, end);
    if (index >= 0) {
        for (x; x < end; x++) {
            temp_connect.connector.push(connector[x])
        }
    }
}

const connect_node = () => {
    temp_connect.out_node.connected_nodes.push(temp_connect.in_node)
}

const clone_temp_connect = (obj) => {
    let temp = { out_node: '', connector: [], in_node: '' }
    temp.out_node = obj.out_node
    temp.connector = obj.connector
    temp.in_node = obj.in_node
    return temp
}

const render = () => {
    cnt.clearRect(0, 0, cnt.canvas.width, cnt.canvas.height)

    if (temp_canvas_class != null) temp_canvas_class.draw_wires()
    node_list.forEach(node => {
        node.draw()
    })
    node_selected.forEach(node => {
        node.draw()
    })
    requestAnimationFrame(render)
}
render()