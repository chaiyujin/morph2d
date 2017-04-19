class Part {
    constructor(source_texture, triangle_mesh) {
        this.source = source_texture
        this.mesh = triangle_mesh
    }

    get source()    { return this._source }
    get mesh()      { return this._mesh}

    set source(v)   { this._source = v }
    set mesh(v)     { this._mesh = v }

}
// the configuration is a state of the program
class Configuration {
    constructor() {
        // the background thing
        this.draft = null
        this.textures = []
        // the parts of final image
        this.parts = []
        // the morphs
        this.morph_list = []
        
        // for ui
        this.tree_menu = {
            chosen: null, // record the name of chosen item
            id_map: { layers: 0, morphs: 0, morphsaaa: 0 }, // record all the name used
            menu: [
                { name: 'LAYER', id: 'layers', is_open: false, sub_menu: [] },
                { name: 'MORPH', id: 'morphs', is_open: false, sub_menu: [] }
            ] // the structure of the menu, if sub_menu is empty, it's an item
        }
    }

    get draft()      { return this._draft }
    get textures()   { return this._textures }
    get parts()      { return this._parts }
    get morph_list() { return this._morph_list }

    set draft(v)     { this._draft = v }
    set textures(v)  { this._textures = v }
    set parts(v)     { this._parts = v }
    set morph_list(v){ this._morph_list = v }

    draw() {
        // draw draft if exits
        if (this.draft) this.draft.draw(0.5) //
        // does not any texture
        // draw the parts
        for (var i = 0; i < parts.length; ++i) {
            parts[i].draw()
        }
    }

    update_ui() {
        Configuration.draw_menu(this.tree_menu.menu, this.tree_menu.id_map, $('#tree-menu'), 0)
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
                ui.children('.title').children('.icon').html(OpenedIcon)
                switch_item(ui, 'open')
                cur = ui.children('#' + menu[i].id)
            }
            if (i > 0) {
                cur.insertAfter('#' + menu[i - 1].id)
            }
        }
        // go into 
    }
}

g_configuration = new Configuration()