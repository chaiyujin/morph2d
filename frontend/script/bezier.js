// Author:  Chai yujin
// Time:    2017.04.22
// Simple description:
// For rows * cols 3-dimension bezier surfaces
// 1.   Every bezier surface has 4 control points
//      and you can modify all the 4 control points
// 2.   However, the control points on border cannot be modified
// 3.   The surface is drawed with html5 canvas

let threshold_sqr_len = 36
let MAX_EPS = 100000
let RESOLUTION_SCALE = 3

class Point {
    constructor(x, y) {
        this._x = x
        this._y = y
    }

    get x() { return this._x }
    get y() { return this._y }
    set x(v) { this._x = v }
    set y(v) { this._y = v }

    fit(nx, ny) {
        var sqr_len = (nx - this.x) * (nx - this.x) + 
                      (ny - this.y) * (ny - this.y)
        if (sqr_len < threshold_sqr_len)
            return true
        else
            return false
    }

    move(nx, ny) {
        say_message('Move point to [' + nx + ', ' + ny + '].')
        this.x = nx
        this.y = ny
    }

    draw(canvas) {
        drawPoint(canvas, this)
    }
}

class PointMoveCommand {
    constructor(father, point, old_pos, new_pos) {
        this._father = father
        this._point = point
        this._old_pos = old_pos
        this._new_pos = new_pos
    }

    exec() {
        this._point.move(this._new_pos.x, this._new_pos.y)
        this._father._reverse_updated = false
        g_configuration.draw()
    }

    undo() {
        this._point.move(this._old_pos.x, this._old_pos.y)
        this._father._reverse_updated = false
        g_configuration.draw()
    }
}

class BezierSurface {
    // potins in clock-wise, start from the left-up corner
    // 0 > 1 > 2 > 3
    //             v
    // 11>12 >13   4
    // ^       v   v
    // 10 15< 14   5
    // ^           v
    // 9 < 8 < 7 < 6
    constructor(surfs, n_samples, ctrl_pts, show_edge) {
        this._n_samples = n_samples
        this._ctrl_pts = ctrl_pts
        // add 12 to 15
        this._ctrl_pts.push(new Point(this._ctrl_pts[1].x, this._ctrl_pts[4].y))
        this._ctrl_pts.push(new Point(this._ctrl_pts[2].x, this._ctrl_pts[4].y))
        this._ctrl_pts.push(new Point(this._ctrl_pts[2].x, this._ctrl_pts[5].y))
        this._ctrl_pts.push(new Point(this._ctrl_pts[1].x, this._ctrl_pts[5].y))
        // for (var i = 12; i < 16; ++i) {
        //     surfs._ctrl_pts.push(this._ctrl_pts[i])
        // }

        this._idx_map = [0,  1,  2,  3,
                        11, 12, 13, 4,
                        10, 15, 14, 5,
                        9,  8,  7,  6]
        this._B = [1, 3, 3, 1]
        // the show edge
        this._draw_edge = show_edge
    }

    B(i, u) {
        return this._B[i] * Math.pow(u, i) * Math.pow(1 - u, 3 - i)
    }

    point(u, v) {
        var p = {x: 0.0, y: 0.0}
        var index = 0
        for (var r = 0; r < 4; ++r) {
            for (var c = 0; c < 4; ++c) {
                var idx = this._idx_map[index++]
                p.x += this.B(r, v) * this.B(c, u) * this._ctrl_pts[idx].x
                p.y += this.B(r, v) * this.B(c, u) * this._ctrl_pts[idx].y
            }
        }
        return p
    }

    draw(canvas) {
        // border
        for (var s = 0; s < this._draw_edge.length; ++s) {
            var i = this._draw_edge[s] * 3
            // draw the draw_edge[s]-th edge, start from point[i]
            dashedLineTo(canvas, this._ctrl_pts[i], this._ctrl_pts[i + 1])
            dashedLineTo(canvas, this._ctrl_pts[i + 2], this._ctrl_pts[(i + 3) % 12])
            // lineTo(canvas, this._ctrl_pts[i], this._ctrl_pts[(i + 3) % 12])
            // draw one line
            var samples = []
            var u = 0, v = 0
            var du = 0, dv = 0
            if (this._draw_edge[s] == 0) {
                du = 1 / (this._n_samples - 1)
            }
            else if (this._draw_edge[s] == 1) {
                u = 1
                dv = 1 / (this._n_samples - 1)
            }
            else if (this._draw_edge[s] == 2) {
                v = 1
                du = 1 / (this._n_samples - 1)
            }
            else {
                dv = 1 / (this._n_samples - 1)
            }
            for (var i = 0; i < this._n_samples; ++i) {
                samples.push(this.point(u, v))
                u += du
                v += dv
            }
            drawLines(canvas, samples)
        }
        // inner
        {
            {
                var samples = []
                var u = 1 / 3, v = 0
                var du = 0, dv = 1 / (this._n_samples - 1)
                for (var i = 0; i < this._n_samples; ++i) {
                    samples.push(this.point(u, v))
                    u += du
                    v += dv
                }
                drawLines(canvas, samples)
            }
            {
                var samples = []
                var u = 2 / 3, v = 0
                var du = 0, dv = 1 / (this._n_samples - 1)
                for (var i = 0; i < this._n_samples; ++i) {
                    samples.push(this.point(u, v))
                    u += du
                    v += dv
                }
                drawLines(canvas, samples)
            }
            {
                var samples = []
                var u = 0, v = 1 / 3
                var dv = 0, du = 1 / (this._n_samples - 1)
                for (var i = 0; i < this._n_samples; ++i) {
                    samples.push(this.point(u, v))
                    u += du
                    v += dv
                }
                drawLines(canvas, samples)
            }
            {
                var samples = []
                var u = 0, v = 2 / 3
                var dv = 0, du = 1 / (this._n_samples - 1)
                for (var i = 0; i < this._n_samples; ++i) {
                    samples.push(this.point(u, v))
                    u += du
                    v += dv
                }
                drawLines(canvas, samples)
            }
        }
    }

    update_reverse_map(index, map, duv, width, height) {
        var du = duv.du, dv = duv.dv
        for (var u = 0; u <= 1; u += du) {
            for (var v = 0; v <= 1; v += dv) {
                var point = this.point(u, v)
                var p = {x: Math.round(point.x), y: Math.round(point.y)}
                var eps = Math.abs(p.x - point.x) + Math.abs(p.y - point.y)
                var idx = width * p.y + p.x
                if (p.y >= height || p.x >= width) {
                    // console.log(u + ' ' + v + ' ' + p.x + ' '+ p.y)
                    continue
                }
                // if (u == 0 || v == 0) {
                //     console.log(u + ' ' + v + ' ' + p.x + ' '+ p.y)

                // }
            
                if (map[idx].eps > eps) {
                    map[idx].u = u
                    map[idx].v = v
                    map[idx].idx = index
                    map[idx].eps = eps
                }
            }
        }
    }
}

class BezierSurfaces {
    constructor(cols, rows, width, height, samples) {
        // reverse map
        this._reverse_map = null
        this._reverse_updated = false
        // add points
        this._canvas = null
        this._clicked_old_pos = null
        this._clicked = null
        this._samples = samples
        this._width = width
        this._height = height
        this._cols = cols
        this._rows = rows
        this._pts_on_row = []
        this._pts_on_col = []
        this._pts_on_cor = []
        this._beziers = []
        this._ctrl_pts = []
        var dx = width / (3 * cols)
        var dy = height / (3 * rows)
        // add points on rows
        var x = 0, y = 0
        for (var r = 0; r <= rows; ++r) {
            x = dx
            for (var c = 0; c < cols; ++c) {
                var p0 = new Point(x, y)
                var p1 = new Point(x + dx, y)
                this._pts_on_row.push(p0)
                this._pts_on_row.push(p1)
                x += dx * 3
                // add to controllable points
                if (0 < r && r < rows) {
                    this._ctrl_pts.push(p0)
                    this._ctrl_pts.push(p1)
                }
            }
            y += dy * 3
        }
        // add points on cols
        x = 0, y = 0
        for (var c = 0; c <= cols; ++c) {
            y = dy
            for (var r = 0; r < rows; ++r) {
                var p0 = new Point(x, y)
                var p1 = new Point(x, y + dy)
                this._pts_on_col.push(p0)
                this._pts_on_col.push(p1)
                y += dy * 3
                // add to controllable points
                if (0 < c && c < cols) {
                    this._ctrl_pts.push(p0)
                    this._ctrl_pts.push(p1)
                }
            }
            x += dx * 3
        }
        // add points on corner
        x = 0, y = 0
        for (var r = 0; r <= rows; ++r) {
            x = 0
            for (var c = 0; c <= cols; ++c) {
                var p = new Point(x, y)
                this._pts_on_cor.push(p)
                x += dx * 3
                // add to controllable points
                if ((0 < r && r < rows) &&
                    (0 < c && c < cols)) {
                    this._ctrl_pts.push(p)
                }
            }
            y += dy * 3
        }
        // add surfaces
        for (var r = 0; r < rows; ++r) {
            for (var c = 0; c < cols; ++c) {
                var show_edge = []
                if (0 < r)          show_edge.push(0)
                if (c < cols - 1)   show_edge.push(1)
                if (r < rows - 1)   show_edge.push(2)
                if (0 < c)          show_edge.push(3)
                this._beziers.push(new BezierSurface(this, samples, this.pick_pts(r, c), show_edge))
            }
        }
    }

    draw(canvas) {
        if (!canvas) return
        if (this._canvas == null) this._canvas = canvas
        // border
        // var old_lw = canvas.lineWidth
        canvas.lineWidth = 2
        canvas.strokeStyle="RGBA(0,0,0, 0.5)"
        canvas.strokeRect(0, 0, this._width, this._height)
        // canvas.lineWidth = old_lw
        // inner
        for (var i = 0; i < this._beziers.length; ++i) {
            this._beziers[i].draw(canvas)
        }

        for (var i = 0; i < this._ctrl_pts.length; ++i) {
            this._ctrl_pts[i].draw(canvas)
        }
    }

    pick_pts(row, col) {
        var pts = []
        var cor_idx = (this._cols + 1) * row + col
        var row_idx = (this._cols * 2) * row + (2 * col)
        var col_idx = (this._rows * 2) * col + (2 * row)
        var stripe_cor = this._cols + 1
        var stripe_row = this._cols * 2
        var stripe_col = this._rows * 2
        // 1st edge
        pts.push(this._pts_on_cor[cor_idx])
        pts.push(this._pts_on_row[row_idx])
        pts.push(this._pts_on_row[row_idx + 1])
        // 2nd edge
        pts.push(this._pts_on_cor[cor_idx + 1])
        pts.push(this._pts_on_col[col_idx + this._rows * 2])
        pts.push(this._pts_on_col[col_idx + this._rows * 2 + 1])
        // 3rd edge
        pts.push(this._pts_on_cor[cor_idx + stripe_cor + 1])
        pts.push(this._pts_on_row[row_idx + stripe_row + 1])
        pts.push(this._pts_on_row[row_idx + stripe_row])
        // 4th edge
        pts.push(this._pts_on_cor[cor_idx + stripe_cor])
        pts.push(this._pts_on_col[col_idx + 1])
        pts.push(this._pts_on_col[col_idx])

        return pts
    }

    mousedown(x, y) {
        this._clicked = null
        this._clicked_old_pos = null
        for (var i = 0; i < this._ctrl_pts.length; ++i) {
            if (this._ctrl_pts[i].fit(x, y)) {
                this._clicked = this._ctrl_pts[i];
                this._clicked_old_pos = { x: this._clicked.x, y: this._clicked.y }
                break;
            }
        }
    }

    mouseup(x, y) {
        if (this._clicked != null) {
            Commands.push(new PointMoveCommand(this, this._clicked, this._clicked_old_pos, {x: x, y: y}))
            this._clicked = null
            this._clicked_old_pos = null
        }
    }

    mousemove(x, y) {
        if (this._clicked) {
            this._clicked.move(x, y)
            this._reverse_updated = false
            g_configuration.draw()
        }
    }

    interplate_to(s1, t, surfs) {
        if (!surfs) {
            surfs = new BezierSurfaces(this._cols, this._rows, this._width, this._height, this._samples)
        }
        for (var i = 0; i < this._ctrl_pts.length; ++i) {
            surfs._ctrl_pts[i].x = this._ctrl_pts[i].x * (1 - t) + s1._ctrl_pts[i].x * t
            surfs._ctrl_pts[i].y = this._ctrl_pts[i].y * (1 - t) + s1._ctrl_pts[i].y * t
        }
        return surfs
    }

    point(idx, u, v) {
        return this._beziers[idx].point(u, v)
    }

    get reverse_map() { return this._reverse_map }
    update_reverse_map() {
        if (this._reverse_updated == true) return
        console.log("reverse")
        // new reverse_map
        if (!this._reverse_map) {
            this._reverse_map = []
            for (var y = 0; y < this._height; ++y) {
                for (var x = 0; x < this._width; ++x) {
                    this._reverse_map.push({u: 0, v: 0, idx: 0, eps: MAX_EPS})
                }
            }
        }
        // update
        var du = this._cols / this._width / RESOLUTION_SCALE
        var dv = this._rows / this._height / RESOLUTION_SCALE
        for (var i = 0; i < this._beziers.length; ++i) {
            this._beziers[i].update_reverse_map(i, this._reverse_map, {du: du, dv: dv}, this._width, this._height)
        }
        // check each (x, y) has (u, v)
        var index = 0
        for (var y = 0; y < this._height; ++y) {
            for (var x = 0; x < this._width; ++x) {
                if (this._reverse_map[index].eps >= MAX_EPS) {
                    // interplate
                    var u = null, l = null
                    if (x > 0) { l = this._reverse_map[index - 1] }
                    if (y > 0) { u = this._reverse_map[index - this._width] }
                    if (!u) u = l
                    if (!l) l = u
                    // impossible
                    if (!u && !l) alert('Error in reverse map!')
                    this._reverse_map[index].u = (l.u + u.u) / 2
                    this._reverse_map[index].v = (l.v + u.v) / 2
                    this._reverse_map[index].eps = (l.eps + u.eps) / 2
                }
                ++index
            }
        }
        
        console.log("reverse done")
        this._reverse_updated = true
    }
}


var mousedown_callback = (event) => {
    var surface = null;
    if (event.target.id == 'sourceCanvas')
        surface = g_configuration.source_surface
    else if (event.target.id == 'targetCanvas')
        surface = g_configuration.target_surface
    
    if (surface)
        surface.mousedown(event.offsetX, event.offsetY)
}

var mouseup_callback = (event) => {
    var surface = null;
    if (event.target.id == 'sourceCanvas')
        surface = g_configuration.source_surface
    else if (event.target.id == 'targetCanvas')
        surface = g_configuration.target_surface
    
    if (surface)
        surface.mouseup(event.offsetX, event.offsetY)
}

var mousemove_callback = (event) => {
    var surface = null;
    if (event.target.id == 'sourceCanvas')
        surface = g_configuration.source_surface
    else if (event.target.id == 'targetCanvas')
        surface = g_configuration.target_surface
    
    if (surface)
        surface.mousemove(event.offsetX, event.offsetY)
}

// return a list of steps frames of interplated bezier surfaces 
var interplate_bezier_surfaces = (source, target, t) => {
   var tmp = null
    tmp = source.interplate_to(
        target, t, tmp
    )     
    return tmp
}

var interplate_canvas_according_to_bezier = (
        source, source_beizer, 
        target, target_bezier,
        t, result) => {
    var width = source_beizer._width, height = source_beizer._height
    if (width != target_bezier._width || height != target_bezier._height) return
    if (!result) return

    var t_bezier = interplate_bezier_surfaces(source_beizer, target_bezier, t)
    source_beizer.update_reverse_map()
    target_bezier.update_reverse_map()
    t_bezier.update_reverse_map()
    var index = 0
    for (var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            var uv = t_bezier.reverse_map[index]
            var ps = source_beizer.point(uv.idx, uv.u, uv.v)
            var pt = target_bezier.point(uv.idx, uv.u, uv.v)
            var img_idx = index * 4
            var src_idx = (Math.round(ps.y) * width + Math.round(ps.x)) * 4
            var dst_idx = (Math.round(pt.y) * width + Math.round(pt.x)) * 4
            for (var k = 0; k < 4; ++k) {
                result.data[img_idx + k] = source.data[src_idx + k] * (1 - t) + 
                                           target.data[dst_idx + k] * t
            }
            ++index
        }
    }
    return result
}

var get_interplate_image_data = (t) => {
    g_configuration.source.draw(g_configuration.source_canvas, 1)
    g_configuration.target.draw(g_configuration.target_canvas, 1)
    var source_data = g_configuration.source_canvas.getImageData(0, 0, default_canvas_size.width, default_canvas_size.height)
    var target_data = g_configuration.target_canvas.getImageData(0, 0, default_canvas_size.width, default_canvas_size.height)
    var result = g_configuration.source_canvas.createImageData(default_canvas_size.width, default_canvas_size.height)
    result = interplate_canvas_according_to_bezier(
        source_data,
        g_configuration.source_surface,
        target_data,
        g_configuration.target_surface,
        t, result
    )    
    g_configuration.draw()
    return result
}

var generate_animation = (steps) => {
    if (!g_configuration.source || !g_configuration.target) {
        alert("Please choose source and target image first.")
        return
    }
    for (var t = 0, i = 0; i <= steps; ++i, t += 1 / (steps)) {
        var tmp = get_interplate_image_data(t)
        g_hide_canvas.putImageData(tmp, 0, 0)
        exportCanvasAsPNG('hideCanvas', "result_" + i + ".png")
    }
}