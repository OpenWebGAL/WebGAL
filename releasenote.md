## 发布日志

**本仓库只发布源代码**

**如果你想要体验使用便捷的图形化编辑器创建、制作并实时预览 WebGAL 游戏，请 [下载 WebGAL 图形化编辑器](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### 在此版本中

#### 新功能

模板文件中的字体会自动加载，并可在选项中选择模板或内置字体

文本框支持配置最大行数和行高，便于自定义排版

新增 Steam 集成，可通过 Steam_AppID 配置与 callSteam 指令解锁成就

舞台渲染支持 GIF 资源

立绘和背景支持用 enterDuration / exitDuration 单独设置进退场动画时长

#### 修复

修复鼠标滚轮触发快进后无法正常取消且按钮状态异常的问题

改进效果音播放的错误处理，缺失或失败不会再阻塞播放或自动前进

修复脚本解析对空白语句、注释和 Windows 换行的处理，避免错误裁剪

修复切换语音文件时可能不重新加载导致语音缺失的问题（#791）

修复立绘和背景自定义进退场时长的参数键名与 0 时长处理，确保配置生效

<!-- English Translation -->
## Release Notes

**Only source code is released in this repository**

**If you want to experience creating, making, and real-time previewing WebGAL games using a user-friendly graphical editor, please [download the WebGAL graphical editor](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### In this version

#### New Features

Template fonts are now loaded from game/template/template.json, and the options menu lets you pick template or built-in fonts

Textbox layout can be customized with max line count and line height settings

Added Steam integration: set Steam_AppID and use the callSteam script to unlock achievements

Stage rendering now supports GIF assets

Figures and backgrounds accept enterDuration / exitDuration to override enter/exit animation durations

#### Fixes

Fixed fast-forward triggered by mouse wheel not stopping correctly or resetting the button state

Improved error handling for effect audio so missing or failed sounds no longer block playback or auto-advance

Fixed script parsing of blank lines, comments, and Windows line endings to avoid trimming mistakes

Fixed voice lines sometimes not reloading when switching audio files (#791)

Fixed animation duration configuration keys and zero-duration handling so custom enter/exit timings take effect for figures and backgrounds

<!-- Japanese Translation -->
## リリースノート

**このリポジトリはソースコードのみを公開しています**

**もしあなたが使いやすいグラフィカルエディタでWebGALゲームを作成、制作、リアルタイムプレビューしたい場合は、[WebGALグラフィカルエディタをダウンロードしてください](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### このバージョンについて

#### 新機能

テンプレート（game/template/template.json）のフォントを読み込み、オプションでテンプレート／内蔵フォントを選べるようになりました

テキストボックスの最大行数と行間を設定でカスタマイズできるようになりました

Steam 連携を追加し、Steam_AppID を設定して callSteam スクリプトで実績を解除できます

ステージ描画が GIF アセットに対応しました

立ち絵と背景の登場／退場アニメに enterDuration / exitDuration で時間を上書きできるようになりました

#### 修正

マウスホイールでの早送りが正しく解除されずボタン状態が戻らない問題を修正しました

存在しない効果音などで再生が失敗しても再生や自動進行が止まらないようエラーハンドリングを改善しました

空行や空のセリフ、Windows の改行を含むスクリプトのパース処理を修正しました

ボイス切り替え時に音声が更新されない場合がある不具合を修正しました（#791）

立ち絵／背景の入退場アニメの時間設定でキー名や 0 ミリ秒を扱えない問題を修正しました
