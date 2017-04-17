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
    console.log("document is ready.")
}) 