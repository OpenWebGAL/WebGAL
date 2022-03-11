import { PixiRef } from "@/Components/Stage/main/pixiContainer"
import { autoList, chooseList, getScene, manualList, setCompatibility, varList } from "@/scripts"
import { pixiList } from "@/scripts/scriptsMap"
import { controlStore, gameInfoStore, settingStore } from "@/store"
import type { ChooseMode, PixiPerform, Runtime, SaveState } from "@/types"
import { deepClone, exit, getSaveState, getUrl, humpToLine, loadGame } from "@/utils"
import { compact } from "lodash"
import { useEffect, useRef, useState } from "react"
import { useStore } from "reto"
import { useAction, useMediaControl } from "."

export type State = {
    showingText: boolean,// 是否正在渐显文字
    GameVar: Record<string, unknown>
    bg_Name: string
    bg_filter: string
    bg_transform: string
    bg_ani: string
    bgm: string
    choose: string
    choose_mode: ChooseMode
    fig_Name: string
    fig_Name_left: string
    fig_Name_right: string
    fig_ani: string
    fig_ani_left: string
    fig_ani_right: string
    fig_left?: string
    fig_right?: string
    miniAvatar: string
    showName: string
    showText: string
    vocal: string
    video: string
    intro: string
    saveTime: string
    pixiPerformList: PixiPerform[]
    Saves: SaveState[]
    CurrentBacklog: SaveState[]
}

const initState: () => State = () => ({
    GameVar: {},
    showingText: false,
    CurrentBacklog: [],
    bg_Name: '',//背景文件名
    fig_Name: '',//立绘_中 文件名
    fig_Name_left: '',//立绘_左 文件名
    fig_Name_right: '',//立绘_右 文件名
    fig_ani: '',
    fig_ani_left: '',
    fig_ani_right: '',
    showText: '',//文字
    showName: '',//人物名
    choose: '',//选项列表
    choose_mode: 'label',
    vocal: '',//语音 文件名
    bgm: '',//背景音乐 文件名
    miniAvatar: '',//小头像
    bg_filter: '',//背景样式
    bg_transform: '',//背景样式
    bg_ani: '',
    video: '',
    intro: '',
    pixiPerformList: [],
    saveTime: '',
    Saves: []
})

const state = initState()

export const useSceneScripts = (runtime: Runtime) => {
    const showingTextTimeOut = useRef<NodeJS.Timeout | null>(null)
    const autoPlayTimeOut = useRef<NodeJS.Timeout | null>(null)
    const { control, setControl } = useStore(controlStore)
    const isAutoPlay = useRef<boolean>(control.autoPlay)
    const isFastPlay = useRef<boolean>(control.fastPlay)
    const isPlayDone = useRef<boolean>(true)
    const pixiRef = useRef<PixiRef | null>(null)
    const { setting, setSetting } = useStore(settingStore)
    const { bgmControl, videoControl, vocalControl } = useMediaControl()
    // const { setting, setSetting } = setting
    const [scene, setScene] = useState(state)
    const { gameInfo } = useStore(gameInfoStore)
    const settingRef = useRef<typeof setting>(setting)

    useAction(() => {
        settingRef.current = setting
    }, [setting])

    useEffect(() => {
        const saves = loadGame(gameInfo)
        if (!Object.keys(saves).length) return
        runtime.SavedBacklog = saves.SavedBacklog ?? []
        setScene(scene => ({ ...scene, Saves: saves.SavedGame ?? [] }))
    }, [gameInfo.Game_key])

    const next = async () => {
        // debugger
        let currentScript = runtime.sceneScripts[runtime.SentenceID]
        if (!currentScript) return
        await setCompatibility({ command: currentScript[0], content: currentScript[1], runtime })
        currentScript = runtime.sceneScripts[runtime.SentenceID]
        runtime.command = currentScript[0]
        runtime.content = currentScript[1]
        // 如果是自动脚本
        if (Array.from(autoList).some(o => o[0].test(currentScript[0]))) {
            runAuto()
            // 如果是手动脚本
        } else if (Array.from(manualList).some(o => o[0].test(currentScript[0]))) {
            runManual()
            // 如果是选择脚本
        } else if (Array.from(chooseList).some(o => o[0].test(humpToLine(currentScript[0])))) {
            showChoose()
            // 变量脚本
        } else if (Array.from(varList).some(o => o[0].test(currentScript[0]))) {
            runVar()
            // if判断脚本
        } else if (/^if\([a-zA-Z\d\(\)\+\-\*\/]+(=|>|<|>=|<=)[a-zA-Z\d\(\)\+\-\*\/]+\)$/.test(currentScript[0])) {
            ifJump()
            // label脚本
        } else if (currentScript[0] === 'label') {
            goNext()
            // jumpLabel脚本
        } else if (humpToLine(currentScript[0]) === 'jump_label') {
            jumpLabel(currentScript[1])
            next()
        } else if (currentScript[0] === 'end') {
            setScene(scene => {
                return { ...initState(), bgm: gameInfo.Title_bgm, Saves: scene.Saves }
            })
            setControl(control => ({ ...control, titleVisible: true, autoPlay: false, fastPlay: false }))
        } else if (Array.from(pixiList).some(o => o[0].test(currentScript[0]))) {
            runPixi()
            // 默认执行手动脚本
        } else {
            runManual()
        }
    }

    const goNext = () => {
        runtime.SentenceID++
        next()
    }

    const runAuto = async () => {
        let i = runtime.SentenceID
        for (; i < runtime.sceneScripts.length; i++) {
            const [command, content] = runtime.sceneScripts[i];
            let f = false
            for (const [key, handleFn] of autoList) {
                if (key.test(command)) {
                    f = true
                    nextProcessor(await handleFn({ content, command, runtime }))
                    break
                }
            }
            runtime.SentenceID = i
            // 如果不属于自动执行列表中的脚本则跳出循环，等待用户点击
            if (!f) {
                nextProcessor()
                next()
                break
            }
        }
    }

    const runManual = async () => {
        // debugger
        const [command, content] = runtime.sceneScripts[runtime.SentenceID++];
        for (const [key, handleFn] of manualList) {
            if (key.test(command)) {
                nextProcessor(await handleFn({ content, command, runtime }))
                nextProcessor();
                (control.autoPlay || control.fastPlay) && next()
                return
            }
        }
        const [vocal, showText = ''] = exit(content) ? content.split(',') : command.split(',')
        let len: number
        if (exit(showText)) {
            const o: Pick<State, 'showText' | 'vocal'> & Partial<Pick<State, 'showName'>> = { showText, vocal: vocal.replace('vocal-', '') }
            if (exit(content)) {
                o.showName = command
            }
            nextProcessor(o)
            len = showText.length
        } else {
            const o: Pick<State, 'showText' | 'vocal'> & Partial<Pick<State, 'showName'>> = { showText: vocal, vocal: '' }
            if (exit(command) && exit(content)) {
                o.showName = command
            }
            nextProcessor(o)
            len = vocal.length
        }
        // console.log('autoplay', control.autoPlay)
        // console.log('setting', setting)
        // console.log('playSpeed', setting.playSpeed)
        // console.log('autoPlayWaitTime', setting.autoPlayWaitTime)
        nextProcessor({ showingText: !isFastPlay.current })
        nextProcessor(undefined, true)
        !isFastPlay.current && await startShowingText(len)
        isAutoPlay.current && startAutoPlay()
    }

    const startAutoPlay = () => {
        stopAutoPlay()
        autoPlayTimeOut.current = setTimeout(() => {
            if (!isPlayDone.current && !isFastPlay.current) {
                startAutoPlay()
                return
            }
            isAutoPlay.current && next()
        }, settingRef.current.autoPlayWaitTime);
    }

    useAction(() => {
        isAutoPlay.current = control.autoPlay
    }, [control.autoPlay])
    useAction(() => {
        isFastPlay.current = control.fastPlay
    }, [control.fastPlay])

    const stopAutoPlay = () => {
        autoPlayTimeOut.current && clearTimeout(autoPlayTimeOut.current)
        autoPlayTimeOut.current = null
    }

    const startShowingText = (len: number) => {
        return new Promise<void>((res, rej) => {
            try {
                showingTextTimeOut.current && clearTimeout(showingTextTimeOut.current)
                showingTextTimeOut.current = setTimeout(() => {
                    !isAutoPlay.current && setScene(scene => ({ ...scene, showingText: false }))
                    res()
                }, setting.playSpeed * len + 3000);
            } catch (e) {
                rej(e)
            }
        })
    }

    const showChoose = async () => {
        isAutoPlay.current && stopAutoPlay()
        const [command, content] = runtime.sceneScripts[runtime.SentenceID++];
        for (const [key, handleFn] of chooseList) {
            if (key.test(humpToLine(command))) {
                nextProcessor(await handleFn({ content, command }))
                nextProcessor()
                break
            }
        }
    }

    const runVar = async () => {
        const [command, content] = runtime.sceneScripts[runtime.SentenceID++];
        if (command === 'showVar' && content === 'all') {
            // setScene(scene => ({ ...scene, GameVar: runtime.GameVar, showName: command, showText: JSON.stringify(runtime.GameVar) }))
            const showText = JSON.stringify(runtime.GameVar)
            nextProcessor({ GameVar: runtime.GameVar, showName: command, showText, showingText: true })
            nextProcessor(undefined, true)
            !isFastPlay.current && await startShowingText(showText.length)
            isAutoPlay.current && startAutoPlay()
            // next()
            return
        }
        for (const [key, handleFn] of varList) {
            if (key.test(command)) {
                runtime.GameVar = { ...runtime.GameVar, ...handleFn({ content, command, runtime }) }
                break
            }
        }
        next()
    }

    const ifJump = () => {
        const [command, content] = runtime.sceneScripts[runtime.SentenceID];
        const match = command.match(/(?<=if\().+(?=\))/)
        if (match) {
            let expression = match[0]
            let list = compact(expression.split(/=|>|<|>=|<=|\(|\)|\+|\-|\*|\//))
            list = list.map(o => {
                if (runtime.GameVar[o]) {
                    expression = expression.replace(o, runtime.GameVar[o] + '')
                    o = runtime.GameVar[o] + ''
                }
                return o
            })
            if (list.some(o => isNaN(+o))) {
                return
            }
            if (eval(expression)) {
                jumpLabel(content)
                next()
            } else {
                goNext()
            }
        } else {
            goNext()
        }
    }

    const jump = async (name: string) => {
        setScene(scene => ({ ...scene, choose: '' }))
        // debugger
        if (scene.choose_mode === 'label') {
            jumpLabel(name)
        } else {
            await jumpScene(name)
        }
        next()
    }
    const jumpLabel = (name: string) => {
        let i = runtime.SentenceID
        for (; i < runtime.sceneScripts.length; i++) {
            if (runtime.sceneScripts[i][0] === 'label' && runtime.sceneScripts[i][1] === name) {
                runtime.SentenceID = i + 1
                break
            }
        }
        if (i === runtime.sceneScripts.length - 1) {
            const index = runtime.sceneScripts.findIndex(o => o[0] === 'label' && o[1] === name)
            if (~index) {
                runtime.SentenceID = index + 1
            }
        }
    }
    const jumpScene = async (name: string) => {
        const url = getUrl(name, 'scene')
        runtime.sceneScripts = await getScene(url)
        runtime.SceneName = name
        runtime.SentenceID = 0
    }

    const runPixi = () => {
        const [command, content] = runtime.sceneScripts[runtime.SentenceID++]
        for (const [key, handleFn] of pixiList) {
            if (key.test(command)) {
                const state = handleFn({ command, content, pixiRef })
                if (Object.keys(state).length) {
                    setScene(scene => {
                        return {
                            ...scene,
                            ...state
                        }
                    })
                } else {
                    setScene(scene => ({ ...scene, pixiPerformList: [] }))
                }
                break
            }
        }
        next()
    }

    const list = useRef<Partial<State>[]>([])
    const nextProcessor = (o?: Partial<State>, setBackLog: boolean = false) => {
        if (o) {
            list.current.push(o)
        } else {
            setScene(scene => {
                let obj: State = deepClone(scene)
                list.current.forEach(o1 => {
                    obj = { ...obj, ...o1 }
                })
                if (setBackLog) {
                    obj.CurrentBacklog = [...obj.CurrentBacklog, getSaveState(runtime, obj)]
                }
                return obj
            })
            setControl(control => ({ ...control, bottomBoxVisible: true }))
            list.current = []
        }
    }

    const jumpFromBacklog = async (i: number) => {
        const o = scene.CurrentBacklog[i]
        runtime.SentenceID = o.SentenceID
        const scripts = await getScene(getUrl(o.SceneName, 'scene'))
        runtime.sceneScripts = scripts
        setScene(scene => {
            const o = scene.CurrentBacklog[i]
            // runtime.SentenceID = o.SentenceID
            let obj: Record<string, unknown> = deepClone(scene)
            const keys = Object.keys(scene) as Array<keyof State>
            keys.forEach(key => {
                obj[key] = o[key as keyof SaveState] as State ?? obj[key]
            })
            // getScene(getUrl(o.SceneName, 'scene'), runtime.SentenceID + 1).then((scripts) => {
            //     runtime.sceneScripts = scripts
            // })
            return { ...scene, ...obj, CurrentBacklog: scene.CurrentBacklog.slice(0, i + 1) }
        })
        setControl(control => ({ ...control, backlogVisible: false }))
        // next()
    }

    return {
        jump,
        jumpLabel,
        jumpScene,
        next,
        nextProcessor,
        runVar,
        runManual,
        runAuto,
        showChoose,
        ifJump,
        jumpFromBacklog,
        startShowingText,
        startAutoPlay,
        stopAutoPlay,
        goNext,
        scene,
        setScene,
        isPlayDone,
        pixiRef,
        setting,
        setSetting,
        control,
        setControl,
        gameInfo,
        bgmControl,
        videoControl,
        vocalControl
    }
}