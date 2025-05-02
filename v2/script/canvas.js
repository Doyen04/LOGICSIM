import { gates, chipset, connection, connectionList, Vector, Vector2, mousePos } from "./class.js"
import { calculateAngle } from './util.js'

let canvasElement = document.querySelector('#canvas')
let canvasContext = canvasElement.getContext('2d')


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
    getLineCollision = () => {
        let result = []
        connectionList.forEach(connection => {
            const wire = connection.getArray();
            for (let x = 1; x < wire.length; x++) {
                let [x1, y1] = wire[x - 1]
                let [x2, y2] = wire[x]
                if (this.isLineColliding(x1, y1, x2, y2)) {
                    result.push(connection)
                    break;
                }
            }
        })
        return result
    }
    isLineColliding = (x1, y1, x2, y2) => {
        canvasContext.beginPath()
        canvasContext.lineWidth = 12
        canvasContext.moveTo(x1, y1)
        canvasContext.lineTo(x2, y2)
        if (canvasContext.isPointInStroke(mousePos.x, mousePos.y)) {
            return true
        } else {
            return false

        }
    }
    renderLineConnection = () => {
        connectionList.forEach(connection => {
            this.renderLine(connection.getArray())
        })

        let tempArray = connection.getArray()

        if (tempArray != '') {
            if (connection.sourcePin) {
                tempArray.push([mousePos.x, mousePos.y])
            } else if (connection.destinationPin) {
                tempArray.unshift([mousePos.x, mousePos.y])
            }
            this.renderLine(tempArray)
        }
        this.getLineCollision().forEach(connection =>{
            this.renderLine(connection.getArray())
        })
    }
    renderLine = (points) => {
        const radius = 5;

        canvasContext.strokeStyle = (points[0].length == 3 && points[0][2] == 1)?'red': 'black';
        canvasContext.lineWidth = 5;
        canvasContext.lineJoin = 'round';

        canvasContext.beginPath();
        canvasContext.moveTo(...points[0]);

        for (let i = 0; i < points.length - 2; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const p2 = points[i + 2];

            const v1 = new Vector2(p0, p1);
            const v2 = new Vector2(p1, p2);

            const dir1 = v1.normalise().multiplyBy(v1.vecLength() - radius);
            const dir2 = v2.normalise().multiplyBy(v2.vecLength() - radius);
            // console.log(v1.vecLength() - radius, v2.vecLength() - radius);


            const p1Start = new Vector(...p0).add(dir1); // Point to stop before corner
            const p1End = new Vector(...p2).minus(dir2); // Point to resume after corner

            const angle = calculateAngle(p0, p1, p2)
            const adjustedRadius = (angle >= 90) ? radius : (angle * radius) / 90; // Adjust radius based on angle

            canvasContext.lineTo(...p1Start);
            canvasContext.arcTo(...p1, ...p1End, adjustedRadius);
        }

        // Final point
        canvasContext.lineTo(...points[points.length - 1]);
        canvasContext.stroke();
    }


    renderCanvas = () => {
        canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height)

        this.renderLineConnection()
        chipset.forEach(gate => {
            gate.renderNode()
        })
        gates.forEach(gate => {
            gate.renderNode()
        })
        requestAnimationFrame(this.renderCanvas)
    }
}

const canvas = new CANVAS()

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

export { canvas }
