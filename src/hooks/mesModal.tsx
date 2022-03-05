import { State } from "@/store/modal"
import { useRef, useState } from "react"

export const useMesModal = (state: State) => {
    const [modal, setModal] = useState(state)

    const modalCallback = useRef<Function>()
    const handleModalConfirm = () => {
        modalCallback.current && modalCallback.current()
        hanleModalCancel()
    }
    const hanleModalCancel = () => {
        setModal({ ...modal, visible: false })
    }
    return {
        modal,
        setModal,
        modalCallback,
        hanleModalCancel,
        handleModalConfirm
    }
}
