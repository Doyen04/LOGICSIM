import {
    chipset, gates, connection, connectionList, Vector, mousePos
} from "./class.js"

const evaluateChip = (chip) => {
    let evaluationList = chip.filter(chip => chip.name == "INPUT")
    let evaluatedChips = []

    while (evaluationList.length > 0) {
        let evaluated = getEvaluated(evaluatedChips, evaluationList)

        if (evaluated.length > 0) {
            reEvaluation(evaluated)
        }
        //filter out non evaluated
        let nonEvaluated = getNonEvaluated(evaluatedChips, evaluationList)
        evaluationList = evaluation(nonEvaluated)
        evaluatedChips.push(...nonEvaluated)

    }

}
const reEvaluation = (evaluated) => {
    let evaluationList = evaluation(evaluated)
    let touched = getEvaluated(evaluated, evaluationList)

    while (touched.length == 0) {
        let resultList = evaluation(evaluationList)
        evaluationList = resultList
        touched = getEvaluated(evaluated, evaluationList)
    }
}
const evaluation = (toEvaluate) => {
    let nextGate = []
    toEvaluate.forEach(node => {
        node.evaluate()
    })
    toEvaluate.forEach(node => {
        if (node.name == 'INPUT') {
            node.outlet.connected_nodes.forEach(subnode => {
                nextGate.push(subnode.parent)
            })
        } else if (node.name != 'OUTPUT'&& node.name != 'COMPOUND') {
            console.log(node);
            
            node.outpin.connected_nodes.forEach(subnode => {
                nextGate.push(subnode.parent)
            })
        }else if(node.name == 'COMPOUND'){
            node.outpin.forEach(node =>{
                node.connected_nodes.forEach(subnode => {
                    nextGate.push(subnode.parent)
                })
            })
        }
    })
    return nextGate
}
const getNonEvaluated = (evaluated, evaluationList) => {
    const nonEvaluatedChip = evaluationList.filter(chip =>
        !evaluated.some(eChip => eChip.id == chip.id)
    )
    return nonEvaluatedChip;
}

const getEvaluated = (evaluated, evaluationList) => {
    const evaluatedChip = evaluationList.filter(chip =>
        evaluated.some(eChip => eChip.id == chip.id)
    )
    return evaluatedChip;
}

const generateRandomColor = () => {
    let result = '#'
    let array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f']
    for (let xx = 0; xx < 6; xx++) {
        result += array[Math.floor(Math.random() * array.length)]
    }
    return result
}

const calculateCompoundGateCoordinates = (ev) => {
    let parentCoord = ev.target.parentElement.getBoundingClientRect()
    let canvasCoord = document.querySelector('#canvas').getBoundingClientRect()
    let buttonCoord = ev.target.getBoundingClientRect()

    const getY = (y) => {
        let lastY = y
        let yGap = 5
        if (gates != '') {
            lastY = gates.at(-1).bottom + (yGap)
        }
        return lastY
    }
    mousePos.x = parentCoord.x - canvasCoord.x
    mousePos.y = buttonCoord.y - canvasCoord.y

    return [parentCoord.x - canvasCoord.x, getY(buttonCoord.y - canvasCoord.y)]
}

const calculateGateCoordinates = (ev) => {
    let circuitBoard = document.querySelector('#canvas')
    let sideBar = ev.target.getBoundingClientRect()
    let BoardRect = circuitBoard.getBoundingClientRect()

    const getY = (y) => {
        let lastY = y
        let yGap = 5
        if (gates != '') {
            if (gates.at(-1).name == ('INPUT') || gates.at(-1).name == ('OUTPUT')) {
                lastY = gates.at(-1).bottom + gates.at(-1).r + yGap
            } else {
                lastY = gates.at(-1).bottom + (yGap)
            }
        }
        return lastY
    }
    mousePos.x = 0
    mousePos.y = sideBar.y - BoardRect.y
    return [0, getY(sideBar.y - BoardRect.y)]
}

const validateGateSelection = (ev) => {
    if (/*button_click &&*/ gates != '' &&
        (gates[0].customName.toLowerCase() != ev.currentTarget.getAttribute('name').toLowerCase())) {
        gates.reset()
    }
    // button_click = true
}

const dragLogic = (cx, cy) => {
    gates.forEach(node => {
        node.move(cx, cy)
    })
}

function toggleInput(ev) {

    chipset.forEach(node => {
        if (node.name == 'INPUT' && node.collide(ev.offsetX, ev.offsetY)) {
            node.toogle_state()
            // console.log("node clicked :", node);
        }
    })
}

const node_clicked = (ev, node_list) => {
    for (let i = 0; i < node_list.length; i++) {
        const node = node_list[i];
        if (node.name === 'INPUT' && node.outlet.collide(ev.offsetX, ev.offsetY)) {
            return node.outlet;
        }
        if (node.name === 'OUTPUT' && node.inlet.collide(ev.offsetX, ev.offsetY)) {
            return node.inlet;
        }
        if (node.name === 'AND') {
            for (let j = 0; j < node.inpin.length; j++) {
                if (node.inpin[j].collide(ev.offsetX, ev.offsetY)) {
                    return node.inpin[j];
                }
            }
            if (node.outpin.collide(ev.offsetX, ev.offsetY)) {
                return node.outpin;
            }

        }
        if (node.name === 'NOT') {
            if (node.inpin.collide(ev.offsetX, ev.offsetY)) {
                return node.inpin;
            }
            if (node.outpin.collide(ev.offsetX, ev.offsetY)) {
                return node.outpin;
            }
        }
        if (node.name == 'COMPOUND') {
            for (let j = 0; j < node.inpin.length; j++) {
                if (node.inpin[j].collide(ev.offsetX, ev.offsetY)) {
                    return node.inpin[j];
                }
            }
            for (let j = 0; j < node.outpin.length; j++) {
                if (node.outpin[j].collide(ev.offsetX, ev.offsetY)) {
                    return node.outpin[j];
                }
            }
        }
    }
    return '';
};

const connectionRules = (node_a, node_b, container) => {
    // Simplify connection rules logic
    if (!node_a && !node_b) return false;
    if (node_a.name !== 'OUTLET' && node_b.name !== 'OUTLET' && node_a.name !== 'INLET' && node_b.name !== 'INLET' && node_a.parent === node_b.parent) return false

    const rules = [
        { condition: node_a.name === 'OUTLET' && node_b.name === 'IN' && !container.destinationPin, log: 0 },
        { condition: node_a.name === 'OUT' && node_b.name === 'IN' && !container.destinationPin, log: 1 },
        { condition: node_a.name === 'OUT' && node_b.name === 'INLET' && !container.destinationPin, log: 2 },
        { condition: (node_a.name === 'OUTLET' || node_a.name === 'OUT') && !container.sourcePin, log: 3 },
        { condition: (node_b.name === 'INLET' || node_b.name === 'IN') && !container.destinationPin, log: 4 }
    ];

    const rule = rules.find(rule => rule.condition);
    if (rule) {
        // console.log(rule.log);
        return true;
    }
    return false;
};

const connectNode = () => {
    connection.sourcePin.connected_nodes.push(connection.destinationPin)
}


const createConnection = (ev) => {

    let node = node_clicked(ev, chipset);
    // console.log(node?.name, node?.x, node?.y);

    if (node) {
        if (connectionRules(node, connection.destinationPin, connection)) {
            connection.sourcePin = node;
        } else if (connectionRules(connection.sourcePin, node, connection)) {
            connection.destinationPin = node;
        }
    }

    // console.log(connection);

    // Handle adding connector points when no node is clicked
    //Ensures we are not clicking on a gate
    //Ensures we are not tying it to an existing connection
    if (!node && /*!line_selected.start_pos &&*/ !chipset.some(n => n.isColliding(ev.offsetX, ev.offsetY))) {
        connection.add([mousePos.x, mousePos.y])
    }

    // create connection from an existing line 
    // if (!node && line_selected.start_pos) {
    //     if (connection.sourcePin) {
    //         connection.connector.push([ev.offsetX, ev.offsetY]);
    //         update_connector(line_selected.node.connector, line_selected.end_pos, true);
    //         connection.destinationPin = line_selected.node.destinationPin;
    //     } else if (connection.destinationPin) {
    //         connection.sourcePin = line_selected.node.sourcePin;
    //         const temp = [...connection.connector];
    //         connection.connector = [];
    //         update_connector(line_selected.node.connector, line_selected.start_pos);
    //         connection.connector.push([ev.offsetX, ev.offsetY], ...temp);
    //     } else if (!connection.sourcePin && !connection.destinationPin) {
    //         connection.sourcePin = line_selected.node.sourcePin;
    //         update_connector(line_selected.node.connector, line_selected.start_pos);
    //         connection.connector.push([ev.offsetX, ev.offsetY]);
    //     }
    // }

    // Finalize the connection if both ends are defined
    if (connection.sourcePin && connection.destinationPin) {
        connectNode();
        connectionList.push(connection.clone());
        // Reset connection 
        connection.reset()
    }
};


function calculateAngle(p0, p1, p2) {
    // Create vectors using your existing classes
    const v1 = new Vector(...p0).minus(new Vector(...p1)); // Vector from p0 to p1
    const v2 = new Vector(...p2).minus(new Vector(...p1)); // Vector from p1 to p2

    // Calculate dot product
    const dotProduct = v1[0] * v2[0] + v1[1] * v2[1];

    // Calculate magnitudes
    const magnitude1 = v1.vecLength();
    const magnitude2 = v2.vecLength();

    // Calculate angle in radians
    const angleRadians = Math.acos(dotProduct / (magnitude1 * magnitude2));

    // Convert to degrees (optional)
    const angleDegrees = angleRadians * (180 / Math.PI);

    return angleDegrees; // Return angle in degrees
}


export {
    calculateGateCoordinates, validateGateSelection, calculateCompoundGateCoordinates,
    dragLogic, toggleInput, createConnection, calculateAngle, generateRandomColor, evaluateChip
}