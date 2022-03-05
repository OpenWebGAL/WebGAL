import { runtime } from "@/store";
import type { Runtime, Script } from "@/types";
import { exit } from "@/utils";

export const compatibilityList = new Map([
    [/-next/i, ({ command, content, runtime }: Script & { runtime: Runtime }) => {
        const direction = /-right/i.test(content) ? '_right' : /-left/i.test(content) ? '_left' : ''
        runtime.sceneScripts[runtime.SentenceID] = [`${command + direction}_next`, content.replace(/\s*(-next|-left|-right)\s*/g, '')]
    }],
    [/-left|-right/i, ({ command, content, runtime }: Script & { runtime: Runtime }) => {
        const direction = /-right/i.test(content) ? '_right' : /-left/i.test(content) ? '_left' : ''
        runtime.sceneScripts[runtime.SentenceID] = [command + direction, content.replace(/\s*(-left|right)\s*/g, '')]
    }],
    [/-.+\.(ogg|mp3|aac|cd|wav|wma|flac|ape)/i, ({ command, content, runtime }: Script & { runtime: Runtime }) => {
        const reg = /-.+\.(ogg|mp3|aac|cd|wav|wma|flac|ape)/i
        const match = content.match(reg)!
        const newContent = match[0].replace('-', '') + ',' + content.replace(reg, '')
        runtime.sceneScripts[runtime.SentenceID] = [command, newContent]
    }],
])

export const setCompatibility = async (o: Script & { runtime: Runtime }) => {
    for (const [key, handleFn] of compatibilityList) {
        if (!exit(o.content) && key.test(o.command)) {
            await handleFn({
                ...o,
                command: runtime.command,
                content: o.command
            })
            break
        } else if (exit(o.content) && key.test(o.content)) {
            await handleFn(o)
            break
        }
    }
}