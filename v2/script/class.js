
class CustomArray extends Array {
    reset = () => {
        this.length = 0
    }
}
class ChipSet extends CustomArray {
    resetGateState() {
        this.forEach(node => {
            if (node.name == 'INPUT' || node.name == 'OUTPUT') {
                (node.name == 'INPUT') ? node.outpin.state = 0 : node.inpin.state = 0;
                node.state = 0
            } else if (node.name == 'AND' || node.name == 'COMPOUND') {
                (node.name == 'COMPOUND') ? node.outpin.forEach(pin => { pin.state = 0 }) : node.outpin.state = 0;
                node.inpin.forEach(pin => { pin.state = 0 });
            } else if (node.name == 'NOT') {
                node.inpin.state = 0
                node.outpin.state = 0
            }
        })
    }
}
class Connection extends Array {
    sourcePin = ''
    destinationPin = ''
    connectionCoord = []

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
        } else if (this.destinationPin) {
            this.connectionCoord.unshift(array)
        }
    }
    getArray = () => {
        let array = []
        if (this.sourcePin != '') array.push([this.sourcePin.x, this.sourcePin.y, this.sourcePin.state])
        if (this.connectionCoord != '') array.push(...this.connectionCoord)
        if (this.destinationPin != '') array.push([this.destinationPin.x, this.destinationPin.y])

        return array
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

const gates = new CustomArray()
const chipset = new ChipSet()

export { gates, chipset, connection, connectionList, Vector2, Vector, mousePos }