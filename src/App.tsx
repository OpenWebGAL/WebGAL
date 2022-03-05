import Stage from "@/Components/Stage";
import { Provider } from "reto";
import { controlStore, gameInfoStore, modalStore, sceneStore, settingStore } from "./store";

function App() {
  return (
    <div className="App">
      <Provider of={gameInfoStore} memo>
        <Provider of={modalStore} memo>
          <Provider of={controlStore} memo>
            <Provider of={settingStore} memo>
              <Provider of={sceneStore} memo>
                <Stage />
              </Provider>
            </Provider>
          </Provider>
        </Provider>
      </Provider>
    </div>
  );
}

export default App;