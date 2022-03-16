import {Provider} from "reto/provider";
import {GuiStateStore} from "./Core/store/GUI";
import Title from "./Components/UI/Title";
import {useEffect, useRef} from "react";
import {storeGlobal} from "./Core/store/storeRef";
import {initializeScript} from "./Core/controller/initializeScript";

function App() {
    const GuiStoreRef = useRef<ReturnType<typeof GuiStateStore> | null>(null);
    useEffect(() => {
        storeGlobal.GuiRef = GuiStoreRef;
        initializeScript();
    }, [])
    return (
        <div className="App" style={{height: '100%', width: '100%'}}>
            <Provider of={GuiStateStore} storeRef={GuiStoreRef}>
                <Title/>
            </Provider>
        </div>
    )
}

export default App
