import {FC} from "react";
import {useStore} from "reto";
import {GuiStateStore} from "../../../Core/store/GUI";

const Menu: FC = () => {
    const GuiStore = useStore(GuiStateStore);
    return <>
        {GuiStore.GuiState.showMenuPanel &&
            <div>
                Menu
            </div>}
    </>
}

export default Menu