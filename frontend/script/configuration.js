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
            name_map: { LAYER: 0, MORPH: 0 }, // record all the name used
            menu: [
                { name: 'LAYER', is_open: false, sub_menu: [] },
                { name: 'MORPH', is_open: false, sub_menu: [] }
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
        if (this.draft) this.draft.draw()
        // does not any texture
        // draw the parts
        for (var i = 0; i < parts.length; ++i) {
            parts[i].draw()
        }
    }

    update_ui() {
        
    }
}