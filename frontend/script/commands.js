class Command {
    constructor() {
        this._commands = []
        this._top = -1
    }

    push_exec(cmd) {
        this._top++
        this._commands.push(cmd)
        this._commands[this._top].exec()
    }

    undo() {
        if (this._top < 0) return
        this._commands[this._top--].undo()
    }

    redo() {
        if (this._top >= this._commands.length - 1) return
        this._commands[++this._top].exec()
    }
}

Commands = new Command()