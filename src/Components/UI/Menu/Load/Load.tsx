import {FC} from "react";
import {loadGame} from "../../../../Core/controller/storage/loadGame";

export const Load: FC = () => {
    return <div>
        Load
        <div onClick={()=>loadGame(1)}>测试读档</div>
    </div>
}