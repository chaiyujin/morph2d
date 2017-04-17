const {ipcRenderer} = require('electron')

// global
let g_canvas = null
let g_hide_canvas = null
let default_canvas_size = { width: 800, height: 800 }
//
let shi_ta_e = null
let ku_mi = {}

// image class
class Image {
    constructor(name, size, url, callback) {
        this.name = name // to-do: check name
        this.size = size
        this.src = url
        this.corner = {x: 0, y: 0}
        this.is_read = false
        this._callback = callback
        this._img = null
        this._img_data = null
        this.load_image()
    }
    get name() { return this._name }
    set name(v) { this._name = v }
    get size() { return this._size }
    set size(v) { this._size = v }
    get src() { return this._src }
    set src(v) { this._src = v }
    get corner() { return this._corner }
    set corner(v) { this._corner = v }
    get is_ready() { return this._is_ready }
    set is_ready(v) { this._is_ready = v }

    load_image() {
        // add into html, hide it
        var test = $('#' + this.name)
        if (test.length == 0) {
            $('body').append('<img id="' + this.name + '" src="' + this.src + '"/>')
            $('#' + this._name).hide()
        }
        else { 
            test.attr('src', this.src)
        }
        this.is_ready = false;
        // load and callback
        this._img = $('#' + this.name)[0];
        if (this._img.complete) {
            this.is_ready = true;
            this.get_data()
            this._callback()
        }
        else {
            this._img.onload = () => {
                this.is_ready = true;
                this.get_data()
                this._callback()
            }
        }
    }

    get_data() {
        console.log()
        g_hide_canvas.clearRect(0, 0,
                                g_hide_canvas.canvas.width,
                                g_hide_canvas.canvas.height)
        g_hide_canvas.drawImage(this._img, 0, 0)
        this._img_data = g_hide_canvas.getImageData(0, 0, 800, 800)
    }

    draw() {
        if (this._img_data != null)
            g_canvas.putImageData(this._img_data, 0, 0)
    }

    destroy() {
        delete this._img_data
        this._img_data = null
    }
}

/* when a new image coming in */
var update_shitae = (size, url) => {
    if (shi_ta_e != null) shi_ta_e.destroy()
    shi_ta_e = new Image('shi_ta_e', size, url, ()=>{ shi_ta_e.draw() })
}

ipcRenderer.on('NewImage', (event, size, url) => {
    update_shitae(size, url)
})

var update_canvas_size = (size) => {
    default_canvas_size = size
    {
        var canvas = $("#myCanvas")[0];
        canvas.width = size.width
        canvas.height = size.height
    }
    {
        var canvas = $("#hideCanvas")[0];
        canvas.width = size.width
        canvas.height = size.height
    }
}

/* update ui */
let g_closed_icon = '<span class="glyphicon glyphicon-chevron-right"></span>'
let g_opened_icon = '<span class="glyphicon glyphicon-chevron-down"></span>'
let g_tree_menu = {}
let ItemHeight = 20

var switch_item = (item, mode) => {
    var id = item.attr('id')
    if (item.length == 0) return
    var icon = item.children('.title').children('.icon')
    if (icon.children('span').length == 0) {
        item.removeClass('opened')
        item.addClass('closed')
        return
    }
    
    if (item.hasClass('closed') || mode == 'open') {
        // open
        item.removeClass('closed')
        item.addClass('opened')
        // change icon
        icon.html(g_opened_icon)
        // animate height
        item.animate({height: 'auto'}, 'fast', () => {        
            item.children('.sub-level').show()
        })
    }
    else if (item.hasClass('opened') || mode == 'close'){
        // close
        item.removeClass('opened')
        item.addClass('closed')
        // change icon
        icon.html(g_closed_icon)
        item.children('.sub-level').hide()
        item.animate({height: 'auto'}, 'fast')
    }
}

var switch_item_id = (id, mode) => {
    var item = $("#" + id)
    switch_item(item, mode)
}

var calculate_depth = (item) => {
    var depth = 0
    if (!item.hasClass('level')) {
        item = item.parent().closest('.level')
    }
    // invalid id
    if (item.length == 0) return -1
    while (true) {
        var prev = item.parent().closest('.level')
        if (prev.length == 0) break
        item = prev
        depth += 1
    }
    return depth
}

var calculate_depth_id = (id) => {
    var item = $("#" + id);
    return calculate_depth(item)
}

const layer_template = '\
    <div id="#layer_id" class="level sub-level">\
        <div class="title clearfix">\
            <div class="icon fluid"></div>\
            <div class="txt fluid">#layer_name</div>\
        </div>\
    </div>'

var add_icon = (id) => {
    var item = $("#" + id);
    if (!item.hasClass('level')) {
        item = item.parent().closest('.level')
    }
    if (item.length == 0) { console.log('fail to add icon'); return }

    // update icon
    item.children('.title').children('.icon').html(g_opened_icon)
    switch_item(item, 'open')
}

var add_click_callback = () => {
    // append click
    $('.level').click(function(event) {
        var item = $(event.target).closest('.level')
        switch_item(item)
    });
}

var update_tree_menu = (tree_menu, item_id, father_id) => {
    // tree_menu.forEach((val, index, arr) => {
    //     if (val.id == father_id) {
    //         val.sub_menu.push({
    //             id: item_id,
    //             height: ItemHeight,
    //             sub_menu: []
    //         })
    //         val.height += ItemHeight
    //         return
    //     }
    //     else {
    //         update_tree_menu(val.sub_menu, item_id, father_id)
    //     }
    // })
    tree_menu[item_id] = 0
}

var add_item = (item_id, item_name, father_id) => {
    depth = calculate_depth_id(father_id) + 1
    if (depth <= 0) return
    // update g_tree_menu
    update_tree_menu(g_tree_menu, item_id, father_id)
    var new_txt = layer_template.replace(/#layer_id/, item_id).replace(/#layer_name/, item_name)
    // new html
    $("#" + father_id).append(new_txt)
    // add icon
    add_icon(father_id)
    // padding
    var padding = (5 + depth * 16) + 'px';
    $("#" + item_id).children('.title').css('padding-left', padding)
}

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

    add_click_callback()
    g_tree_menu['layers'] = 0
    g_tree_menu['morph'] = 0

    console.log(g_tree_menu)

    add_item('layer_test', 'test', 'layers')
    add_item('layer_test0', 'test0', 'layers')
    add_item('layer_test_t', 'test_t', 'layer_test')
    add_item('layer_test_t_t', 'test_t', 'layer_test_t')

    console.log("document is ready.")
}) 