const {ipcRenderer} = require('electron')

ipcRenderer.on('NewImage', (event, size, url) => {
    g_new_image_size = size
    g_new_image_url = url
    var arr = url.split('.')
    var only_shitae = true
    if (arr[arr.length - 1] == 'png')
        only_shitae = false
    query_image_type(only_shitae)
})

ipcRenderer.on('undo', (event) => {
    console.log('undo')
    g_history.undo()
})

ipcRenderer.on('redo', (event) => {
    console.log('redo')
    g_history.redo()
})

/* init */
$(document).ready(() => {
    {
        var c = $("#myCanvas")[0]
        g_canvas =c.getContext("2d")
    }
    {
        var c = $("#hideCanvas")[0]
        g_hide_canvas = c.getContext("2d")
        $("#hideCanvas").hide()
    }
    update_canvas_size(default_canvas_size)
    $(window).resize(() => {
        // width
        if ($(window).width() < default_canvas_size.width + $(".left-bar").width()) {
            $(".right-area").width(default_canvas_size.width)
        }
        else {
            $(".right-area").width("auto")
        }
        // heigth
        if ($(window).height() < default_canvas_size.height) {
            $(".left-bar").height(default_canvas_size.height)
            $(".right-area").height(default_canvas_size.height)
        }
        else {
            $(".left-bar").height("100%")
            $(".right-area").height("100%")
        }
    })

    // append click
    $('.level').click(function(event) {
        var item = $(event.target).closest('.level')
        switch_item(item)
    });
    g_tree_menu['layers'] = 0
    g_tree_menu['morph'] = 0

    g_configuration.update_ui()

    add_morph('face')

    console.log("document is ready.")
}) 