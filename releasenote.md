## 发布日志

**本仓库发布源代码，并在 Release 中附带 WebGAL 引擎网页版压缩包。**

**如果你想要体验使用便捷的图形化编辑器创建、制作并实时预览 WebGAL 游戏，请 [下载 WebGAL 图形化编辑器](https://github.com/OpenWebGAL/WebGAL_Terre/releases)。**

### 在此版本中

#### 新功能

新增立绘差分切换。用于为立绘更换表情等差分。执行此指令时，位置、效果和层级都保持不变，尺寸相同的图片之间会平滑过渡。

设置变换与动画时，可以选择从立绘当前的状态开始，还是从默认状态开始。

优化资源的预加载与缓存，切换背景和立绘更加流畅。

#### 修复

修复自动播放时，等待之后接续的对话会瞬间全部显示，以及等待时间被提前结束的问题。

修复对话最后几个字还在渐显时突然全部显示的问题。文字速度设置现在也会影响每个字渐显的快慢。

修复接续的对话中包含英文或标点时，文字显示异常的问题。

修复设置页中的文字速度预览可能被正在进行的剧情打断的问题。

修复在图形化编辑器中调整效果时，实时预览中的立绘可能丢失缩放、滤镜等效果的问题。

修复资源较多的长场景加载缓慢的问题。

<!-- English Translation -->
## Release Notes

**This repository releases source code and includes a WebGAL engine web package in each Release.**

**If you want to create, edit, and preview WebGAL games with a graphical editor, please [download the WebGAL graphical editor](https://github.com/OpenWebGAL/WebGAL_Terre/releases).**

### In this version

#### New Features

Added figure variant switching, which changes a figure's variant, such as its expression. When this command runs, the figure's position, effects, and layer stay the same, and images of the same size blend smoothly.

When setting transforms and animations, you can now choose whether to start from the figure's current state or from the default state.

Improved resource preloading and caching, so switching backgrounds and figures is smoother.

#### Fixes

Fixed continued dialogue appearing all at once after a wait during auto-play, and the wait ending early.

Fixed the last few characters of dialogue appearing all at once while they were still fading in. The text speed setting now also controls how fast each character fades in.

Fixed display issues when continued dialogue contained English words or punctuation.

Fixed the text speed preview on the settings page being interrupted by the ongoing story.

Fixed figures in the graphical editor's live preview possibly losing effects such as scale and filters while adjusting effects.

Fixed slow loading of long scenes with many resources.

<!-- Japanese Translation -->
## リリースノート

**このリポジトリではソースコードを公開し、Release には WebGAL エンジンの Web 版パッケージも同梱しています。**

**グラフィカルエディターで WebGAL ゲームを作成、編集、リアルタイムプレビューしたい場合は、[WebGAL グラフィカルエディターをダウンロードしてください](https://github.com/OpenWebGAL/WebGAL_Terre/releases)。**

### このバージョンについて

#### 新機能

立ち絵の差分切り替えを追加しました。立ち絵の表情などの差分を変更するためのものです。この命令を実行しても、位置、エフェクト、レイヤーはそのまま保持され、同じサイズの画像同士はなめらかに切り替わります。

変換やアニメーションを設定するときに、立ち絵の現在の状態から始めるか、デフォルトの状態から始めるかを選べるようになりました。

リソースの先読みとキャッシュを改善し、背景や立ち絵の切り替えがよりスムーズになりました。

#### 修正

オートプレイ中、待機のあとに続くセリフが一度にすべて表示される問題と、待機時間が途中で打ち切られる問題を修正しました。

セリフの最後の数文字がフェードイン中に突然すべて表示される問題を修正しました。文字速度の設定が、各文字のフェードインの速さにも反映されるようになりました。

続きのセリフに英単語や句読点が含まれる場合に、文字が正しく表示されない問題を修正しました。

設定画面の文字速度プレビューが、進行中のストーリーによって中断されることがある問題を修正しました。

グラフィカルエディターでエフェクトを調整する際、リアルタイムプレビューの立ち絵から拡大縮小やフィルターなどのエフェクトが失われることがある問題を修正しました。

リソースの多い長いシーンの読み込みが遅い問題を修正しました。
