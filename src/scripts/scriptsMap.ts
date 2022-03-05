import { PerformType, PixiRef, presetMap } from "@/Components/Stage/main/pixiContainer"
import type { ChooseMode, Runtime, Script } from "@/types"
import { Calculater, exit, getUrl, humpToLine } from "@/utils"
import { compact } from "lodash"
import { MutableRefObject } from "react"
import { getScene } from "."

export const manualList = new Map([
    [/^change[A-Za-z](?!_next)$/, async ({ command, content, runtime }: Script & { runtime: Runtime }) => {
        if (/^changeBG$/.test(command)) {
            return {
                bg_Name: content
            }
        } else if (/^changeP/.test(command)) {
            const o = command.match(/_.*(?=_)/)
            return {
                [`fig_Name${o ? o[0] : ''}`]: content
            }
        } else {
            return {}
        }
    }],
    [/^playVideo$/, async ({ content }: Script) => ({ video: content })],
    [/^intro$/, async ({ content }: Script) => ({ intro: content })]
])

export const autoList = new Map([
    [/^changeScene$/, async ({ content, runtime }: Script & { runtime: Runtime }) => {
        runtime.sceneScripts = await getScene(getUrl(content, 'scene'))
        return {}
    }],
    [/^set.+(?<!Var)$/, async ({ content, command }: Script) => {
        const key = humpToLine(command).replace('set_', '')
        if (/Ani$/.test(command)) {
            const s = content.trim().split(',')
            if (/FigAni$/.test(command) && s.length === 3) {
                return {
                    [key + '_' + s.shift()]: s.join(' ')
                }
            }
            return {
                [key]: content.replace(/,/g, ' ')
            }
        } else {
            return {
                [key]: content
            }
        }
    }],
    [/.+(_next$)/, async ({ content, command }: Script) => {
        if (/^changeBG/.test(command)) {
            return {
                bg_Name: content
            }
        } else if (/^changeP/.test(command)) {
            const o = command.match(/_.*(?=_)/)
            return {
                [`fig_Name${o ? o[0] : ''}`]: content
            }
        } else {
            return {}
        }
    }],
    [/^bgm$/, async ({ content }: Script) => ({ bgm: content })],
    [/^miniAvatar$/, async ({ content }: Script) => ({ miniAvatar: content })],
])

export const chooseList = new Map<RegExp, ({ command, content }: Script) => Promise<{
    choose: string;
    choose_mode: ChooseMode;
}>>([
    [/^choose$/, async ({ command, content }: Script) => {
        // const obj = JSON.parse(content)
        return {
            choose: content,
            choose_mode: 'scene'
        }
    }],
    [/^choose_label$/, async ({ command, content }: Script) => {
        // const obj = JSON.parse(content)
        return {
            choose: content,
            choose_mode: 'label'
        }
    }],
])

export const varList = new Map([
    [/^setVar$/, ({ command, content, runtime }: Script & { runtime: Runtime }) => {
        const list = content.split('=')
        if (list.length < 2) {
            return {}
        }
        const cList = compact(list[1].split(/[+*-\/\(\)]/))
        let result = list[1]
        if (cList.length > 1) {
            cList.forEach(o => {
                if (exit(runtime.GameVar[o])) {
                    result = result.replace(o, runtime.GameVar[o] + '')
                }
            })
            const cal = new Calculater(result)
            return {
                [list[0]]: cal.getResult()
            }
        }
        return {
            [list[0]]: +result
        }
    }],
    [/^showVar$/, ({ command, content }: Script & { runtime: Runtime }) => {
        return {}
    }],
])

export const pixiList = new Map([
    [/^pixiInit$/, ({ command, content, pixiRef }: Script & { pixiRef: MutableRefObject<PixiRef | null> }) => {
        pixiRef.current?.pixiInit()
    }],
    [/^pixiPerform$/, ({ command, content, pixiRef }: Script & { pixiRef: MutableRefObject<PixiRef | null> }) => {
        if (!(content in presetMap)) return
        pixiRef.current?.pixiPerform({ performType: content as PerformType, option: {} })
    }]
])