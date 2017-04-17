// for history
class Operation {
    constructor(type, detail, do_func, undo_func) {
        this.type = type
        this.detail = detail
        this._do_func = do_func
        this._undo_func = undo_func
    }

    get type() { return this._type }
    set type(v) { this._type = v }
    get detail() { return this._detail }
    set detail(v) { this._detail = v }

    do() {
        this._do_func(this.detail)
    }

    undo() {
        this._undo_func(this.detail)
    }
}

class History {
    constructor() {
        this._ops = []
        this._top = -1
    }

    add_operation(detail, do_func, undo_func) {
        if (!do_func)
            do_func = () => {}
        if (!undo_func)
            undo_func = () => {}
        var op = new Operation('', detail, do_func, undo_func)
        this._top ++
        while (this._top < this._ops.length)
            this._ops.pop()
        this._ops.push(op)
        this._ops[this._top].do()
    }

    undo() {
        if (this._top < 0) return
        this._ops[this._top--].undo()
    }

    redo() {
        if (this._top >= this._ops.length - 1) return
        this._ops[++this._top].do()
    }
}


let g_history = new History()