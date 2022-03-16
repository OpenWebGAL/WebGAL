import { Provider } from "reto/provider";
import {GuiStateStore} from "./Core/store/GUI";
import Title from "./Components/UI/Title";

function App() {
  return (
    <div className="App" style={{height:'100%',width:'100%'}}>
      <Provider of={GuiStateStore}>
        <Title/>
      </Provider>
    </div>
  )
}

export default App
