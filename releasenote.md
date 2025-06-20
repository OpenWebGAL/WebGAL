## 发布日志

**本仓库只发布源代码**

**如果你想要体验使用便捷的图形化编辑器创建、制作并实时预览 WebGAL 游戏，请 [下载 WebGAL 图形化编辑器](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### 在此版本中

#### 新功能

在 random[...] 函数中支持范围参数，便于生成指定区间的随机数

滑块组件新增动态数值提示，支持悬停和拖拽实时显示

新增调试指令 FONT_OPTIMIZATION，用于快速排查字体渲染性能问题

文字预览面板支持点击强制刷新

构建脚本自动注入版本和提交信息

配置项新增 DefaultLanguage，可预设游戏默认语言

getUserInput 现已支持 default 默认值

新增调整滤镜效果，包括亮度对比度饱和度等

控制栏新增全屏按钮，并解耦全屏逻辑

新增退出游戏按钮

#### 修复

修复 jumpLabel 回跳问题 #417

优化文字渲染逻辑，仅重新渲染文本而非整个文本框

修复 Live2D 立绘的锚点和位置偏移，修正缩放变换

修复 Spine 立绘和普通立绘的初始位置异常

修复使用重复 UUID 加载 Live2D 立绘时的异常

修复色彩调整动画丢失问题，当滤镜为默认值时不再使用 AdjustmentFilter

其他若干稳定性与兼容性改进



<!-- English Translation -->
## Release Notes

**Only source code is released in this repository**

**If you want to experience creating, making, and real-time previewing WebGAL games using a user-friendly graphical editor, please [download the WebGAL graphical editor](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### In this version

#### New Features

Range arguments are now supported in the random[...] function for interval based random numbers

The slider component gains a dynamic value tooltip that updates on hover or drag

Added debug command FONT_OPTIMIZATION for quick font rendering diagnostics

The text preview panel now supports click to force refresh

Build scripts automatically inject version and commit information

New config option DefaultLanguage to preset the game default language

getUserInput now supports a default value

Added adjustment filter effects including brightness contrast saturation and more

Added a fullscreen button to the control bar with decoupled logic

Added an exit game button

#### Fixes

Fixed the jumpLabel jumping back issue #417

Optimized text rendering so only the text not the entire textbox re renders

Fixed Live2D figure pivot and position offsets and scaling

Fixed initial position anomalies for Spine and standard figures

Fixed error when loading a Live2D figure with a duplicate UUID

Fixed missing color adjustment animations and stopped using AdjustmentFilter at default values

Miscellaneous stability and compatibility improvements



<!-- Japanese Translation -->
## リリースノート

**このリポジトリはソースコードのみを公開しています**

**もしあなたが使いやすいグラフィカルエディタでWebGALゲームを作成、制作、リアルタイムプレビューしたい場合は、[WebGALグラフィカルエディタをダウンロードしてください](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### このバージョンについて

#### 新機能

random[...] 関数で範囲引数をサポートし指定区間の乱数生成が可能に

スライダーコンポーネントに動的値ツールチップを追加しホバーとドラッグでリアルタイム表示

デバッグコマンド FONT_OPTIMIZATION を追加しフォント描画性能を迅速に診断

テキストプレビューでクリックによる強制リフレッシュをサポート

ビルドスクリプトがバージョンとコミット情報を自動挿入

設定ファイルに DefaultLanguage を追加しゲームのデフォルト言語をプリセット可能

getUserInput が default 値をサポート

調整フィルターを追加し明るさコントラスト彩度などを調整可能

コントロールバーにフルスクリーンボタンを追加しロジックを分離

ゲーム退出ボタンを追加

#### 修正

jumpLabel が戻る問題を修正 #417

テキスト描画を最適化しテキストボックス全体ではなくテキストのみを再描画

Live2D 立ち絵のアンカーポイントと位置ずれを修正しスケール変換も修正

Spine 立ち絵および通常立ち絵の初期位置異常を修正

重複 UUID で Live2D 立ち絵をロードする際の異常を修正

色調整アニメーションの欠落を修正しデフォルト値の場合は AdjustmentFilter を使用しない

その他の安定性と互換性の向上
