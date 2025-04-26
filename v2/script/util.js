import { chipset, gates, connection, connectionList, Vector } from "./class.js"

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
    // mouse_pos = { x: 0, y: sideBar.y - BoardRect.y }

    return [0, getY(sideBar.y - BoardRect.y)]
}

const validateGateSelection = (ev) => {

    if (/*button_click &&*/ gates != '' &&
        (gates[0].name.toLowerCase() != ev.currentTarget.getAttribute('name').toLowerCase())) {
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
            console.log("node clicked :", node);
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
        if (node.name !== 'INPUT' && node.name !== 'OUTPUT') {
            for (let j = 0; j < node.inpin.length; j++) {
                if (node.inpin[j].collide(ev.offsetX, ev.offsetY)) {
                    return node.inpin[j];
                }
            }
            for (let k = 0; k < node.outpin.length; k++) {
                if (node.outpin[k].collide(ev.offsetX, ev.offsetY)) {
                    return node.outpin[k];
                }
            }
        }
    }
    return '';
};

const connectionRules = (node_a, node_b, container) => {
    // Simplify connection rules logic
    if (!node_a && !node_b) return false;

    const rules = [
        { condition: node_a.name === 'OUTLET' && node_b.name === 'IN' && !container.destinationPin, log: 0 },
        { condition: node_a.name === 'OUT' && node_b.name === 'IN' && !container.destinationPin, log: 1 },
        { condition: node_a.name === 'OUT' && node_b.name === 'INLET' && !container.destinationPin, log: 2 },
        { condition: (node_a.name === 'OUTLET' || node_a.name === 'OUT') && !container.sourcePin, log: 3 },
        { condition: (node_b.name === 'INLET' || node_b.name === 'IN') && !container.destinationPin, log: 4 }
    ];

    const rule = rules.find(rule => rule.condition);
    if (rule) {
        console.log(rule.log);
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
        if (connection.sourcePin) {
            connection.connectionCoord.push([ev.offsetX, ev.offsetY]);
        } else if (connection.destinationPin) {
            connection.connectionCoord.unshift([ev.offsetX, ev.offsetY]);
        }
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
        console.log(connection);
        // Reset connection and re-evaluate the node list
        connection.reset()
        console.log(connectionList);

        // evaluate_node_list();
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
    calculateGateCoordinates, validateGateSelection,
    dragLogic, toggleInput, createConnection, calculateAngle
}