// Author:  Chai yujin
// Time:    2017.04.22
// Simple description:
// For rows * cols 3-dimension bezier surfaces
// 1.   Every bezier surface has 4 control points
//      and you can modify all the 4 control points
// 2.   However, the control points on border cannot be modified
// 3.   The surface is drawed with html5 canvas

let threshold_sqr_len = 2 * 2

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
        this.x = nx
        this.y = ny
    }

    draw(canvas) {
        drawPoint(canvas, this)
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
    constructor(n_samples, ctrl_pts, show_edge) {
        this._n_samples = n_samples
        this._ctrl_pts = ctrl_pts
        // add 12 to 15
        this._ctrl_pts.push(new Point(this._ctrl_pts[1].x, this._ctrl_pts[4].y))
        this._ctrl_pts.push(new Point(this._ctrl_pts[2].x, this._ctrl_pts[4].y))
        this._ctrl_pts.push(new Point(this._ctrl_pts[2].x, this._ctrl_pts[5].y))
        this._ctrl_pts.push(new Point(this._ctrl_pts[1].x, this._ctrl_pts[5].y))
        this._idx_map = [0,  1,  2,  3,
                        11, 12, 13, 4,
                        10, 15, 14, 5,
                        9,  8,  7,  6]
        this._B = [1, 3, 3, 1]
        // the show edge
        this._draw_edge = show_edge
    }

    B(i, u) {
        console.log(u + " " + i + " " + Math.pow(u, i))
        return this._B[i] * Math.pow(u, i) * Math.pow(1 - u, 4 - i)
    }

    point(u, v) {
        var p = {x: 0.0, y: 0.0}
        var index = 0
        for (var r = 0; r < 4; ++r) {
            for (var c = 0; c < 4; ++c) {
                var idx = this._idx_map[index++]
                p.x += this.B(r, v) * this.B(c, u) * this._ctrl_pts[idx].x
                p.y += this.B(r, v) * this.B(c, u) * this._ctrl_pts[idx].y
                // console.log(this.B(r, v) + " " +  this.B(c, u))
            }
        }
        console.log(p.x + " " + p.y)
        return p
    }

    draw(canvas) {
        console.log('bezier')
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
                du = 1 / this._n_samples
            }
            else if (this._draw_edge[s] == 1) {
                u = 1
                dv = 1 / this._n_samples
            }
            else if (this._draw_edge[s] == 2) {
                v = 1
                du = 1 / this._n_samples
            }
            else {
                dv = 1 / this._n_samples
            }
            for (var i = 0; i < this._n_samples; ++i) {
                samples.push(this.point(u, v))
                u += du
                v += dv
            }
            console.log(samples)
            drawLines(canvas, samples)
        }
    }
}

class BezierSurfaces {
    constructor(cols, rows, width, height, samples) {
        // add points
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
                this._beziers.push(new BezierSurface(samples, this.pick_pts(r, c), show_edge))
            }
        }
    }

    draw(canvas) {
        // border
        // var old_lw = canvas.lineWidth
        canvas.lineWidth = 2
        canvas.strokeStyle="RGBA(0,0,0, 0.5)"
        canvas.strokeRect(0, 0, this._width, this._height)
        // canvas.lineWidth = old_lw
        // inner
        // for (var i = 0; i < this._beziers.length; ++i) {
        //     this._beziers[i].draw(canvas)
        // }
        this._beziers[0].draw(canvas)

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
}