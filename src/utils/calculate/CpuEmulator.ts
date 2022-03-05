export default class CpuEmulator {
    private ins
    private memory: number[] = []
    private re = /^(push)\s\w+/
    constructor(instructions: string) {
        this.ins = instructions.split('\r\n')
        this.execute()
    }
    private execute() {
        this.ins.forEach(i => {
            switch (i) {
                case 'add':
                    this.add()
                    break
                case 'sub':
                    this.sub()
                    break
                case 'mul':
                    this.mul()
                    break
                case 'div':
                    this.div()
                    break
                default:
                    if (this.re.test(i)) {
                        this.push(i.split(' ')[1])
                    }
            }
        })
    }

    private add() {
        const b = this.pop() ?? 0
        const a = this.pop() ?? 0
        this.memory.push(a + b)
    }

    private sub() {
        const b = this.pop() ?? 0
        const a = this.pop() ?? 0
        this.memory.push(a - b)
    }

    private mul() {
        const b = this.pop() ?? 0
        const a = this.pop() ?? 0
        this.memory.push(a * b)
    }

    private div() {
        const b = this.pop() ?? 0
        const a = this.pop() ?? 0
        if (b === 0) {
            throw new Error('除数不能为0')
        }
        // 不支持浮点运算，所以在这要取整
        this.memory.push(Math.floor(a / b))
    }

    private push(x: string) {
        this.memory.push(parseInt(x))
    }

    private pop() {
        return this.memory.pop()
    }

    getResult() {
        return this.memory[0]
    }
}