// the configuration is a state of the program
class Configuration {
    constructor() {
        // the background thing
        this._select = 'source'
        this.source_canvas = null
        this.target_canvas = null
        this.source = null
        this.target = null
        // the parts of final image
        this.source_surface = null
        // the morphs
        this.target_surface = null
        
        // for ui
        this.tree_menu = {
            chosen: null, // record the name of chosen item
            id_map: { source: 0, target: 0 }, // record all the name used
            menu: [
                { name: 'Source', id: 'source', is_open: false, sub_menu: [] },
                { name: 'Target', id: 'target', is_open: false, sub_menu: [] }
            ] // the structure of the menu, if sub_menu is empty, it's an item
        }
    }

    get source()    { return this._source }
    get target()    { return this._target }
    get source_canvas()  { return this._source_canvas }
    get target_canvas()  { return this._target_canvas }

    set source(v)   { this._source = v }
    set target(v)   { this._target = v }
    set source_canvas(v)  { this._source_canvas = v }
    set target_canvas(v)  { this._target_canvas = v }

    draw_img_surface(img, surface, canvas) {
        canvas.fillStyle="#fff";
        canvas.fillRect(
            0, 0,
            default_canvas_size.width, default_canvas_size.height
        );
        if (img) img.draw(canvas, 1)
        if (surface) surface.draw(canvas)
    }

    choose(which) {
        if (which == 'source') {
            this._select = 'source'
            $('#source').addClass('chosen')
            $('#target').removeClass('chosen')
            this.draw()
        }
        else if (which == 'target') {
            this._select = 'target'
            $('#source').removeClass('chosen')
            $('#target').addClass('chosen')
            this.draw()
        }
    }

    draw() {
        if (this._select == 'source') {
            $("#sourceCanvas").show()
            $("#targetCanvas").hide()
            this.draw_img_surface(this.source, this.source_surface, this._source_canvas)
        }
        else if (this._select == 'target') {
            $("#sourceCanvas").hide()
            $("#targetCanvas").show()
            this.draw_img_surface(this.target, this.target_surface, this._target_canvas)
        }
        else
            alert("Error!")
    }

    update_ui() {
        Configuration.draw_menu(this.tree_menu.menu, this.tree_menu.id_map, $('#tree-menu'), 0)
    }

    add_menu_item(name, id, father) {
        if (this.tree_menu.id_map[id] === undefined) {
            var res = Configuration.dfs_add_menu_item(this.tree_menu.menu, name, id, father)
            if (res) this.tree_menu.id_map[id] = 0
            this.update_ui()
        }
    }

    static draw_menu(menu, id_map, ui, depth) {
        var children = ui.children('.level')
        // remove unused level
        for (var i = 0; i < children.length; ++i) {
            if (id_map[children[i].id] === undefined)
                $(children[i]).remove()
        }
        // insert 
        for (var i = 0; i < menu.length; ++i) {
            var cur = ui.children('#' + menu[i].id)
            if (cur.length == 0) {
                id_map[menu[i].id] = 0
                var new_txt = layer_template.replace(/#layer_id/, menu[i].id)
                                            .replace(/#layer_name/, menu[i].name)
                ui.append(new_txt)
                // switch on
                ui.children('.title').children('.icon').html(OpenedIcon)
                switch_item(ui, 'open')
                // intent
                cur = ui.children('#' + menu[i].id)
                var padding = (5 + depth * 16);
                var width = 250 - padding - 16
                cur.children('.title').css('padding-left', padding + 'px')
                cur.children('.title').children('.txt').css('width', width + 'px')
            }
            if (i > 0) {
                cur.insertAfter('#' + menu[i - 1].id)
            }
        }
        // go into children
        for (var i = 0; i < menu.length; ++i) {
            Configuration.draw_menu(menu[i].sub_menu, id_map, ui.children('#' + menu[i].id), depth + 1)
        }
    }

    static dfs_add_menu_item(menu, name, id, father) {
        var res = false;
        for (var i = 0; i < menu.length; ++i) {
            if (res == true) return true
            if (menu[i].id == father) {
                menu[i].sub_menu.push({
                    name: name,
                    id: id,
                    is_open: false,
                    sub_menu: []
                })
                menu[i].is_open = true
                return true
            }
            else {
                res = Configuration.dfs_add_menu_item(menu[i].sub_menu, name, id, father)
            }
        }
        return false
    }

}
