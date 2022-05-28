import Title from './Components/UI/Title/Title';
import {useEffect} from 'react';
import {initWebGAL} from './Core/initializeScript';
import Menu from './Components/UI/Menu/Menu';
import {MainStage} from './Components/Stage/MainStage';
import {BottomControlPanel} from './Components/UI/BottomControlPanel/ButtomControlPanel';
import {Backlog} from './Components/UI/Backlog/Backlog';
import {Provider} from 'react-redux';
import {webgalStore} from './Core/store/store';
import {Extra} from "@/Components/UI/Extra/Extra";

function App() {
  useEffect(() => {
    const initialFunction = initWebGAL();
    initialFunction();
  }, []);

  // Provider用于对各组件提供状态
  return (
    <div className="App" style={{height: '100%', width: '100%', background: 'rgba(0, 0, 0, 0.6)'}}>
      <Provider store={webgalStore}>
        <Extra/>
        <Title/>
        <Menu/>
        <MainStage/>
        <BottomControlPanel/>
        <Backlog/>
      </Provider>
    </div>
  );
}

export default App;
