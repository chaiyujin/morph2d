// for canvas
let g_hide_canvas = null
let default_canvas_size = { width: 800, height: 800 }
// for current image
let g_new_image_size = null
let g_new_image_url = null
// for tree menu
let g_tree_menu = {}
let ItemHeight = 20
let SourceName = 'Source'
let TargetName = 'Target'
let ClosedIcon = '<span class="glyphicon glyphicon-chevron-right"></span>'
let OpenedIcon = '<span class="glyphicon glyphicon-chevron-down"></span>'
let g_configuration = null
let Commands = null

var say_message = (msg) => {
    $('.foot-bar').children('#message').html(msg)
}