import type AssemblyWriter from './AssemblyWriter'
// 语法分析器
export default class Parser {
    private writer: AssemblyWriter
    private tokens: string[]
    private i = -1
    private opMap1: Record<string, string> = {
        '+': 'add',
        '-': 'sub',
    }
    private opMap2: Record<string, string> = {
        '/': 'div',
        '*': 'mul'
    }
    private token: string = ''
    constructor(tokens: string[], writer: AssemblyWriter) {
        this.tokens = tokens
        this.writer = writer
        this.init()
    }

    private init() {
        this.compileExpression()
    }

    private compileExpression() {
        this.compileAddExpr()
    }

    private compileAddExpr() {
        this.compileMultExpr()
        while (true) {
            this.getNextToken()
            if (this.opMap1[this.token]) {
                let op = this.opMap1[this.token]
                this.compileMultExpr()
                this.writer.writeOP(op)
            } else {
                // 没有匹配上相应的操作符 这里为没有匹配上 + - 
                // 将 token 索引后退一位
                this.i--
                break
            }
        }
    }

    private compileMultExpr() {
        this.compileTerm()
        while (true) {
            this.getNextToken()
            if (this.opMap2[this.token]) {
                let op = this.opMap2[this.token]
                this.compileTerm()
                this.writer.writeOP(op)
            } else {
                // 没有匹配上相应的操作符 这里为没有匹配上 * / 
                // 将 token 索引后退一位
                this.i--
                break
            }
        }
    }

    private compileTerm() {
        this.getNextToken()
        if (this.token === '(') {
            this.compileExpression()
            this.token = this.tokens[++this.i]
            if (this.token !== ')') {
                throw '缺少右括号：)'
            }
        } else if (/^\d+$/.test(this.token)) {
            this.writer.writePush(this.token)
        } else {
            throw '错误的 token：第 ' + (this.i + 1) + ' 个 token (' + this.token + ')'
        }
    }

    private getNextToken() {
        this.token = this.tokens[++this.i]
    }

    getInstructions() {
        return this.writer.outputStr()
    }
}