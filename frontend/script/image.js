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

    draw(alpha) {
        if (this._img_data != null) {
            draw_data_on(this._img_data, g_canvas, alpha)
        }
    }

    destroy() {
        delete this._img_data
        this._img_data = null
    }
}

var draw_data_on = (img_data, canvas, alpha) => {
    if (!alpha) alpha = 1
    var index = 0
    var pixel = canvas.getImageData(0, 0, img_data.width, img_data.height)
    for (var x = 0; x < img_data.width; ++x) {
        for (var y = 0; y < img_data.height; ++y) {
            var a = img_data.data[index + 3] / 255.0 * alpha;
            for (var k = 0; k < 3; ++k) {
                img_data.data[index + k] = img_data.data[index + k] * a + 
                                           pixel.data[index + k] * (1 - a)
            }
            img_data.data[index + 3] = 255
            index += 4
        }
    }
    canvas.putImageData(img_data, 0, 0)
}

var draw_scene = (alpha) => {
    // clear
    g_canvas.fillStyle="#fff";
    g_canvas.fillRect(
        0, 0,
        default_canvas_size.width, default_canvas_size.height
    );
    // draw shitae
    if (shitae) {
        shitae.draw(0.5)
    }
}

/* when a new image coming in */
var update_shitae = () => {
    if (!g_image_url || !g_image_size) {
        delete shitae
        shitae = null
        var id = 'layer_' + BackgroundName
        remove_id_from_menu(id)
        draw_scene()
        return
    }
    if (shitae != null) shitae.destroy()
    add_layer(BackgroundName)
    shitae = new Image('shitae', g_image_size, g_image_url, ()=>{ 
        draw_scene()
     })
}

var update_texture = () => {
    if (!g_image_url || !g_image_size) {
        delete texture
        texture = null
        var id = 'layer_' + TextureName
        remove_id_from_menu(id)
        return
    }
    if (texture != null) texture.destroy()
    add_layer(TextureName)
    texture = new Image('texture', g_image_size, g_image_url, ()=>{})
}

var add_image_do = (detail) => {
    g_image_url = detail.to.url
    g_image_size = detail.to.size
    var is_background = detail.to.is_background
    if (is_background) {
        update_shitae()
        say_message('new background from ' + detail.to.url)
    }
    else {
        update_texture()
        say_message('new texture from ' + detail.to.url)
    }
}

var add_image_undo = (detail) => {
    g_image_url = detail.from.url
    g_image_size = detail.from.size
    var is_background = detail.from.is_background
    if (is_background) {
        update_shitae()
        say_message('roll back background to ' + detail.from.url)
    }
    else {
        update_texture()
        say_message('roll back texture to ' + detail.from.url)
    }
}

var remove_modal = () => {
	$('body').children('.modal_background').remove();
	$('body').children('.modal_dialog').remove();
}

var confirm_image_type = () => {
    var is_texture = $("input[name = 'options_texture']")[0].checked
    var is_background = $("input[name = 'options_background']")[0].checked
    if (!is_texture && !is_background) return
    detail = {
        to: {
            url: g_new_image_url,
            size: g_new_image_size,
            is_background: is_background
        },
        from: {
            url: null,
            size: null,
            is_background: is_background
        }
    }
    if (is_background && shitae) {
        detail.from.url = shitae.src
        detail.from.size = shitae.size
    }
    else if (!is_background && texture) {
        detail.from.url = texture.src
        detail.from.size = texture.size
    }
    g_history.add_operation(detail, add_image_do, add_image_undo)
    remove_modal()
}

var image_type_query_template = '\
    <div class="modal_background" onclick="remove_modal()"></div>\
    <div class="modal_dialog">\
        <div class="middle">Which type is the image</div>\
        <div class="middle">\
            <div id="image_query" class="btn-group" data-toggle="buttons">\
                <label id="radio_texture" class="btn btn-primary">\
                    <input type="radio" name="options_texture" id="option1">' + TextureName + '\
                </label>\
                <label class="btn btn-primary">\
                    <input type="radio" name="options_background" id="option2">' +  BackgroundName + '\
                </label>\
            </div>\
        </div>\
        <div class="middle">\
            <button type="button" class="btn btn-default" onclick="confirm_image_type()">Confirm</button>\
        </div>\
    </div>'

var query_image_type = (only_shitae) => {
    remove_modal()
    $('body').append(image_type_query_template)
    if (only_shitae)
        $("#radio_texture").hide()
}

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
    
    draw_scene();
}