import { canvas } from "./canvas.js"
import {
    chipset, gates, connection, connectionList, Vector, mousePos,
    selectedLine,
    inspectTreeContentArray,
} from "./class.js"

const isInspectMode = () => {
    return (chipset.length > 1)
}

const evaluateChip = (chip) => {
    for (let xx = 0; xx < 2; xx++) {
        let evaluationList = chip.filter(chip => chip.name == "INPUT")
        let evaluatedChips = []
    
        while (evaluationList.length > 0) {
            let evaluated = getEvaluated(evaluatedChips, evaluationList)
            if (evaluated.length > 0) {
                reEvaluation(evaluated, evaluatedChips)
            }
            let nonEvaluated = getNonEvaluated(evaluatedChips, evaluationList)
            evaluationList = evaluation(nonEvaluated)
            evaluatedChips.push(...nonEvaluated)
        }
    }
}
const reEvaluation = (evaluated, evaluatedChips) => {
    let evaluationList = evaluation(evaluated)
    let touched = getEvaluated(evaluationList, evaluatedChips)

    while (touched.length != 0
        && touched.filter(node => evaluated.includes(node)).length == 0) {
        evaluationList = evaluation(evaluationList)
        touched = getEvaluated(evaluationList, evaluatedChips)
    }
}

const evaluation = (toEvaluate) => {
    let nextGate = []
    toEvaluate.forEach(node => {
        node.evaluate()
    })
    toEvaluate.forEach(node => {
        if (node.name != 'OUTPUT' && node.name != 'COMPOUND' && node.name != 'DISPLAY') {
            node.outpin.connected_nodes.forEach(subnode => {
                if (!nextGate.includes(subnode.parent)) nextGate.push(subnode.parent)
            })
        } else if (node.name == 'COMPOUND') {
            node.outpin.forEach(node => {
                node.connected_nodes.forEach(subnode => {
                    if (!nextGate.includes(subnode.parent)) nextGate.push(subnode.parent)
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

const deleteGate = (gate) => {
    const index = chipset[0].findIndex(chip => chip.id == gate.id)
    if (index > -1) {
        let fConnection = connectionList[0].filter(connection => connection.sourcePin.parent.id == gate.id)
        let lConnection = connectionList[0].filter(connection => connection.destinationPin.parent.id == gate.id)
        lConnection.forEach(connect => {
            let filterPin = connect.sourcePin.connected_nodes.filter(node => node.parent.id != gate.id)
            connect.sourcePin.connected_nodes = filterPin
        })
        // remove fConnection and lConnection from connectionList
        let filterConnection = connectionList[0].filter(connection => !fConnection.includes(connection) && !lConnection.includes(connection))
        connectionList[0].length = 0
        connectionList[0].push(...filterConnection)
        chipset[0].splice(index, 1)
        chipset.resetGateState(chipset[0])
    }
}
const deleteLine = (connect) => {

    let fConnection = connectionList[0].filter(connection => connection.destinationPin.id == connect.destinationPin.id && connection.sourcePin.id == connect.sourcePin.id)
    fConnection.forEach(fconnect => {
        let filterPin = fconnect.sourcePin.connected_nodes.filter(node => node.id !== connect.destinationPin.id)
        fconnect.sourcePin.connected_nodes = filterPin
    })
    // remove fConnection and lConnection from connectionList
    let filterConnection = connectionList[0].filter(connection => !fConnection.includes(connection))
    connectionList[0].length = 0
    connectionList[0].push(...filterConnection)
    chipset.resetGateState(chipset[0])
}
const displayContextMenu = (ev, node) => {
    const contextMenu = document.querySelector('.context-menu')
    const contextMenuHeader = document.querySelector('.context-menu-header')
    contextMenuHeader.innerHTML = (Array.isArray(node)) ? `WIRE` : `${node.customName}`;
    contextMenu.style.display = 'flex'
    // Get the dimensions of the context menu and the viewport
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate the initial position using clientX and clientY
    let x = (ev.clientX + menuWidth > viewportWidth) ? viewportWidth - menuWidth : ev.clientX;
    let y = (ev.clientY + menuHeight > viewportHeight) ? viewportHeight - menuHeight : ev.clientY;

    // Set the adjusted position
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;

    contextMenu.setAttribute('nodeX', ev.offsetX)
    contextMenu.setAttribute('nodeY', ev.offsetY)
}
const hideContextMenu = () => {
    const contextMenu = document.querySelector('.context-menu')
    contextMenu.style.display = 'none'
}
const inspectGate = (ev, gate) => {
    let x = parseInt(ev.currentTarget.getAttribute('nodeX'))
    let y = parseInt(ev.currentTarget.getAttribute('nodeY'))
    const inspectTree = document.querySelector('.inspect-tree')
    let menuContainer = document.querySelector(".menu-items")

    if (gate.name == "COMPOUND") {
        console.log('inside');
        inspectTree.style.display = 'flex'
        menuContainer.style.display = 'none'
        updateInspectTree(gate.customName)

        chipset.unshift(gate.savedNode)
        connectionList.unshift(gate.savedConnection)
        hideContextMenu()
    }
}
const updateInspectTree = (string) => {
    inspectTreeContentArray.push(string)
    const inspectTree = document.querySelector('.inspect-tree-content')
    inspectTree.innerHTML = inspectTreeContentArray.join(' ==> ')
}
const removeInspectTree = () => {
    inspectTreeContentArray.pop()
    const inspectTree = document.querySelector('.inspect-tree-content')
    inspectTree.innerHTML = inspectTreeContentArray.join(' => ')
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

    chipset[0].forEach(node => {
        if (node.name == 'INPUT' && isInspectMode() == false && node.collide(ev.offsetX, ev.offsetY)) {
            node.toogle_state()
        }
    })
}

const node_clicked = (ev, node_list) => {
    for (let i = 0; i < node_list.length; i++) {
        const node = node_list[i];
        if (node.name === 'AND' || node.name == 'COMPOUND' || node.name == "DISPLAY") {
            for (let j = 0; j < node.inpin.length; j++) {
                if (node.inpin[j].collide(ev.offsetX, ev.offsetY)) {
                    return node.inpin[j];
                }
            }
            if (node.name == 'COMPOUND') {
                for (let j = 0; j < node.outpin.length; j++) {
                    if (node.outpin[j].collide(ev.offsetX, ev.offsetY)) {
                        return node.outpin[j];
                    }
                }
            }
            if (node.name === 'AND' && node.outpin.collide(ev.offsetX, ev.offsetY)) {
                return node.outpin;
            }
        }
        if (node.name === 'NOT' || node.name === 'OUTPUT') {
            if (node.inpin.collide(ev.offsetX, ev.offsetY)) {
                return node.inpin;
            }
        }
        if (node.name === 'NOT' || node.name === 'INPUT') {
            if (node.outpin.collide(ev.offsetX, ev.offsetY)) {
                return node.outpin;
            }
        }
    }
    return '';
};

const connectionRules = (node_a, node_b, container) => {
    // Simplify connection rules logic
    if (!node_a && !node_b) return false;
    if (node_a.name == 'OUT' && node_b.name == 'OUT') return false
    if (node_a.name == 'IN' && node_b.name == 'IN') return false
    if (node_a.parent === node_b.parent) return false

    const rules = [
        { condition: node_a.name === 'OUT' && node_b.name === 'IN' && !container.destinationPin, log: 1 },
        { condition: (node_a.name === 'OUT') && !container.sourcePin, log: 3 },
        { condition: (node_b.name === 'IN') && !container.destinationPin, log: 4 }
    ];

    const rule = rules.find(rule => rule.condition);
    if (rule) {
        return true;
    }
    return false;
};

const connectNode = () => {
    connection.sourcePin.connected_nodes.push(connection.destinationPin)
}


const createConnection = (ev) => {
    const lineSelected = canvas.getLineCollision()[0]
    // how does object.assign work
    if (lineSelected) {
        selectedLine.sourcePin = lineSelected.sourcePin
        selectedLine.destinationPin = lineSelected.destinationPin
        selectedLine.connectionCoord.push(...lineSelected.connectionCoord)
        selectedLine.clickLineSeg = lineSelected.clickLineSeg
    }

    let node = node_clicked(ev, chipset[0]);

    if (node) {
        if (connectionRules(node, connection.destinationPin, connection)) {
            connection.sourcePin = node;
        } else if (connectionRules(connection.sourcePin, node, connection)) {
            connection.destinationPin = node;
        }
    }

    // Handle adding connector points when no node is clicked
    //Ensures we are not clicking on a gate
    //Ensures we are not tying it to an existing connection
    if (!node && !selectedLine.sourcePin && !chipset[0].some(n => n.collide(ev.offsetX, ev.offsetY))) {
        connection.add([mousePos.x, mousePos.y])
    }

    // create connection from an existing line 
    if (!node && selectedLine.sourcePin) {
        if (connection.destinationPin) {
            connection.add([mousePos.x, mousePos.y]);
            connection.createFrmExistingConnection(selectedLine);
            connection.sourcePin = selectedLine.sourcePin;

        } else if (!connection.sourcePin && !connection.destinationPin) {
            connection.sourcePin = selectedLine.sourcePin;
            connection.createFrmExistingConnection(selectedLine);
            connection.add([mousePos.x, mousePos.y])
        }
    }

    // Finalize the connection if both ends are defined
    if (connection.sourcePin && connection.destinationPin) {
        connectNode();
        connectionList[0].push(connection.clone());
        // Reset connection 
        connection.reset()
        selectedLine.reset()
        evaluateChip(chipset)
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
    hideContextMenu, displayContextMenu, calculateGateCoordinates, validateGateSelection,
    calculateCompoundGateCoordinates, deleteGate, isInspectMode,
    dragLogic, toggleInput, createConnection, calculateAngle, generateRandomColor,
    evaluateChip, deleteLine, inspectGate, node_clicked, removeInspectTree
}