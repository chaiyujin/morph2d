// for canvas
let g_canvas = null
let g_hide_canvas = null
let default_canvas_size = { width: 800, height: 800 }
// for current image
let g_image_size = null
let g_image_url = null
let g_new_image_size = null
let g_new_image_url = null
let shitae = null
let texture = null
let ku_mi = {}
// for tree menu
let g_tree_menu = {}
let ItemHeight = 20
let BackgroundName = 'Background'
let TextureName = 'Texture'
let ClosedIcon = '<span class="glyphicon glyphicon-chevron-right"></span>'
let OpenedIcon = '<span class="glyphicon glyphicon-chevron-down"></span>'

var say_message = (msg) => {
    $('.foot-bar').children('#message').html(msg)
}