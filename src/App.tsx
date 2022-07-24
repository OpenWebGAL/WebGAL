import Title from './Components/UI/Title/Title';
import {useEffect} from 'react';
import {initializeScript} from './Core/initializeScript';
import Menu from './Components/UI/Menu/Menu';
import {MainStage} from './Components/Stage/MainStage';
import {BottomControlPanel} from './Components/UI/BottomControlPanel/ButtomControlPanel';
import {Backlog} from './Components/UI/Backlog/Backlog';
import {Provider} from 'react-redux';
import {webgalStore} from './store/store';
import {Extra} from "@/Components/UI/Extra/Extra";
import { BottomControlPanelFilm } from './Components/UI/BottomControlPanel/BottomControlPanelFilm';

function App() {
  useEffect(() => {
    initializeScript();
  }, []);
  // Provider用于对各组件提供状态
  return (
    <div className="App" style={{height: '100%', width: '100%', background: 'rgba(0, 0, 0, 1)'}}>
      <Provider store={webgalStore}>
        <Extra/>
        <Title/>
        <Menu/>
        <MainStage/>
        <BottomControlPanel/>
        <BottomControlPanelFilm/>
        <Backlog/>
      </Provider>
    </div>
  );
}

export default App;
