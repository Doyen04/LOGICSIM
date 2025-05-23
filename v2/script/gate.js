import { canvas } from "./canvas.js"
import { chipset, connection } from "./class.js"
import { evaluateChip } from "./util.js"


class Node {
    RADIUS = 6
    constructor(x, y, name, fill, stroke) {
        this.id = ''
        this.name = name
        this.customName = name
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
    overrideId(id) {
        this.id = id
    }
    generateRandomId() {
        let result = ''
        let array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f']
        for (let xx = 0; xx < 6; xx++) {
            result += array[Math.floor(Math.random() * array.length)]
        }
        this.id = result
    }
    randomColor() {
        let result = '#'
        let array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f']
        for (let xx = 0; xx < 6; xx++) {
            result += array[Math.floor(Math.random() * array.length)]
        }
        return result;
    }
    collide(cx, cy) {
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
        this.pinPositions()
    }
    calculateBoundingBox() {
        this.bottom = Math.floor(this.y + this.h)
        this.top = Math.floor(this.y)
        this.left = Math.floor(this.x)
        this.right = Math.floor(this.x + this.w)
    }

    calculatePinPositions(inpin_len, outpin_len, r) {
        let in_y = this.distributeEvenly(this.y, (this.y + this.h), inpin_len, r)
        let out_y = this.distributeEvenly(this.y, (this.y + this.h), outpin_len, r)
        return [in_y, out_y]
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
    draw() {
        canvas.drawRectangle(this.x, this.y, this.fill, this.stroke, this.w, this.h, 1)
        canvas.drawText(this.x, this.y, this.w, this.h, this.customName)
    }
    changeColor(string) {

        if (string != 'random') {
            if (string == 'green') this.fill = '#008000'
            if (string == 'blue') this.fill = '#0000ff'
            if (string == 'yellow') this.fill = '#ff0'
        } else if (string == 'random') {
            this.fill = this.randomColor()
        }
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            customName: this.customName,
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
        this.hint = 'pin'
        this.wireStroke = '#000000'
        // this.outpin = []
    }
    toJSON() {
        //would have problem with compund
        // Check if this pin is an outpin
        // const isOutPin = (this.parent.outpin == this)
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            r: this.r,
            state: 0,
            wireStroke: this.wireStroke,
            connected_nodes: this.connected_nodes.map(node => node.id), // Include connected_nodes only for outpins
        };
    }
    draw() {
        canvas.drawCircle(this.x, this.y, this.r, this.fill, this.stroke, 1)
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
        this.outpin = ''
        this.init()
    }
    evaluate() {
        this.outpin.state = (this.inpin[0].state == 1 && this.inpin[1].state == 1) ? 1 : 0;
        this.outpin.connected_nodes.forEach(node => {
            node.state = this.outpin.state
        })
    }
    init() {
        let r = this.RADIUS
        for (let x = 0; x < 2; x++) {
            this.inpin.push(new ConnectionPin(this, 0, 0, r, 'IN', this.fill, this.stroke,))
        }
        this.outpin = new ConnectionPin(this, 0, 0, r, 'OUT', this.fill, this.stroke,)

        this.calculateBoundingBox()
        this.pinPositions()
        // this.renderNode()
    }
    pinPositions() {
        let [inYList, outYList] = this.calculatePinPositions(2, 1, this.RADIUS)
        this.inpin.forEach((pin, x) => {
            pin.x = this.x
            pin.y = inYList[x]
        });

        this.outpin.x = this.x + this.w
        this.outpin.y = outYList[0]

    }
    renderNode() {
        this.draw()
        this.inpin.forEach(pin => { pin.draw() })
        this.outpin.draw()
    }
    toJSON() {
        return {
            ...super.toJSON(),
            w: this.w,
            h: this.h,
            inpin: this.inpin.map(pin => pin.toJSON()), // Serialize pins
            outpin: this.outpin.toJSON(), //
        }
    }

}

class NotGate extends Node {
    constructor(x, y, fill = 'green', stroke = 'indigo') {
        super(x, y, 'NOT', fill, stroke)
        this.w = 80
        this.h = 40
        this.inpin = ''
        this.outpin = ''
        this.init()
    }
    evaluate() {
        this.outpin.state = (this.inpin.state == 0) ? 1 : 0;
        this.outpin.connected_nodes.forEach(node => {
            node.state = this.outpin.state
        })
    }
    init() {
        let r = this.RADIUS
        this.inpin = new ConnectionPin(this, 0, 0, r, 'IN', this.fill, this.stroke,)
        this.outpin = new ConnectionPin(this, 0, 0, r, 'OUT', this.fill, this.stroke,)

        this.calculateBoundingBox()
        this.pinPositions()
        // this.renderNode()

    }
    pinPositions() {
        let [inYList, outYList] = this.calculatePinPositions(1, 1, this.RADIUS)

        this.inpin.x = this.x
        this.inpin.y = inYList[0]

        this.outpin.x = this.x + this.w
        this.outpin.y = outYList[0]
    }
    renderNode() {
        this.draw()
        this.inpin.draw()
        this.outpin.draw()
    }
    toJSON() {
        return {
            ...super.toJSON(),
            w: this.w,
            h: this.h,
            inpin: this.inpin.toJSON(), // Serialize pins
            outpin: this.outpin.toJSON(), //
        }
    }

}

class InputGate extends Node {
    constructor(x, y, name = 'INPUT', fill = 'blue', stroke = 'white') {
        super(x, y, name, fill, stroke)
        this.state = 0
        this.r = 20
        this.gap = 40
        this.outpin = ''
        this.init()
    }
    toogle_state() {
        this.state = (this.state == 0) ? 1 : 0;
        this.outpin.state = this.state

        evaluateChip(chipset[0])
    }
    evaluate() {
        this.outpin.state = this.state
        this.outpin.connected_nodes.forEach(node => {
            node.state = this.state
        })
    }

    init() {
        this.outpin = new ConnectionPin(this, 0, 0, 6, 'OUT', this.fill, this.stroke)
        this.outpin_pos()
        this.calculateBoundingBox()
        // this.renderNode()
    }
    outpin_pos() {
        let x = this.x + this.gap
        let y = this.y
        this.outpin.x = x
        this.outpin.y = y
    }

    renderNode() {
        let fill = (this.state == 0) ? this.fill : 'red';
        canvas.drawCircle(this.x, this.y, this.r, fill, this.stroke, 1)
        canvas.drawLine((this.x + (this.gap / 2)), this.y, this.outpin.x, this.y, [], this.fill, 1)
        this.outpin.draw()
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
        this.outpin_pos()
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
            state: 0, // Add additional properties specific to InputGate
            outpin: this.outpin.toJSON(), // Serialize pins
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
        this.inpin = ''
        this.init()
    }
    init() {
        this.inpin = new ConnectionPin(this, 0, 0, 6, 'IN', this.fill, this.stroke)
        this.inpin_pos()
        this.calculateBoundingBox()
        // this.renderNode()
    }
    inpin_pos() {
        let x = this.x - this.gap
        let y = this.y
        this.inpin.x = x
        this.inpin.y = y

    }
    evaluate() {
        this.state = this.inpin.state
    }
    renderNode() {
        let fill = (this.state == 0) ? this.fill : 'red';
        canvas.drawLine(this.x, this.y, this.inpin.x, this.y, [], fill, 1)
        canvas.drawCircle(this.x, this.y, this.r, fill, this.stroke)
        this.inpin.draw()
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
        this.inpin_pos()
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
            state: 0, // Add additional properties specific to InputGate
            inpin: this.inpin.toJSON(), // Serialize pins
            r: this.r,
            gap: this.gap
        };
    }
}

class CompoundGate extends Node {
    constructor(x, y, name, fill, stroke) {
        super(x, y, "COMPOUND", fill, stroke)
        this.customName = name
        this.w = 0
        this.h = 0
        this.inpin = []
        this.outpin = []
        this.savedNode = []
        this.savedConnection = []
        this.init()
    }
    init() {
        const inpinLen = this.calculateInpinLen()
        const outpinLen = this.calculateOutpinLen()
        this.w = this.calculateWidth()
        this.h = this.calculateHeight(inpinLen, outpinLen)
        let r = this.RADIUS
        this.constructGate()

        this.savedNode.filter(node => node.customName == "INPUT").forEach(subnode => {
            let tempNode = new ConnectionPin(this, 0, 0, r, 'IN', this.fill, this.stroke,)
            tempNode.connected_nodes.push(subnode.outpin)
            this.inpin.push(tempNode)
        })

        this.savedNode.filter(node => node.customName == "OUTPUT").forEach(subnode => {
            let tempNode = new ConnectionPin(this, 0, 0, r, 'OUT', this.fill, this.stroke,)
            this.outpin.push(tempNode)
        })

        this.calculateBoundingBox()
        this.pinPositions()
        this.constructConnections()
    }
    pinPositions() {
        let [inYList, outYList] = this.calculatePinPositions(this.inpin.length, this.outpin.length, this.RADIUS)

        this.inpin.forEach((pin, x) => {
            pin.x = this.x
            pin.y = inYList[x]
        });
        this.outpin.forEach((pin, x) => {
            pin.x = this.x + this.w
            pin.y = outYList[x]
        });
    }
    evaluate() {
        // optimise
        this.inpin.forEach(pin => {
            pin.connected_nodes.forEach(node => {
                node.parent.state = pin.state
            })
        })

        evaluateChip(this.savedNode)
        this.savedNode.filter(node => node.customName == "OUTPUT").forEach((subnode, x) => {
            this.outpin[x].overrideId(subnode.id)
        })

        const outputNodes = this.savedNode.filter(node => node.name === "OUTPUT");
        // Map the output nodes by their IDs for faster lookup
        const outputNodeMap = new Map(outputNodes.map(node => [node.id, node]));

        this.outpin.forEach(pin => {
            const outputNode = outputNodeMap.get(pin.id);
            if (outputNode) {
                pin.state = outputNode.state;
            }
        });

        // Update the state of connected nodes
        this.outpin.forEach(pin => {
            pin.connected_nodes.forEach(node => {
                node.state = pin.state;
            });
        });
        this.savedNode.filter(node => node.customName == "OUTPUT").forEach((subnode, x) => {
            this.outpin[x].generateRandomId()
        })
    }
    constructGate() {
        let storedNode = JSON.parse(localStorage.getItem(this.customName))
        let nodeList = Array.from(storedNode['nodes'])

        let constructedNode = []
        nodeList.forEach(node => {
            if (node.name == 'INPUT') {
                constructedNode.push(this.loadInputGate(node))
            } else if (node.name == 'NOT') {
                constructedNode.push(this.loadNotGate(node))
            } else if (node.name == 'AND') {
                constructedNode.push(this.loadAndGate(node))
            } else if (node.name == 'OUTPUT') {
                constructedNode.push(this.loadOutputGate(node))
            } else if (node.name == "COMPOUND") {
                constructedNode.push(this.loadCompoundGate(node))
            }
        })
        constructedNode.forEach(node => {
            if (node.name != 'OUTPUT' && node.name != 'COMPOUND') {

                const foundNode = nodeList.find(obj => obj.id === node.id);
                let connectedNodes = this.getConnectedNode(constructedNode, foundNode.outpin.connected_nodes)
                node.outpin.connected_nodes = [...connectedNodes]
            } else if (node.name == 'COMPOUND') {
                const foundNode = nodeList.find(obj => obj.id === node.id);

                node.outpin.forEach(subnode => {
                    let foundPin = foundNode.outpin.find(pin => pin.id == subnode.id)
                    let connectedNodes = this.getConnectedNode(constructedNode, foundPin.connected_nodes)
                    subnode.connected_nodes = [...connectedNodes]
                })
            }
        })

        this.savedNode = constructedNode
    }
    constructConnections() {
        let storedConnect = JSON.parse(localStorage.getItem(this.customName))
        let connectionList = Array.from(storedConnect['connection'])

        let connections = []
        let outputFilterdNode = this.savedNode.filter(node => node.name !== 'OUTPUT')
        let inputFilteredNode = this.savedNode.filter(node => node.name !== 'INPUT')
        connectionList.forEach(node => {
            let tempConnection = connection.clone()

            for (let x = 0; x < outputFilterdNode.length; x++) {
                if (Array.isArray(outputFilterdNode[x].outpin)) {
                    tempConnection.sourcePin = outputFilterdNode[x].outpin.find(pin => pin.id == node.sourcePin)
                } else if (!tempConnection.sourcePin) {
                    tempConnection.sourcePin = (outputFilterdNode[x].outpin.id == node.sourcePin) ? outputFilterdNode[x].outpin : ''
                }
                if (tempConnection.sourcePin) break;
            }
            for (let x = 0; x < inputFilteredNode.length; x++) {
                if (Array.isArray(inputFilteredNode[x].inpin)) {
                    tempConnection.destinationPin = inputFilteredNode[x].inpin.find(pin => pin.id == node.destinationPin)
                } else if (!tempConnection.destinationPin) {
                    tempConnection.destinationPin = (inputFilteredNode[x].inpin.id == node.destinationPin) ? inputFilteredNode[x].inpin : ''
                }
                if (tempConnection.destinationPin) break;
            }
            tempConnection.connectionCoord = node.connectionCoord
            connections.push(tempConnection)
        })
        this.savedConnection = connections
    }
    getConnectedNode(nodeList, idList) {
        const nodes = [];
        // Create a Set for faster lookup of IDs
        const idSet = new Set(idList);

        nodeList.forEach(node => {
            if (node.name === 'AND' || node.name == 'COMPOUND') {
                // Filter and push matching pins for AND gates
                nodes.push(...node.inpin.filter(pin => idSet.has(pin.id)));
            } else if (node.name !== 'INPUT' && idSet.has(node.inpin.id)) {
                // Push the inpin directly for non-INPUT nodes
                nodes.push(node.inpin);
            }
        });
        return nodes;
    }
    renderNode() {
        this.draw()
        this.inpin.forEach(pin => { pin.draw() })
        this.outpin.forEach(pin => { pin.draw() })
    }
    loadCompoundGate(object) {
        let compound = new CompoundGate(object.x, object.y, object.customName, object.fill, object.stroke)
        compound.overrideId(object.id)
        compound.inpin.forEach((pin, x) => {
            pin.overrideId(object.inpin[x].id)
        })
        compound.outpin.forEach((pin, x) => {
            pin.overrideId(object.outpin[x].id)
        })
        return compound
    }
    loadInputGate(object) {
        let input = new InputGate(object.x, object.y, object.customName, object.fill, object.stroke)
        input.overrideId(object.id)
        input.outpin.overrideId(object.outpin.id)
        return input
    }
    loadOutputGate(object) {
        let output = new OutputGate(object.x, object.y, object.customName, object.fill, object.stroke)
        output.overrideId(object.id)
        output.inpin.overrideId(object.inpin.id)
        return output
    }
    loadAndGate(object) {
        let and = new AndGate(object.x, object.y, object.fill, object.stroke)
        and.overrideId(object.id)
        and.inpin.forEach((pin, x) => {
            pin.overrideId(object.inpin[x].id)
        })
        and.outpin.overrideId(object.outpin.id)
        return and
    }
    loadNotGate(object) {
        let not = new NotGate(object.x, object.y, object.fill, object.stroke)
        not.overrideId(object.id)
        not.inpin.overrideId(object.inpin.id)
        not.outpin.overrideId(object.outpin.id)
        return not
    }
    calculateHeight(inpinLen, outpinLen) {
        let horizontalGap = 5
        let pinLen = Math.max(inpinLen, outpinLen)
        return (((this.RADIUS * 2) * pinLen) + (horizontalGap * (pinLen + 1)))
    }
    calculateWidth() {
        let padding = 20
        let canvasElement = document.querySelector('#canvas')
        let canvasContext = canvasElement.getContext('2d')
        let text = canvasContext.measureText(this.customName)
        return (padding + text.width + padding)
    }

    calculateInpinLen() {
        let circuitObject = JSON.parse(localStorage.getItem(this.customName))
        let inputArray = Array.from(circuitObject['nodes']).filter(node => node.name == 'INPUT');
        return inputArray.length
    }
    calculateOutpinLen() {
        let circuitObject = JSON.parse(localStorage.getItem(this.customName))
        let outputArray = Array.from(circuitObject['nodes']).filter(node => node.name == 'OUTPUT');
        return outputArray.length
    }
    toJSON() {
        return {
            ...super.toJSON(),
            w: this.w,
            h: this.h,
            inpin: this.inpin.map(pin => pin.toJSON()), // Serialize pins
            outpin: this.outpin.map(pin => pin.toJSON()), //
            // savedNode: this.savedNode.map(node => node.toJSON())
        }
    }

}


class Display extends Node {
    constructor(x, y, name = "DISPLAY", fill = '#1b1b2c', stroke = 'grey') {
        super(x, y, name, fill, stroke)
        this.customName = name
        this.w = 100
        this.h = 130
        this.inpin = []
        this.init()
    }
    init() {
        let r = this.RADIUS
        for (let x = 0; x < 8; x++) {
            this.inpin.push(new ConnectionPin(this, 0, 0, r, 'IN', this.stroke, this.stroke,))
        }
        this.calculateBoundingBox()
        this.pinPositions()
        // this.renderNode()
    }
    pinPositions() {
        let [inYList, outYList] = this.calculatePinPositions(8, 0, this.RADIUS)
        this.inpin.forEach((pin, x) => {
            pin.x = this.x
            pin.y = inYList[x]
        });
    }
    renderNode() {
        let segWidth = 40;
        let segHeight = 12;
        // Draw the main rectangle
        canvas.drawRectangle(this.x, this.y, this.fill, this.stroke, this.w, this.h, 1);
        // Draw input pins
        this.inpin.forEach(pin => pin.draw());
        // Draw the center trapezium
        const segColor = (x) => (this.inpin[x].state == 1) ? "red" : this.stroke;
        canvas.drawTrapezium(this.x + 10, this.y + (this.h / 2), segColor(0), this.fill, 25, segHeight, 1);
        // Precompute pivot points
        const baseX = this.x + 40;
        const baseY = this.y + (this.h / 2);
        const pivotPoints = {
            topLeft: [baseX, baseY - segWidth],
            middleLeft: [baseX, baseY],
            bottom: [baseX, baseY + segWidth],
            topRight: [baseX + segWidth, baseY - segWidth],
            middleRight: [baseX + segWidth, baseY]
        };
        // Define trapezium configurations
        const trapeziumConfigs = [
            { offsetX: 0, offsetY: -segWidth, rotation: 0, pivot: null },
            { offsetX: 0, offsetY: -segWidth, rotation: -(Math.PI / 2), pivot: pivotPoints.topRight },
            { offsetX: 0, offsetY: 0, rotation: -(Math.PI / 2), pivot: pivotPoints.middleRight },
            { offsetX: 0, offsetY: segWidth, rotation: 0, pivot: null },
            { offsetX: 0, offsetY: 0, rotation: Math.PI / 2, pivot: pivotPoints.middleLeft },
            { offsetX: 0, offsetY: -segWidth, rotation: Math.PI / 2, pivot: pivotPoints.topLeft },
            { offsetX: 0, offsetY: 0, rotation: 0, pivot: null },
        ];
        // Draw trapeziums based on configurations
        trapeziumConfigs.forEach((config, x) => {
            canvas.drawTrapezium(
                baseX + config.offsetX,
                baseY + config.offsetY,
                segColor(x + 1),
                this.fill,
                segWidth,
                segHeight,
                2,
                config.rotation,
                config.pivot
            );
        });
    }
    evaluate() {

    }
    toJSON() {
        return {
            ...super.toJSON(),
            w: this.w,
            h: this.h,
            inpin: this.inpin.map(pin => pin.toJSON())
        }
    }

}

export { Display, AndGate, NotGate, InputGate, OutputGate, CompoundGate };