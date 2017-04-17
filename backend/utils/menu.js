var Global = require('../global.js')
const MyFile = require('./file.js')
const {Menu} = require('electron')

// submenu
var file_submenu = {
    label: 'File',
    submenu: [
        {
            label: 'Pick Image',
            click: MyFile.pick_single_image
        }
    ]
}

// template
var menu_template = []
menu_template.push(file_submenu)

var MyMenu = Menu.buildFromTemplate(menu_template)

module.exports = MyMenu;