import { canvas } from "./canvas.js"


class Node {
    r = 6
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
        this.generateRandomId();
    }
    generateRandomId() {
        let result = ''
        let array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f']
        for (let xx = 0; xx < 6; xx++) {
            result += array[Math.floor(Math.random() * array.length)]
        }
        this.id = result
    }
    isColliding(cx, cy) {
        if (cx > this.x && cy > this.y &&
            cx < (this.right) && cy < (this.bottom)) {
            return true
        } else {
            return false
        }
    }
    move(cx, cy) {
        this.x += cx
        this.y += cy
        this.calculateBoundingBox()
        this.calculatePinPositions(this.inpin.length, this.outpin.length, 6)
    }
    calculateBoundingBox() {
        this.bottom = Math.floor(this.y + this.h)
        this.top = Math.floor(this.y)
        this.left = Math.floor(this.x)
        this.right = Math.floor(this.x + this.w)
    }
    init(inpin_len, outpin_len) {
        let r = this.r
        for (let x = 0; x < inpin_len; x++) {
            this.inpin.push(new ConnectionPin(this, 0, 0, r, 'IN', this.fill, this.stroke,))
        }
        for (let x = 0; x < outpin_len; x++) {
            this.outpin.push(new ConnectionPin(this, 0, 0, r, 'OUT', this.fill, this.stroke,))
        }

        this.calculateBoundingBox()
        this.calculatePinPositions(inpin_len, outpin_len, r)
        this.renderNode()
    }

    calculatePinPositions(inpin_len, outpin_len, r) {
        let in_y = this.distributeEvenly(this.y, (this.y + this.h), inpin_len, r)
        let out_y = this.distributeEvenly(this.y, (this.y + this.h), outpin_len, r)

        this.inpin.forEach((pin, x) => {
            pin.x = this.x
            pin.y = in_y[x]
        });
        this.outpin.forEach((pin, x) => {
            pin.x = this.x + this.w
            pin.y = out_y[x]
        });
    }
    distributeEvenly(y1, y2, len, r) {
        let coord = []
        let spacing = (((y2 - y1) - ((r * 2) * len)) / (len + 1))
        for (let x = 0; x < len; x++) {
            let y = 0
            y = y1 + spacing + (spacing * x) + ((r * 2) * x) + r
            coord.push(y)
        } return coord
    }
    renderNode() {
        let new_cnvs = canvas
        new_cnvs.drawRectangle(this.x, this.y, this.fill, this.stroke, this.w, this.h, 1)
        new_cnvs.drawText(this.x, this.y, this.w, this.h, this.name)
        this.inpin.forEach(pin => {
            new_cnvs.drawCircle(pin.x, pin.y, pin.r, pin.fill, pin.stroke, 1)
        })

        this.outpin.forEach(pin => {
            new_cnvs.drawCircle(pin.x, pin.y, pin.r, pin.fill, pin.stroke, 1)
        })

    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            stroke: this.stroke,
            fill: this.fill,
        }
    }

}

class ConnectionPin extends Node {
    constructor(parent, x, y, r, name, fill = 'blue', stroke = 'grey') {
        super(x, y, name, fill, stroke)
        this.parent = parent
        this.connected_nodes = []
        this.state = 0
        this.r = r
        // this.outpin = []
    }
    toJSON() {
        // Check if this pin is an outpin
        const isOutPin = ((this.parent.outlet == this) || this.parent.outpin?.includes(this))
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            r: this.r,
            state: this.state,
            ...(isOutPin && { connected_nodes: this.connected_nodes.map(node => node.id) }), // Include connected_nodes only for outpins
        };
    }
    collide(cx, cy) {
        let dx = cx - this.x
        let dy = cy - this.y
        let dist = dx * dx + dy * dy//2 *2 + 4*4

        return (dist < ((this.r + 5) * (this.r + 5))) ? true : false
    }
}

class AndGate extends Node {

    constructor(x, y, fill = 'brown', stroke = 'grey') {
        super(x, y, 'AND', fill, stroke)
        this.w = 80
        this.h = 40
        this.inpin = []
        this.outpin = []
        this.is_evaluated = false
        this.init(2, 1)
    }
    evaluate() {
        this.outpin[0].state = (this.inpin[0].state == 1 && this.inpin[1].state == 1) ? 1 : 0;
        console.log('and', this.outpin[0].state);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            w: this.w,
            h: this.h,
            inpin: this.inpin.map(pin => pin.toJSON()), // Serialize pins
            outpin: this.outpin.map(pin => pin.toJSON()), //
        }
    }

}

class NotGate extends Node {
    constructor(x, y, fill = 'green', stroke = 'indigo') {
        super(x, y, 'NOT', fill, stroke)
        this.w = 80
        this.h = 40
        this.inpin = []
        this.outpin = []
        this.is_evaluated = false
        this.init(1, 1)
    }
    evaluate() {
        this.outpin[0].state = (this.inpin[0].state == 0) ? 1 : 0;
        console.log('not', this.outpin[0].state);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            w: this.w,
            h: this.h,
            inpin: this.inpin.map(pin => pin.toJSON()), // Serialize pins
            outpin: this.outpin.map(pin => pin.toJSON()), //
        }
    }

}

class InputGate extends Node {
    constructor(x, y, name = 'INPUT', fill = 'blue', stroke = 'white') {
        super(x, y, name, fill, stroke)
        this.state = 0
        this.r = 20
        this.gap = 40
        this.outlet = ''
        this.init()
    }
    toogle_state() {
        this.state = (this.state == 0) ? 1 : 0;
        console.log(this.state);
        this.fill = (this.state == 0) ? 'blue' : 'red';
        this.outlet.state = this.state

        //need to evaluate to calculate circuilt twice
        // evaluate_node_list()
        // evaluate_node_list()

    }

    init() {
        this.outlet = new ConnectionPin(this, 0, 0, 6, 'OUTLET', this.fill, this.stroke)
        this.outlet_pos()
        this.calculateBoundingBox()
        this.renderNode()
    }
    outlet_pos() {
        let x = this.x + this.gap
        let y = this.y
        this.outlet.x = x
        this.outlet.y = y
    }

    renderNode() {
        let new_cnvs = canvas
        let sc = this.outlet
        new_cnvs.drawCircle(this.x, this.y, this.r, this.fill, this.stroke, 1)
        new_cnvs.drawLine((this.x + (this.gap / 2)), this.y, sc.x, this.y, [], this.fill, 1)

        new_cnvs.drawCircle(sc.x, sc.y, sc.r, sc.fill, sc.stroke, 1)
    }
    calculateBoundingBox() {
        this.bottom = Math.floor(this.y + this.r)
        this.top = Math.floor(this.y - this.r)
        this.left = Math.floor(this.x - this.r)
        this.right = Math.floor(this.x + this.r)
    }
    move(cx, cy) {
        this.x += cx
        this.y += cy
        this.calculateBoundingBox()
        this.outlet_pos()
    }
    collide(cx, cy) {
        let dx = cx - this.x
        let dy = cy - this.y
        let dist = dx * dx + dy * dy//2 *2 + 4*4

        return (dist < (this.r * this.r)) ? true : false
    }
    toJSON() {
        return {
            ...super.toJSON(), // Include properties from the parent class
            state: this.state, // Add additional properties specific to InputGate
            outlet: this.outlet.toJSON(), // Serialize pins
            r: this.r,
            gap: this.gap
        };
    }
}

// Remove all arrow function because they don't work well with inheritance
class OutputGate extends Node {
    constructor(x, y, name = 'OUTPUT', fill = 'blue', stroke = 'white') {
        super(x, y, name, fill, stroke)
        this.state = 0
        this.r = 20
        this.gap = 40
        this.inlet = ''
        this.init()
    }
    init() {
        this.inlet = new ConnectionPin(this, 0, 0, 6, 'INLET', this.fill, this.stroke)
        this.inlet_pos()
        this.calculateBoundingBox()
        this.renderNode()
    }
    inlet_pos() {
        let x = this.x - this.gap
        let y = this.y
        this.inlet.x = x
        this.inlet.y = y

    }
    renderNode() {
        let new_cnvs = canvas
        let sc = this.inlet
        this.state = sc.state
        let fill = (this.state == 0) ? 'blue' : 'red';
        new_cnvs.drawLine(this.x, this.y, sc.x, this.y, [], fill, 1)
        new_cnvs.drawCircle(this.x, this.y, this.r, fill, this.stroke)

        new_cnvs.drawCircle(sc.x, sc.y, sc.r, sc.fill, sc.stroke)
    }
    calculateBoundingBox() {
        this.bottom = Math.floor(this.y + this.r)
        this.top = Math.floor(this.y - this.r)
        this.left = Math.floor(this.x - this.r)
        this.right = Math.floor(this.x + this.r)
    }
    move(cx, cy) {
        this.x += cx
        this.y += cy
        this.calculateBoundingBox()
        this.inlet_pos()
    }
    collide(cx, cy) {
        let dx = cx - this.x
        let dy = cy - this.y
        let dist = dx * dx + dy * dy//2 *2 + 4*4

        return (dist < (this.r * this.r)) ? true : false
    }
    toJSON() {
        return {
            ...super.toJSON(), // Include properties from the parent class
            state: this.state, // Add additional properties specific to InputGate
            inlet: this.inlet.toJSON(), // Serialize pins
            r: this.r,
            gap: this.gap
        };
    }
}

class CompoundGate extends Node {
    constructor(x, y, name, fill, stroke) {
        super(x, y, name, fill, stroke)
        this.w = 0
        this.h = 0
        this.inpin = []
        this.outpin = []
        this.is_evaluated = false
        this.init()
    }
    init() {
        super.init()
        const inpinLen = this.calculateInpinLen()
        const outpinLen = this.calculateOutpinLen()
        this.w = this.calculateWidth()
        this.h = this.calculateHeight(inpinLen, outpinLen)
        super.init(inpinLen, outpinLen)
    }
    calculateHeight(inpinLen, outpinLen) {
        let horizontalGap = 8
        let pinLen = Math.max(inpinLen, outpinLen)
        return (((this.r * 2) * pinLen) + (horizontalGap * (pinLen + 1)))
    }
    calculateWidth() {
        let padding = 20
        let canvasElement = document.querySelector('#canvas')
        let canvasContext = canvasElement.getContext('2d')
        let text = canvasContext.measureText(this.name)
        return (padding + text.width + padding)
    }

    calculateInpinLen() {
        let circuitObject = JSON.parse(localStorage.getItem(this.name))
        let inputArray = Array.from(circuitObject['nodes']).filter(node => node.name == 'INPUT');
        return inputArray.length
    }
    calculateOutpinLen() {
        let circuitObject = JSON.parse(localStorage.getItem(this.name))
        let outputArray = Array.from(circuitObject['nodes']).filter(node => node.name == 'OUTPUT');
        return outputArray.length
    }

}

export { AndGate, NotGate, InputGate, OutputGate, CompoundGate };