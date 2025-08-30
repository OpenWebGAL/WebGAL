import { useEffect } from 'react';
import { initializeScript } from '@/Core/initializeScript';
import Translation from '@/UI/Translation/Translation';
import { Stage } from '@/Stage/Stage';
import Title from '@/UI/Title/Title';
import { Extra } from '@/UI/Extra/Extra';
import Menu from '@/UI/Menu/Menu';
import GlobalDialog from '@/UI/GlobalDialog/GlobalDialog';
import PanicOverlay from '@/UI/PanicOverlay/PanicOverlay';
import DevPanel from '@/UI/DevPanel/DevPanel';

export default function App() {
  useEffect(() => {
    initializeScript();
  }, []);
  return (
    <div className="App">
      <Stage />
      <Title />
      <Extra />
      <Menu />
      <GlobalDialog />
      <Translation />
      <PanicOverlay />
      <DevPanel />
    </div>
  );
}
