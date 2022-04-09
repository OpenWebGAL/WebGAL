import {Provider} from "reto/provider";
import {GuiStateStore} from "./Core/store/GUI";
import Title from "./Components/UI/Title/Title";
import React,{useEffect, useRef} from "react";
import {storeRef} from "./Core/store/storeRef";
import {initializeScript} from "./Core/initializeScript";
import {stageStateStore} from "./Core/store/stage";
import {userDataStateStore} from "./Core/store/userData";
import Menu from "./Components/UI/Menu/Menu";
import {MainStage} from "./Components/Stage/MainStage";
import {Bottom_ControlPanel} from "./Components/UI/Bottom_ControlPanel/Buttom_ControlPanel";
import {Backlog} from "./Components/UI/Backlog/Backlog";

function App() {
    // 建立对所有状态存储的引用，方便管理
    const GuiStoreRef = useRef<ReturnType<typeof GuiStateStore> | null>(null);
    const stageStoreRef = useRef<ReturnType<typeof stageStateStore> | null>(null);
    const userDataStoreRef = useRef<ReturnType<typeof userDataStateStore> | null>(null);
    // storeRef用来记录这些引用，方便其他函数调用。
    useEffect(() => {
        storeRef.GuiRef = GuiStoreRef;
        storeRef.stageRef = stageStoreRef;
        storeRef.userDataRef = userDataStoreRef;
        initializeScript();
    }, []);

    // Provider用于对各组件提供存储
    return (
        <div className="App" style={{height: '100%', width: '100%', background: 'rgba(0, 0, 0, 0.6)'}}>
            <Provider of={userDataStateStore} storeRef={userDataStoreRef}>
                <Provider of={stageStateStore} storeRef={stageStoreRef}>
                    <Provider of={GuiStateStore} storeRef={GuiStoreRef}>
                        <Title/>
                        <Menu/>
                        <MainStage/>
                        <Bottom_ControlPanel/>
                        <Backlog/>
                    </Provider>
                </Provider>
            </Provider>
        </div>
    )
}

export default App
