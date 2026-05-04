## 发布日志

**本仓库发布源代码，并在 Release 中附带 WebGAL 引擎网页版压缩包。**

**如果你想要体验使用便捷的图形化编辑器创建、制作并实时预览 WebGAL 游戏，请 [下载 WebGAL 图形化编辑器](https://github.com/OpenWebGAL/WebGAL_Terre/releases)。**

### 在此版本中

#### 新功能

优化舞台画面表现，提升背景、立绘、Spine、Live2D、变换和特效在播放、读档、回溯和快速预览中的一致性。

优化快速预览和正常播放的演出同步，减少预览结果与实际播放不一致的情况。

优化场景切换、子场景调用、回溯跳转、读档和返回标题后的画面恢复，减少旧画面元素残留。

优化 BGM、语音、视频、背景、立绘、特效和变量相关演出在快速预览中的表现。

快速预览超时时会通知编辑器，便于定位循环跳转或过长快进造成的问题。

#### 修复

修复快速预览中自动选择选项后流程继续推进异常的问题。

修复 BGM 在快速预览中可能不播放或状态不同步的问题。

修复部分异步演出在快速预览或状态恢复时可能提前推进的问题。

修复 setTransform / changeFigure / changeBg 在部分状态恢复场景下表现不同步的问题。

修复 Pixi 条件渲染在状态变化后可能未及时刷新的问题。

<!-- English Translation -->
## Release Notes

**This repository releases source code and includes a WebGAL engine web package in each Release.**

**If you want to create, edit, and preview WebGAL games with a graphical editor, please [download the WebGAL graphical editor](https://github.com/OpenWebGAL/WebGAL_Terre/releases).**

### In this version

#### New Features

Improved stage visuals, making backgrounds, figures, Spine, Live2D, transforms, and effects more consistent during playback, save loading, backlog jumps, and fast preview.

Improved perform synchronization between fast preview and normal playback, reducing cases where preview results differ from actual playback.

Improved screen restoration after scene changes, child scene calls, backlog jumps, save loading, and returning to title, reducing stale visual elements.

Improved BGM, voice, video, background, figure, effect, and variable behavior during fast preview.

Fast preview timeout now notifies the editor, making it easier to locate loop jumps or excessively long fast-forward calculations.

#### Fixes

Fixed fast preview flow continuing incorrectly after automatically selecting a choose option.

Fixed BGM possibly not playing or desynchronizing during fast preview.

Fixed some asynchronous performs advancing too early during fast preview or state restoration.

Fixed setTransform / changeFigure / changeBg desynchronization in some state restoration scenarios.

Fixed Pixi conditional rendering sometimes not refreshing immediately after state changes.

<!-- Japanese Translation -->
## リリースノート

**このリポジトリではソースコードを公開し、Release には WebGAL エンジンの Web 版パッケージも同梱しています。**

**グラフィカルエディターで WebGAL ゲームを作成、編集、リアルタイムプレビューしたい場合は、[WebGAL グラフィカルエディターをダウンロードしてください](https://github.com/OpenWebGAL/WebGAL_Terre/releases)。**

### このバージョンについて

#### 新機能

舞台画面の表示を改善し、背景、立ち絵、Spine、Live2D、変換、エフェクトが再生、ロード、バックログジャンプ、高速プレビューでより一貫して表示されるようにしました。

高速プレビューと通常再生の演出同期を改善し、プレビュー結果と実際の再生結果が異なるケースを減らしました。

シーン切り替え、子シーン呼び出し、バックログジャンプ、ロード、タイトルへ戻る操作後の画面復元を改善し、古い画面要素が残りにくくなりました。

BGM、ボイス、動画、背景、立ち絵、エフェクト、変数関連演出の高速プレビュー中の挙動を改善しました。

高速プレビューのタイムアウトをエディターへ通知するようになり、ループジャンプや長すぎる早送り計算を特定しやすくなりました。

#### 修正

高速プレビューで選択肢を自動選択した後、フローが正しく進まない問題を修正しました。

高速プレビュー中に BGM が再生されない、または状態が同期しない場合がある問題を修正しました。

一部の非同期演出が高速プレビューや状態復元中に早く進みすぎる問題を修正しました。

setTransform / changeFigure / changeBg が一部の状態復元シナリオで同期しない問題を修正しました。

Pixi の条件付きレンダリングが状態変更後すぐに更新されない場合がある問題を修正しました。