// image class
class MyImage {
    constructor(name, size, url, callback) {
        this.name = name // to-do: check name
        this.size = size
        this.src = url
        this.corner = {
            x: (default_canvas_size.width - this.size.width) / 2,
            y: (default_canvas_size.height - this.size.height) / 2}
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

    move(delta) {
        this.corner.x += delta.x
        this.corner.y += delta.y
        this.load_image()
    }

    load_image() {
        console.log('load image')
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
        console.log('get data')
        g_hide_canvas.clearRect(0, 0,
                                g_hide_canvas.canvas.width,
                                g_hide_canvas.canvas.height)
        g_hide_canvas.drawImage(this._img, this.corner.x, this.corner.y)
        this._img_data = g_hide_canvas.getImageData(0, 0, default_canvas_size.width, default_canvas_size.height)
    }

    draw(canvas, alpha) {
        if (this._img_data != null) {
            draw_data_on(this._img_data, canvas, alpha)
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

class ImageCommand {
    constructor(is_source, img_size, img_url) {
        this._is_source = is_source
        this._size = img_size
        this._url = img_url
        if (is_source) {
            this._old_img = g_configuration.source
            this._img = new MyImage('source_img', this._size, this._url, ()=>{this.exec()})
        }
        else {
            this._old_img = g_configuration.target
            this._img = new MyImage('target_img', this._size, this._url, ()=>{this.exec()})
        }
    }

    exec() {
        if (this._is_source) {
            say_message('New source image')
            g_configuration.choose('source')
            g_configuration.source = this._img
        }
        else {
            say_message('New target image')
            g_configuration.choose('target')
            g_configuration.target = this._img
        }
        g_configuration.draw()
    }

    undo() {
        // if (this._is_source) {
        //     g_configuration.source = this._old_img
        //     g_configuration.choose('source')
        // }
        // else {
        //     g_configuration.target = this._old_img
        //     g_configuration.choose('target')
        // }
        // g_configuration.draw()
    }
}

var remove_modal = () => {
	$('body').children('.modal_background').remove();
	$('body').children('.modal_dialog').remove();
}

var confirm_image_type = () => {
    var is_source = $("input[name = 'options_source']")[0].checked
    var is_target = $("input[name = 'options_target']")[0].checked
    if (!is_source && !is_target) return
    Commands.push_exec(new ImageCommand(is_source, g_new_image_size, g_new_image_url))
    remove_modal()
}

var image_type_query_template = '\
    <div class="modal_background" onclick="remove_modal()"></div>\
    <div class="modal_dialog">\
        <div class="middle">Which type is the image</div>\
        <div class="middle">\
            <div id="image_query" class="btn-group" data-toggle="buttons">\
                <label class="btn btn-primary">\
                    <input type="radio" name="options_source" id="option1">' + SourceName + '\
                </label>\
                <label class="btn btn-primary">\
                    <input type="radio" name="options_target" id="option2">' +  TargetName + '\
                </label>\
            </div>\
        </div>\
        <div class="middle">\
            <button type="button" class="btn btn-default" onclick="confirm_image_type()">Confirm</button>\
        </div>\
    </div>'

var query_image_type = () => {
    remove_modal()
    $('body').append(image_type_query_template)
}

var update_canvas_size = (size) => {
    default_canvas_size = size
    {
        var canvas = $("#sourceCanvas")[0];
        canvas.width = size.width
        canvas.height = size.height
    }
    {
        var canvas = $("#targetCanvas")[0];
        canvas.width = size.width
        canvas.height = size.height
    }
    {
        var canvas = $("#hideCanvas")[0];
        canvas.width = size.width
        canvas.height = size.height
    }
    
    g_configuration.draw()
}

var dashedLineTo = function (canvas, p0, p1, pattern) {  
    var fromX = p0.x, fromY = p0.y
    var toX = p1.x, toY = p1.y
    // default interval distance -> 5px  
    if (typeof pattern === "undefined") {  
        pattern = 2;  
    }  
  
    // calculate the delta x and delta y  
    var dx = (toX - fromX);  
    var dy = (toY - fromY);  
    var distance = Math.floor(Math.sqrt(dx*dx + dy*dy));  
    var dashlineInteveral = (pattern <= 0) ? distance : (distance/pattern);  
    var deltay = (dy/distance) * pattern;  
    var deltax = (dx/distance) * pattern;  
      
    canvas.strokeStyle="RGBA(150,150,150, 0.5)";  

    canvas.beginPath();  
    for(var dl=0; dl<dashlineInteveral; dl++) {  
        if(dl%2) {  
            canvas.lineTo(fromX + dl*deltax, fromY + dl*deltay);  
        } else {                      
            canvas.moveTo(fromX + dl*deltax, fromY + dl*deltay);                    
        }                 
    }  
    canvas.stroke();  
};  

var lineTo = function (canvas, p0, p1) {
    var fromX = p0.x, fromY = p0.y
    var toX = p1.x, toY = p1.y
    canvas.strokeStyle="RGBA(150,150,150, 0.5)";
    canvas.beginPath();
    canvas.moveTo(fromX, fromY);    
    canvas.lineTo(toX, toY); 
    canvas.stroke();  
}

var drawPoint = function (canvas, p) {
    var x = p.x
    var y = p.y

    canvas.fillStyle="RGBA(0,0,0, 0.5)"
    canvas.fillRect(x - 4, y - 4, 8, 8)
    canvas.fillStyle="RGBA(150,150,150, 0.5)"
    canvas.fillRect(x - 3, y - 3, 6, 6)

}

var drawLines = function (canvas, samples) {
    canvas.strokeStyle="RGBA(150,150,150, 0.7)";  

    canvas.beginPath();
    canvas.moveTo(samples[0].x, samples[0].y);   
    for(var i = 1; i < samples.length; ++i) {  
        canvas.lineTo(samples[i].x, samples[i].y);           
    }  
    canvas.stroke();  
}

function exportCanvasAsPNG(id, fileName) {
    var canvasElement = document.getElementById(id);
    var MIME_TYPE = "image/png";
    var imgURL = canvasElement.toDataURL(MIME_TYPE);
    var dlLink = document.createElement('a');
    dlLink.download = fileName;
    dlLink.href = imgURL;
    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
}