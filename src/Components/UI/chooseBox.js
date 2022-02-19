import {userInteract} from "../../Core/InteractController/UserInteract";

const ChooseBox = (props)=>{
    let elements = [];

    for (let i = 0; i < props.selection.length; i++) {
        let temp;
        if(props.mode ==='scene'){
            temp = <div className='singleChoose' key={i} onClick={() => {
                userInteract.chooseScene(props.selection[i][1]);
            }}>{props.selection[i][0]}</div>
        }else if (props.mode === 'label'){
            temp = <div className='singleChoose' key={i} onClick={() => {
                userInteract.chooseJumpFun(props.selection[i][1]);
            }}>{props.selection[i][0]}</div>
        }

        elements.push(temp)
    }
    return <>{elements}</>
}

export default ChooseBox;