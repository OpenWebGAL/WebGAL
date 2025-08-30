## 发布日志

**本仓库只发布源代码**

**如果你想要体验使用便捷的图形化编辑器创建、制作并实时预览 WebGAL 游戏，请 [下载 WebGAL 图形化编辑器](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### 在此版本中

#### 新功能

支持在 Intro 中使用背景图片，图片不存在则回退至背景色

新增 Live2D 立绘的眨眼（Blink）和焦点（Focus）参数设置

新增立绘 Z-Index 变更时应用，用于控制图层顺序

改进了动画的缓动（Easing）和持续时间处理

#### 修复

通过更新 Live2D 库修复了立绘的透明度（Alpha）问题

修复了 Live2D 模型的初始化时机问题，避免加载错误

修复了 `say` 指令中 `center` 参数延迟生效的问题

修复了部分动画同步缺失的问题

通过代码重构和优化构建流程，减小了最终产物体积，提升了稳定性

<!-- English Translation -->
## Release Notes

**Only source code is released in this repository**

**If you want to experience creating, making, and real-time previewing WebGAL games using a user-friendly graphical editor, please [download the WebGAL graphical editor](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### In this version

#### New Features

Support for using background images in the Intro, with a fallback to the background color if the image doesn't exist

Added support for setting Blink and Focus parameters for Live2D models

Added support for applying z-index to figures to control layer order

Improved animation easing and duration handling

#### Fixes

Fixed alpha (transparency) issues with Live2D models by updating the library

Fixed Live2D model initialization timing to prevent loading errors

Fixed an issue where the `center` argument in the `say` command was delayed

Fixed issues with missing animation synchronization

Reduced final bundle size and improved stability through code refactoring and build process optimization

<!-- Japanese Translation -->
## リリースノート

**このリポジトリはソースコードのみを公開しています**

**もしあなたが使いやすいグラフィカルエディタでWebGALゲームを作成、制作、リアルタイムプレビューしたい場合は、[WebGALグラフィカルエディタをダウンロードしてください](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### このバージョンについて

#### 新機能

イントロで背景画像を使用できるようになり、画像が存在しない場合は背景色にフォールバックします

Live2D立ち絵のまばたき（Blink）と焦点（Focus）パラメータの設定をサポートしました

キャラクターのz-index適用をサポートし、レイヤー順序の制御を可能にしました

アニメーションのイージングと持続時間の処理を改善しました

#### 修正

Live2Dライブラリを更新し、立ち絵のアルファ（透明度）の問題を修正しました

Live2Dモデルの初期化タイミングを修正し、読み込みエラーを防止しました

`say` コマンドの `center` 引数の適用が遅れる問題を修正しました

一部のアニメーション同期が欠落する問題を修正しました

コードのリファクタリングとビルドプロセスの最適化により、最終的なバンドルサイズを削減し、安定性を向上させました
