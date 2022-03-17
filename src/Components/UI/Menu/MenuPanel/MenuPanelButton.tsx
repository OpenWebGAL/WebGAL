import {FolderOpen} from "@icon-park/react";
import styles from "./menuPanel.module.scss";
import {FC} from "react";

export const MenuPanelButton: FC = (props: any) => {
    return <div className={styles.MenuPanel_button + props.buttonOnClass}
                onClick={() => {
                    props.ClickFunc();
                }}
                style={{color: props.tagColor}}
    >
        <div className={styles.MenuPanel_button_icon}>
            <FolderOpen theme="outline" size="1.2em" fill={props.iconColor}
                        strokeWidth={2}/>
        </div>
        读档
    </div>
}