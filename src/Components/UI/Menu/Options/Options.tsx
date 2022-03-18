import {FC} from "react";
import styles from './options.module.scss'
import {NormalButton} from "./NormalButton";
import {NormalOption} from "./NormalOption";
import {OptionSlider} from "./OptionSlider";

export const Options: FC = () => {
    return <div className={styles.Options_main}>
        <div className={styles.Options_top}>
            <div className={styles.Options_title}>
                <div className={styles.Option_title_text}>选项</div>
            </div>
        </div>
        <div className={styles.Options_main_content}>
            <div className={styles.Options_main_content_half}>
                <NormalOption key={'option0'} title={'文字显示速度'}>
                    <NormalButton textList={['慢', '中', '快']} functionList={[]} currentChecked={0}/>
                </NormalOption>
                <NormalOption key={'option1'} title={'自动播放速度'}>
                    <NormalButton textList={['慢', '中', '快']} functionList={[]} currentChecked={0}/>
                </NormalOption>
                <NormalOption key={'option2'} title={'文本大小'}>
                    <NormalButton textList={['小', '中', '大']} functionList={[]} currentChecked={0}/>
                </NormalOption>
                <NormalOption key={'option3'} title={'文本显示预览'}>
                    {/*这是一个临时的组件，用于模拟文本预览的效果*/}
                    <div style={{
                        padding: '0.5em 1em 0.5em 1em',
                        background: 'rgba(0,0,0,0.5)',
                        fontSize: '175%',
                        color: 'white',
                        height:'5em'
                    }}>
                        模拟后期加上文字显示效果的预览，用于在用户调整设置时可以预览到文字显示的效果。
                    </div>
                </NormalOption>

            </div>
            <div className={styles.Options_main_content_half}>
                <NormalOption key={'option2'} title={'主音量'}>
                    <OptionSlider/>
                </NormalOption>
                <NormalOption key={'option2'} title={'语音音量'}>
                    <OptionSlider/>
                </NormalOption>
                <NormalOption key={'option2'} title={'背景音乐音量'}>
                    <OptionSlider/>
                </NormalOption>
            </div>
        </div>
    </div>
}