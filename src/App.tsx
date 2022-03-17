import {Provider} from "reto/provider";
import {GuiStateStore} from "./Core/store/GUI";
import Title from "./Components/UI/Title";
import {useEffect, useRef} from "react";
import {storeRef} from "./Core/store/storeRef";
import {initializeScript} from "./Core/controller/initializeScript";
import {stageStateStore} from "./Core/store/stage";
import {userDataStateStore} from "./Core/store/userData";

function App() {
    const GuiStoreRef = useRef<ReturnType<typeof GuiStateStore> | null>(null);
    const stageStoreRef = useRef<ReturnType<typeof stageStateStore> | null>(null);
    const userDataStoreRef = useRef<ReturnType<typeof userDataStateStore> | null>(null);
    useEffect(() => {
        storeRef.GuiRef = GuiStoreRef;
        storeRef.stageRef = stageStoreRef;
        storeRef.userDataRef = userDataStoreRef;
        initializeScript();
    }, []);
    return (
        <div className="App" style={{height: '100%', width: '100%'}}>
            <Provider of={userDataStateStore} storeRef={userDataStoreRef}>
                <Provider of={stageStateStore} storeRef={stageStoreRef}>
                    <Provider of={GuiStateStore} storeRef={GuiStoreRef}>
                        <Title/>
                    </Provider>
                </Provider>
            </Provider>
        </div>
    )
}

export default App
