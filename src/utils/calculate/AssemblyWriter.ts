// 汇编代码生成器
export default class AssemblyWriter {
    private output = ''
    writePush(digit: string) {
        this.output += `push ${digit}\r\n`
    }

    writeOP(op: string) {
        this.output += op + '\r\n'
    }

    //输出汇编代码
    outputStr() {
        return this.output
    }
}