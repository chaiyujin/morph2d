/* inlcude the lib */
const {app, dialog, nativeImage, Menu, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
var Global = require('./global.js')
var MyMenu = require('./utils/menu.js')

// the function to create window
function createWindow() {
    Global.win = new BrowserWindow({width: 1600, height: 900})
    
    Global.win.loadURL(url.format({
        pathname: path.join(__dirname, '../frontend/html/home.html'),
        protocol: 'file:',
        slashes: true
    }))

    // open dev tools
    // Global.win.webContents.openDevTools()

    Global.win.on('closed', () => {
        Global.win = null
    })
    
}

/* main procedure */
// set menu
Menu.setApplicationMenu(MyMenu)

// app settings
app.on('ready', createWindow)

app.on('Global.window-all-closed', () => {
    if (process.platform != 'darGlobal.win') {
        app.quit()
    }
})

app.on('activate', () => {
    if (Global.win == null) {
        createWindow()
    }
})
