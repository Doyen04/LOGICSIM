import { canvas } from './canvas.js'
import { chipset, connectionList } from './class.js'
import {
    onCanvasMouseMove, onCanvasMouseClick, onCanvasMouseDown, saveToLocalStorage, toggleLibrary,
    onCanvasMouseUp, onCanvasRightClick, addAndGateHandler,inspectTreeNavigationHandler,
    addNotGateHandler, displayLibrary, onContextMenuClick, addDisplayHandler,createNewFile,
    addInputGateHandler, addOutputGateHandler, toggleMenuHandler, onCanvasMouseEnter, onCanvasMouseLeave
} from './eventHandler.js'


const saveAs = document.querySelector('.saveas')
saveAs.addEventListener('click', saveToLocalStorage)

const cancel = document.querySelector('.cancel')
cancel.addEventListener('click', toggleLibrary)

const newfile = document.querySelector('.newfile')
newfile.addEventListener('click', createNewFile)

const contextMenu = document.querySelector('.context-menu')
contextMenu.addEventListener('click', onContextMenuClick)

const library = document.querySelector('.library')
library.addEventListener('click', displayLibrary)

const menuToggleButton = document.querySelector('.menu')
menuToggleButton.addEventListener('click', toggleMenuHandler)

const andGateButton = document.querySelector('#and')
andGateButton.addEventListener('click', addAndGateHandler)

const displayButton = document.querySelector('#lcd')
displayButton.addEventListener('click', addDisplayHandler)

const notGateButton = document.querySelector('#not')
notGateButton.addEventListener('click', addNotGateHandler)

const inputGateButton = document.querySelector('#in')
inputGateButton.addEventListener('click', addInputGateHandler)

const outputGateButton = document.querySelector('#out')
outputGateButton.addEventListener('click', addOutputGateHandler)

const inspectTreeNavigation = document.querySelector('.inspect-tree-navigation')
inspectTreeNavigation.addEventListener('click', inspectTreeNavigationHandler)

const canvasElement = document.getElementById('canvas')
canvasElement.addEventListener('mousemove', onCanvasMouseMove)
canvasElement.addEventListener('click', onCanvasMouseClick)
canvasElement.addEventListener('mousedown', onCanvasMouseDown)
canvasElement.addEventListener('mouseup', onCanvasMouseUp)
canvasElement.addEventListener('contextmenu', onCanvasRightClick)
canvasElement.addEventListener('mouseenter', onCanvasMouseEnter)
canvasElement.addEventListener('mouseleave', onCanvasMouseLeave)

canvas.renderCanvas()