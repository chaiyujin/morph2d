const Global = require('../global.js')
const {dialog, nativeImage, ipcMain} = require('electron')

var MyFile = {
    pick_single_image: () => {
        var picked = dialog.showOpenDialog({
            properties: ['openFile'],
            title: 'Pick Image',
            filters: [{name: 'Images', extensions: ['png', 'jpg']}]
        })
        // user does not choose anything
        if (picked == undefined) return
        // read image
        var image = nativeImage.createFromPath(picked[0])
        Global.win.webContents.send('NewImage', image.getSize(), picked[0])
    },

    save_bezier: () => {
        const options = {
            title: 'Save Bezier Surfaces',
            filters: [{name: 'Bezier', extensions: ['bez']}]
        }
        dialog.showSaveDialog(options, function(filename) {
            if (filename != undefined) {
                Global.win.webContents.send('save', filename)
            }
        })
    },

    load_bezier: () => {
        var picked = dialog.showOpenDialog({
            properties: ['openFile'],
            title: 'Pick Bezier Surface',
            filters: [{name: 'Bezier', extensions: ['bez']}]
        })
        // user does not choose anything
        if (picked == undefined) return
        // read image
        Global.win.webContents.send('load', picked[0])
    }
}

module.exports = MyFile;