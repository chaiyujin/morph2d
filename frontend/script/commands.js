class Command {
    constructor() {
        this._commands = []
        this._top = -1
    }

    push(cmd) {
        this._top++
        if (this._top >= this._commands.length)
            this._commands.push(cmd)
        else
            this._commands[this._top] = cmd
    }

    push_exec(cmd) {
        this.push(cmd)
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

    clear() {
        this._top = -1
        this._commands = []
    }
}

Commands = new Command()