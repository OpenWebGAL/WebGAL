import '@icon-park/react/styles/index.css';
import { FunctionComponent, useMemo } from 'react'
import BottomBox from './main/bottomBox'
import { Background, BackLog, ChooseBox, FigureImage, Intro, Pixi, Load, Setting } from './main';
import { MesModal, PanicOverlay, StartPage, Title, Video, Vocal, Bgm } from './ui';
import { useMainControl } from '@/hooks';

type Props = {}
const Stage: FunctionComponent<Props> = () => {
  useMainControl()
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