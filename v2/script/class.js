
class CustomArray extends Array {

    reset = () => {
        this.length = 0
    }
}
class ChipSet extends CustomArray {
    resetGateState(array) {
        array.forEach(node => {
            if (node.name == 'INPUT' || node.name == 'OUTPUT') {
                (node.name == 'INPUT') ? node.outpin.state = 0 : node.inpin.state = 0;
                node.state = 0
            } else if (node.name == 'AND' || node.name == 'COMPOUND') {
                (node.name == 'COMPOUND') ? node.outpin.forEach(pin => { pin.state = 0 }) : node.outpin.state = 0;
                node.inpin.forEach(pin => { pin.state = 0 });
            } else if (node.name == 'NOT') {
                node.inpin.state = 0
                node.outpin.state = 0
            } else if (node.name == 'DISPLAY') {
                node.inpin.forEach(pin => { pin.state = 0 });
            }
        })
    }
}
class Connection extends Array {
    sourcePin = ''
    destinationPin = ''
    connectionCoord = []
    clickLineSeg = { x1: 0, y1: 0, x2: 0, y2: 0 }

    clone = () => {
        const temp = new Connection()
        temp.sourcePin = this.sourcePin
        temp.destinationPin = this.destinationPin
        temp.connectionCoord = structuredClone(this.connectionCoord)
        return temp
    }
    reset = () => {
        this.sourcePin = ''
        this.destinationPin = ''
        this.connectionCoord = []
    }
    add(array) {
        if (this.sourcePin) {
            this.connectionCoord.push(array)
            this.strokeStyle = this.sourcePin.wireStroke
        } else if (this.destinationPin) {
            this.connectionCoord.unshift(array)
        }
    }
    getStroke() {
        return this.sourcePin.state === 0
            ? this.sourcePin.wireStroke
            : this.sourcePin.wireStroke === "#000000"
                ? '#ff0000'
                : `${this.sourcePin.wireStroke}99`;
    }
    getArray = () => {
        let array = []
        if (this.sourcePin != '') array.push([this.sourcePin.x, this.sourcePin.y, this.getStroke()])
        if (this.connectionCoord != '') array.push(...this.connectionCoord)
        if (this.destinationPin != '') array.push([this.destinationPin.x, this.destinationPin.y])

        return array
    }
    randomColor() {
        let result = '#'
        let array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f']
        for (let xx = 0; xx < 6; xx++) {
            result += array[Math.floor(Math.random() * array.length)]
        }
        return result;
    }
    changeLineColor(string) {
        if (string != 'random') {
            if (string == 'green') this.sourcePin.wireStroke = '#008000'
            if (string == 'blue') this.sourcePin.wireStroke = '#0000ff'
            if (string == 'yellow') this.sourcePin.wireStroke = '#ff0'
        } else if (string == 'random') {
            this.sourcePin.wireStroke = this.randomColor()
        }
    }
    getTemporaryArray() {
        let tempArray = this.getArray()

        if (tempArray != '') {
            if (this.sourcePin) {
                tempArray.push([mousePos.x, mousePos.y])
            } else if (this.destinationPin) {
                tempArray.unshift([mousePos.x, mousePos.y, this.getStroke()])
            }
        } return tempArray
    }
    isArraysEqual(a, b) {
        return Array.isArray(a) && Array.isArray(b) && a.length == a.length && a.every((val, index) => val === b[index])
    }
    splitArrayAt(array, searchElem) {
        const index = array.findIndex(item => this.isArraysEqual(item, searchElem))
        if (index == -1) {
            return [array.slice(), []]
        }
        let x = []
        const firstPart = array.slice(0, index+1)
        // const secondPrt = array.slice(index)
        return firstPart
    }
    createFrmExistingConnection(existConnection){
        const clickedLine = existConnection.clickLineSeg
        const connectionCoord = existConnection.connectionCoord
        if (this.sourcePin) {
            let result = this.splitArrayAt(connectionCoord, [clickedLine.x1, clickedLine.y1])
            this.connectionCoord.push(...result)
        }else if(this.destinationPin){
            let result = this.splitArrayAt(connectionCoord, [clickedLine.x1, clickedLine.y1])
            this.connectionCoord.unshift(...result)
        }
    }
}

class Vector extends Array {
    add(array) {
        return new Vector(this[0] + array[0], this[1] + array[1]);
    }
    minus(array) {
        return new Vector(this[0] - array[0], this[1] - array[1]);
    }
    divideBy(num) {
        return new Vector(this[0] / num, this[1] / num);
    }
    multiplyBy(num) {
        return new Vector(this[0] * num, this[1] * num);
    }
    vecLength = () => {
        return Math.sqrt(this[0] ** 2 + this[1] ** 2);
    };
    reset = () => {
        this.length = 0
    }
}

class Vector2 extends Array {
    vecLength() {
        const [p1, p2] = this.map(p => new Vector(...p));
        return Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
    }
    normalise() {
        const [p1, p2] = this.map(p => new Vector(...p));
        const direction = p2.minus(p1);
        return direction.divideBy(this.vecLength());
    }
}

const mousePos = (() => {
    const instance = { x: 0, y: 0 }; // The single instance
    return instance;
})();

const connection = new Connection()
const connectionList = new CustomArray()
connectionList.push([])

const selectedLine = new Connection()

const gates = new CustomArray()
const chipset = new ChipSet()
chipset.push([])

const inspectTreeContentArray = new CustomArray()

export { inspectTreeContentArray, gates, chipset, connection, connectionList, selectedLine, Vector2, Vector, mousePos }