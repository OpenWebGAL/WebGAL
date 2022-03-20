import {FC} from "react";
import styles from './mainStage.module.scss'
import {useStore} from "reto";
import {GuiStateStore} from "../../Core/store/GUI";

export const MainStage: FC = () => {
    const GuiStore = useStore(GuiStateStore);
    return <div className={styles.MainStage_main}
                style={{
                    backgroundImage: `url("${GuiStore.GuiState.titleBg}")`,
                    backgroundSize: "cover"
                }}
    >

    </div>
}