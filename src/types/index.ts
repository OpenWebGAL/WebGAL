import { PerformType } from "@/Components/Stage/main/pixiContainer"
import type { Application, Sprite } from "pixi.js"

export type CurrentScene = [string, string][]

export enum FontSize {
    'small' = '150%',
    'medium' = '200%',
    'large' = '250%'
}
export enum PlaySpeed {
    'low' = 55,
    'medium' = 35,
    'fast' = 20,
    'zoom' = 10
}
export enum AutoPlayWaitTime {
    'normal' = 1500,
    'fast' = 200
}
export type Runtime = {
    sceneScripts: [string, string][],
    SceneName: string
    SentenceID: number
    command: string
    content: string
    GameVar: Record<string, number>
    SavedBacklog: SaveState[][]
    pixiApp: Application | null
}
export type ChooseMode = 'label' | 'scene'

export type Script = { content: string, command: string }

export type Bunny = {
    sprite: Sprite
    dropSpeed: number
    acc: number
}
export type PixiPerform = {
    performType: PerformType
    option: Record<string, unknown>
}
export type SaveState = {
    SceneName: string
    SentenceID: number,
    bg_Name: string
    fig_Name: string
    fig_Name_left: string
    fig_Name_right: string
    showText: string
    showName: string
    command: string
    choose: string
    vocal: string
    bgm: string
    miniAvatar: string
    saveTime: string
    GameVar: Record<string, unknown>
    bg_filter: string
    bg_transform: string
    pixiPerformList: PixiPerform[],
    fig_left?: string
    fig_right?: string
}
export type SaveOption = {
    SavedGame: SaveState[]
    SavedBacklog: SaveState[][]
    SP: number
    LP: number
    cSettings: {
        fontSize: FontSize,
        playSpeed: PlaySpeed
    }
}