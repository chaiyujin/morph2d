const {ipcRenderer} = require('electron')

ipcRenderer.on('NewImage', (event, size, url) => {
    g_new_image_size = size
    g_new_image_url = url
    query_image_type()
})

ipcRenderer.on('undo', (event) => {
    console.log('undo')
    Commands.undo()
})

ipcRenderer.on('redo', (event) => {
    console.log('redo')
    Commands.redo()
})

/* init */
$(document).ready(() => {
    
    g_configuration = new Configuration()
    {
        var c = $("#sourceCanvas")[0]
        g_configuration.source_canvas = c.getContext("2d")
        g_configuration.source_surface = new BezierSurfaces(4, 4, default_canvas_size.width, default_canvas_size.height)
    }
    {
        var c = $("#targetCanvas")[0]
        g_configuration.target_canvas =c.getContext("2d")
        g_configuration.target_surface = new BezierSurfaces(5, 5, default_canvas_size.width, default_canvas_size.height)
        $("#targetCanvas").hide()
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
        g_configuration.choose(item[0].id)
        say_message('Choose ' + item[0].id)
        // switch_item(item)
    });

    

    g_configuration.update_ui()

    console.log("document is ready.")
}) 