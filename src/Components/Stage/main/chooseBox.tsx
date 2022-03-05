import { controlStore, sceneStore } from '@/store'
import { stopPropagation } from '@/utils'
import { FunctionComponent, MouseEvent } from 'react'
import { useStore } from 'reto'

export const ChooseBox: FunctionComponent<{}> = () => {
    const { scene, jump } = useStore(sceneStore, ({ scene }) => [scene.choose])
    const match = scene.choose.match(/(?<={).*(?=})/)
    let choose: string[][] = []
    if (match) {
        if(match[0].match(/\|/)){
            choose = match[0].split('|').map(o => o.split(':'))
        }else{
            choose = match[0].split(',').map(o => o.split(':'))
        }
    }
    return (
        <div onClick={stopPropagation} id="chooseBox" style={{ display: match?.length ? 'flex' : 'none' }}>
            <div>
                {
                    choose.map((o, i) => {
                        return <div className='singleChoose' key={o[0] + i} onClick={() => { jump(o[1]) }}>{o[0]}</div>
                    })
                }
            </div>
        </div>
    )
}