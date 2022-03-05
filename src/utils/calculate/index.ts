import AssemblyWriter from './AssemblyWriter'
import Parser from './Parser'
import CpuEmulator from './CpuEmulator'
export class Calculater {
    private emulator: CpuEmulator
    constructor(str: string) {
        const tokens = this.lexicalAnalysis(str)
        const writer = new AssemblyWriter()
        const parser = new Parser(tokens, writer)
        const instructions = parser.getInstructions()
        this.emulator = new CpuEmulator(instructions)
    }
    // 词法分析 输出 tokens
    private lexicalAnalysis(expression: string) {
        const symbol = ['(', ')', '+', '-', '*', '/']
        const re = /\d/
        const tokens = []
        const chars = expression.trim().split('')
        let token = ''
        chars.forEach(c => {
            if (re.test(c)) {
                token += c
            } else if (c == ' ' && token) {
                tokens.push(token)
                token = ''
            } else if (symbol.includes(c)) {
                if (token) {
                    tokens.push(token)
                    token = ''
                }

                tokens.push(c)
            }
        })

        if (token) {
            tokens.push(token)
        }

        return tokens
    }
    getResult() {
        return this.emulator.getResult()
    }
}