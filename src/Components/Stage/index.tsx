import '@icon-park/react/styles/index.css';
import { FunctionComponent, useEffect, useMemo } from 'react'
import Setting from './setting'
import BottomBox from './main/bottomBox'
import Bgm from "./ui/bgm";
import { Background, BackLog, ChooseBox, FigureImage, Intro, Pixi } from './main';
import { Load, MesModal, PanicOverlay, StartPage, Title, Video, Vocal } from './ui';
import { useStore } from 'reto'
import { sceneStore } from '@/store';
import { throttle } from 'lodash';

type Props = {}
const Stage: FunctionComponent<Props> = () => {
  const { scene, setScene, stopAutoPlay, setControl, next, control } = useStore(sceneStore, ({ scene, control }) => [scene.showingText, control.autoPlay])
  useEffect(() => {
    function click(e: MouseEvent) {
      if (scene.showingText) {
        setScene(scene => ({ ...scene, showingText: false }))
        return
      }
      if (control.autoPlay) {
        stopAutoPlay()
        setControl(control => ({ ...control, autoPlay: false }))
      }
      next()
    }
    const cb = throttle(click, 1000, { leading: true })
    document.addEventListener('click', cb)

    return () => {
      document.removeEventListener('click', cb)
    }
  }, [scene.showingText, control.autoPlay])

  return (
    <div className="Stage">
      {
        useMemo(() => (
          <>
            {/*初始页，点击屏幕以继续*/}
            <StartPage />
            {/* 开始界面 */}
            <Title />
            {/* 背景图 */}
            <Background />
            {/* pixi容器 */}
            <Pixi />
            {/* 人物图 */}
            <FigureImage />
            {/* 旁白 */}
            <Intro />
            {/* 分支选项 */}
            <ChooseBox />
            {/* 底部对话栏 */}
            <BottomBox />
            {/* 设置面板 */}
            <Setting />
            {/* 文字回溯面板``*/}
            <BackLog />
            {/* 读取面板 */}
            <Load pageQty={15} />
            {/* 视频 */}
            <Video />
            {/* 背景音 */}
            <Bgm />
            {/* 人物音 */}
            <Vocal />
            {/* 弹出选择框 */}
            <MesModal />
            {/* 老板键 */}
            <PanicOverlay />
          </>
        ), [])
      }
    </div>
  )
}
export default Stage