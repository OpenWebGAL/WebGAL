import {Provider} from "reto/provider";
import {GuiStateStore} from "./Core/store/GUI";
import Title from "./Components/UI/Title";
import {useEffect, useRef} from "react";
import {storeGlobal} from "./Core/store/storeRef";

function App() {
    const GuiStoreRef = useRef<ReturnType<any>>();
    useEffect(() => {
        storeGlobal.GUI = GuiStoreRef;
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
