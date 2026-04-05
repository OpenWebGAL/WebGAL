## 发布日志

**本仓库只发布源代码**

**如果你想要体验使用便捷的图形化编辑器创建、制作并实时预览 WebGAL 游戏，请 [下载 WebGAL 图形化编辑器](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### 在此版本中

#### 新功能

-when 指令支持字符串条件判断，变量表达式中的空白会自动裁剪

解析器新增行内注释保留能力，语句可读取 inlineComment 字段

changeFigure 支持 blendMode 参数，可设置 normal / add / multiply / screen 混合模式

黑边填充背景切换支持淡入淡出过渡

模板样式文件（标题、文本框、选项）会在启动时预加载并支持热更新

文本框行高支持通过全局变量 Line_height 调整

鉴赏模式中解锁的 CG / BGM 会立即写入本地存储，减少异常退出导致的解锁丢失

#### 修复

修复语音播放时音量倍率在切换语音后可能不正确的问题

修复切换语音资源时口型分析节点未重建导致口型动画异常的问题

修复 changeBg / changeFigure 的退出动画与时长设置在部分场景不生效或残留的问题

修复 keep 动画停止与 timeline 单关键帧时的异常行为

修复透明度滤镜场景下默认进退场动画与 alpha 恢复不一致的问题

修复 setTransform 在透明度转换场景下误修改源 transform，导致后续变换异常的问题

修复 Live2D blink / focus 在部分参数更新时被错误覆盖的问题

修复解析器在行末注释与转义分号场景下的语句解析问题

修复鉴赏模式数据更新与持久化问题，并在清除全部数据时保留 config 初始全局变量

修复鉴赏界面 CG 导航溢出及 Logo 淡出期间背景闪烁问题

<!-- English Translation -->
## Release Notes

**Only source code is released in this repository**

**If you want to experience creating, making, and real-time previewing WebGAL games using a user-friendly graphical editor, please [download the WebGAL graphical editor](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### In this version

#### New Features

The -when command now supports string condition checks, and whitespace in expressions is trimmed automatically

The parser now preserves inline comments, exposed via the inlineComment field on sentences

changeFigure now supports a blendMode argument with normal / add / multiply / screen modes

Black-border fill background switching now supports fade transitions

Template style files (title, textbox, choose) are preloaded on startup and support hot style refresh

Textbox line height can now be controlled through the global variable Line_height

Unlocked CG / BGM entries in appreciation mode are now persisted immediately to local storage to reduce data loss on unexpected exit

#### Fixes

Fixed incorrect vocal volume scaling after switching voice playback

Fixed lip-sync analyzer nodes not being reconnected when switching vocal media sources

Fixed cases where changeBg / changeFigure exit animations and durations did not apply correctly or were left behind

Fixed abnormal behavior when stopping keep animations and when timeline animations had only a single keyframe

Fixed inconsistencies in default enter/exit fades and alpha restoration under alpha-filter-based rendering

Fixed source transform data being mutated during alpha conversion in setTransform paths, which caused later transforms to behave incorrectly

Fixed Live2D blink / focus updates incorrectly overwriting partial parameter updates

Fixed parser issues with end-of-line comments and escaped semicolon scenarios

Fixed appreciation data update/persistence issues, and now preserves initial config globals when clearing all data

Fixed CG navigation overflow in Extra UI and logo fade background flicker

<!-- Japanese Translation -->
## リリースノート

**このリポジトリはソースコードのみを公開しています**

**もしあなたが使いやすいグラフィカルエディタでWebGALゲームを作成、制作、リアルタイムプレビューしたい場合は、[WebGALグラフィカルエディタをダウンロードしてください](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### このバージョンについて

#### 新機能

-when コマンドで文字列条件の判定に対応し、式中の空白を自動でトリミングするようになりました

パーサーが行内コメントを保持するようになり、文オブジェクトの inlineComment から参照できます

changeFigure で blendMode 引数をサポートし、normal / add / multiply / screen を指定できます

黒縁塗りつぶし背景の切り替えにフェード遷移を追加しました

テンプレートのスタイルファイル（タイトル・テキストボックス・選択肢）を起動時にプリロードし、スタイル更新にも追従します

テキストボックスの行間をグローバル変数 Line_height で調整できるようになりました

鑑賞モードで解放した CG / BGM を即時にローカル保存するようにし、異常終了時の取りこぼしを減らしました

#### 修正

ボイス切り替え後に音量倍率が正しく反映されない問題を修正しました

ボイス音源の切り替え時に口パク解析ノードが再接続されず、口パクが乱れる問題を修正しました

changeBg / changeFigure の退場アニメーションと時間設定が一部で効かない、または残留する問題を修正しました

keep アニメーション停止時と timeline が単一キーフレームの場合の異常動作を修正しました

アルファフィルター適用時にデフォルト入退場フェードと透明度復元が一致しない問題を修正しました

setTransform の透明度変換処理で元の transform が不正に書き換わり、後続の変換が崩れる問題を修正しました

Live2D の blink / focus で一部パラメータ更新時に設定が不正に上書きされる問題を修正しました

行末コメントやエスケープされたセミコロンを含む場合のパーサー解析不具合を修正しました

鑑賞モードのデータ更新・永続化の不具合を修正し、全データ削除時に config 初期グローバル変数を保持するようにしました

Extra 画面の CG ナビゲーションのはみ出しと、ロゴフェード時の背景ちらつきを修正しました
