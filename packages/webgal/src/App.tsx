import { useEffect } from 'react';
import { initializeScript } from '@/Core/initializeScript';
import Translation from '@/UI/Translation/Translation';
import { Stage } from '@/Stage/Stage';
import { BottomControlPanel } from '@/UI/BottomControlPanel/BottomControlPanel';
import { BottomControlPanelFilm } from '@/UI/BottomControlPanel/BottomControlPanelFilm';
import { Backlog } from '@/UI/Backlog/Backlog';
import Title from '@/UI/Title/Title';
import Logo from '@/UI/Logo/Logo';
import { Extra } from '@/UI/Extra/Extra';
import Menu from '@/UI/Menu/Menu';
import { PanicOverlay } from '@/UI/PanicOverlay/PanicOverlay';
import Title from '@/UI/Title/Title';
import Translation from '@/UI/Translation/Translation';
import { useEffect } from 'react';
import { initializeScript } from './Core/initializeScript';
import { CustomHtml } from './extends/CustomHtml/CustomHtml';


export default function App() {
  useEffect(() => {
    initializeScript();
  }, []);
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
