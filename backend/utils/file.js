const Global = require('../global.js')
const {dialog, nativeImage} = require('electron')

var MyFile = {
    pick_single_image: () => {
        var picked = dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{name: 'Images', extensions: ['png', 'jpg']}]
        })
        // user does not choose anything
        if (picked == undefined) return
        // read image
        var image = nativeImage.createFromPath(picked[0])
        Global.win.webContents.send('NewImage', image.getSize(), picked[0])
    }
}

module.exports = MyFile;