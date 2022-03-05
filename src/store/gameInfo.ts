import { GameInfo, getGameInfo } from "@/scripts"
import { useEffect, useState } from "react"

export type GameInfo = ReturnType<typeof initState>

const initState = () => (GameInfo)

const state = initState()

export function gameInfoStore() {
    const [gameInfo, setGameInfo] = useState(state)

    useEffect(() => {
        getGameInfo(gameInfo).then(info => {
            setGameInfo(info)
        })
    }, [])

    return {
        gameInfo,
        setGameInfo,
    }
}