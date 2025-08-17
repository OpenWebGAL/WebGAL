import { Stage } from '@/Stage/Stage';
import { Backlog } from '@/UI/Backlog/Backlog';
import { BottomControlPanel } from '@/UI/BottomControlPanel/BottomControlPanel';
import { BottomControlPanelFilm } from '@/UI/BottomControlPanel/BottomControlPanelFilm';
import DevPanel from '@/UI/DevPanel/DevPanel';
import { Extra } from '@/UI/Extra/Extra';
import GlobalDialog from '@/UI/GlobalDialog/GlobalDialog';
import Logo from '@/UI/Logo/Logo';
import Menu from '@/UI/Menu/Menu';
import { PanicOverlay } from '@/UI/PanicOverlay/PanicOverlay';
import Title from '@/UI/Title/Title';
import Translation from '@/UI/Translation/Translation';
import { useEffect, useState } from 'react';
import { initializeScript } from './Core/initializeScript';
import { CustomHtml } from './extends/CustomHtml/CustomHtml';

function App() {
  useEffect(() => {
    initializeScript();
  }, []);

  // Provider用于对各组件提供状态
  return (
    <div className="App">
      <CustomHtml />
      <Translation />
      <Stage />
      <BottomControlPanel />
      <BottomControlPanelFilm />
      <Backlog />
      <Title />
      <Logo />
      <Extra />
      <Menu />
      <GlobalDialog />
      <PanicOverlay />
      <DevPanel />
    </div>
  );
}

export default App;
