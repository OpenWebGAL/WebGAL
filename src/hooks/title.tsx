import { Dispatch, MutableRefObject, SetStateAction, useCallback, useState } from "react"

export const useTitle = (modalCallback: MutableRefObject<Function>, setModal: Dispatch<SetStateAction<{
    visible: boolean;
    Left: string;
    Right: string;
    titleText: string;
}>>) => {
    const [startImg, setStartImg] = useState('/game/background/Title.png')
    const exit = useCallback(
        () => {
            modalCallback.current = () => window.close()
            setModal({ Left: '退出', Right: '留在本页', titleText: '你确定要退出吗？', visible: true })
        },
        [],
    )
    return {
        startImg,
        setStartImg,
        exit
    }
}