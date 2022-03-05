import { modalStore } from '@/store'
import { stopPropagation } from '@/utils'
import { FunctionComponent, MouseEvent } from 'react'
import { useStore } from 'reto'

export const MesModalMain: FunctionComponent<{ titleText: string, Left: string, Right: string, onConfirm: Function, onCancel: Function, visible: boolean }> = ({ titleText, Left, Right, onConfirm: handleConfirm, onCancel: handleCancel, visible }) => {
    return (
        <div id="MesModel" onClick={stopPropagation} style={{ display: visible ? 'block' : 'none' }}>
            <div className='MesMainWindow'>
                <div className="MesTitle">{titleText}</div>
                <div className='MesChooseContainer'>
                    <div className='MesChoose' onClick={() => {
                        handleConfirm()
                    }}>{Left}</div>
                    <div className='MesChoose' onClick={() => {
                        handleCancel()
                    }}>{Right}</div>
                </div>
            </div>
        </div>
    )
}

export const MesModal: FunctionComponent<{}> = () => {
    const { modal, handleModalConfirm, hanleModalCancel } = useStore(modalStore)
    return <MesModalMain {...modal} onConfirm={handleModalConfirm} onCancel={hanleModalCancel} />
}