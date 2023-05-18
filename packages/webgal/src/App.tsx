import Title from './Components/UI/Title/Title';
import { useEffect } from 'react';
import { initializeScript } from './Core/initializeScript';
import Menu from './Components/UI/Menu/Menu';
import { Stage } from './Components/Stage/Stage';
import { BottomControlPanel } from './Components/UI/BottomControlPanel/ButtomControlPanel';
import { Backlog } from './Components/UI/Backlog/Backlog';
import { Provider } from 'react-redux';
import { webgalStore } from './store/store';
import { Extra } from '@/Components/UI/Extra/Extra';
import { BottomControlPanelFilm } from './Components/UI/BottomControlPanel/BottomControlPanelFilm';
import GlobalDialog from '@/Components/UI/GlobalDialog/GlobalDialog';
import DevPanel from '@/Components/UI/DevPanel/DevPanel';
import Translation from '@/Components/UI/Translation/Translation';
import { PanicOverlay } from '@/Components/UI/PanicOverlay/PanicOverlay';

function App() {
  useEffect(() => {
    initializeScript();
  }, []);

  // Provider用于对各组件提供状态
  return (
    <div className="App">
      <Provider store={webgalStore}>
        <Translation />
        <Stage />
        <BottomControlPanel />
        <BottomControlPanelFilm />
        <Backlog />
        <Title />
        <Extra />
        <Menu />
        <GlobalDialog />
        <PanicOverlay />
        <DevPanel />
      </Provider>
    </div>
  );
}

export default App;
