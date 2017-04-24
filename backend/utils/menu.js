var Global = require('../global.js')
const MyFile = require('./file.js')
const {Menu} = require('electron')

// submenu
var file_submenu = {
    label: 'File',
    submenu: [
        {
            label: 'Pick Image',
            click: MyFile.pick_single_image,
            accelerator: 'ctrl+i'
        },
        {
            label: 'Save Bezier',
            click: MyFile.save_bezier,
            accelerator: 'ctrl+s'
        },
        {
            label: 'Load Bezier',
            click: MyFile.load_bezier,
            accelerator: 'ctrl+d'
        }
    ]
}

var edit_submenu = {
    label: 'Edit',
    submenu: [
        {
            label: 'undo',
            accelerator: 'ctrl+z',
            click: () => {
                Global.win.webContents.send('undo')
            }
        },
        {
            label: 'redo',
            accelerator: 'ctrl+b',
            click: () => {
                Global.win.webContents.send('redo')
            }
        }
    ]
}
// template
var menu_template = []
menu_template.push(file_submenu)
menu_template.push(edit_submenu)

var MyMenu = Menu.buildFromTemplate(menu_template)

module.exports = MyMenu;