import { useMesModal } from "@/hooks"

export type State = {
    visible: boolean,
    Left: string,
    Right: string,
    titleText: string
}
const initState = () => ({
    visible: false,
    Left: '是',
    Right: '不要',
    titleText: ''
})

const state: State = initState()

export function modalStore() {
    const { modal, setModal, modalCallback, hanleModalCancel, handleModalConfirm } = useMesModal(initState())

    return {
        modal,
        setModal,
        modalCallback,
        hanleModalCancel,
        handleModalConfirm
    }
}