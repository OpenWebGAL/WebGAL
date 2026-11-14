## 发布日志

**本仓库发布源代码，并在 Release 中附带 WebGAL 引擎网页版压缩包。**

**如果你想要体验使用便捷的图形化编辑器创建、制作并实时预览 WebGAL 游戏，请 [下载 WebGAL 图形化编辑器](https://github.com/OpenWebGAL/WebGAL_Terre/releases)。**

### 在此版本中

#### 新功能

新增新版动画格式。动画可以基于立绘或背景的当前状态进行变换，关键帧中未设置的属性会沿用之前关键帧的值。同时新增一组以 -v2 结尾、基于当前状态执行的内置动画。

新增 Live2D 内存预留设置，可在游戏配置中调整 Live2D 预先分配的内存大小。

#### 修复

修复部分 Cubism 2 立绘显示错乱的问题。

<!-- English Translation -->
## Release Notes

**This repository releases source code and includes a WebGAL engine web package in each Release.**

**If you want to create, edit, and preview WebGAL games with a graphical editor, please [download the WebGAL graphical editor](https://github.com/OpenWebGAL/WebGAL_Terre/releases).**

### In this version

#### New Features

Added a new animation format. Animations can now transform figures or backgrounds relative to their current state, and properties not set in a keyframe carry over values from previous keyframes. Also added a set of built-in animations ending in -v2 that run from the current state.

Added a Live2D memory reservation setting, which lets you adjust how much memory Live2D allocates in advance in the game config.

#### Fixes

Fixed some Cubism 2 figures displaying incorrectly.

<!-- Japanese Translation -->
## リリースノート

**このリポジトリではソースコードを公開し、Release には WebGAL エンジンの Web 版パッケージも同梱しています。**

**グラフィカルエディターで WebGAL ゲームを作成、編集、リアルタイムプレビューしたい場合は、[WebGAL グラフィカルエディターをダウンロードしてください](https://github.com/OpenWebGAL/WebGAL_Terre/releases)。**

### このバージョンについて

#### 新機能

新しいアニメーション形式を追加しました。立ち絵や背景の現在の状態を基準に変換できるようになり、キーフレームで指定していないプロパティは前のキーフレームの値を引き継ぎます。あわせて、現在の状態を基準に実行される、名前が -v2 で終わる組み込みアニメーションを追加しました。

Live2D のメモリ予約設定を追加しました。ゲーム設定で、Live2D が事前に確保するメモリの大きさを調整できます。

#### 修正

一部の Cubism 2 立ち絵が正しく表示されない問題を修正しました。
