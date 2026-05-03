## 发布日志

**本仓库只发布源代码**

**如果你想要体验使用便捷的图形化编辑器创建、制作并实时预览 WebGAL 游戏，请 [下载 WebGAL 图形化编辑器](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### 在此版本中

#### 新功能

getUserInput 支持正则校验参数 rule / ruleFlag / ruleText / ruleButtonText，可在输入不匹配时弹窗提示，ruleText 中可用 $0 引用用户输入值

changeFigure 支持 skin 参数，可切换 Spine 模型皮肤

setTransform 新增 oldFilm / dotFilm / reflectionFilm / glitchFilm / rgbFilm / godrayFilm 滤镜属性

添加引擎描述文件 webgal-engine.json 及版本自动同步机制

标题按钮文字支持多层渲染（outer / inner），方便模板自定义描边与阴影效果

内置默认字体更换为「资源圆体」(Resource Han Rounded)

#### 修复

修复 removeAnimationByTargetKey 无法移除同一目标上多个动画的问题

修复 setEffect 前未先移除旧动画导致效果叠加异常的问题

修复自动播放与快进按钮状态在部分操作后与实际状态不同步的问题

修复 Safari / iOS 下视口大小与缩放异常的问题

重构 Service Worker，采用 cache-first 策略缓存游戏关键资源，修复旧缓存逻辑缺陷

修复标题界面样式与布局问题

<!-- English Translation -->
## Release Notes

**Only source code is released in this repository**

**If you want to experience creating, making, and real-time previewing WebGAL games using a user-friendly graphical editor, please [download the WebGAL graphical editor](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### In this version

#### New Features

getUserInput now supports regex validation via rule / ruleFlag / ruleText / ruleButtonText arguments, showing a dialog when input does not match; ruleText supports $0 to reference the user's input value

changeFigure now supports a skin argument for switching Spine model skins

setTransform adds new filter properties: oldFilm / dotFilm / reflectionFilm / glitchFilm / rgbFilm / godrayFilm

Added engine description file webgal-engine.json and automatic version synchronization mechanism

Title button text now supports layered rendering (outer / inner) for easier template customization of strokes and shadows

Default built-in font changed to Resource Han Rounded (资源圆体)

#### Fixes

Fixed removeAnimationByTargetKey not removing all animations sharing the same target key

Fixed old animations not being removed before setEffect, causing effects to stack incorrectly

Fixed auto-play and fast-forward button states becoming out of sync with actual state after certain operations

Fixed viewport sizing and scaling issues on Safari / iOS

Refactored Service Worker with a cache-first strategy for critical game assets, fixing legacy caching logic issues

Fixed title screen style and layout issues

<!-- Japanese Translation -->
## リリースノート

**このリポジトリはソースコードのみを公開しています**

**もしあなたが使いやすいグラフィカルエディタでWebGALゲームを作成、制作、リアルタイムプレビューしたい場合は、[WebGALグラフィカルエディタをダウンロードしてください](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### このバージョンについて

#### 新機能

getUserInput で正規表現バリデーション引数 rule / ruleFlag / ruleText / ruleButtonText をサポートし、入力が一致しない場合にダイアログを表示できるようになりました。ruleText 内で $0 を使用してユーザー入力値を参照できます

changeFigure で skin 引数をサポートし、Spine モデルのスキンを切り替えられるようになりました

setTransform に oldFilm / dotFilm / reflectionFilm / glitchFilm / rgbFilm / godrayFilm フィルター属性を追加しました

エンジン記述ファイル webgal-engine.json およびバージョン自動同期メカニズムを追加しました

タイトルボタンのテキストが多層レンダリング（outer / inner）に対応し、テンプレートでのストロークやシャドウのカスタマイズが容易になりました

デフォルト内蔵フォントを「資源圓體」(Resource Han Rounded) に変更しました

#### 修正

removeAnimationByTargetKey が同一ターゲット上の複数アニメーションを削除できない問題を修正しました

setEffect の前に旧アニメーションが削除されず、エフェクトが不正に重複する問題を修正しました

一部操作後に自動再生・早送りボタンの状態が実際の状態と同期しなくなる問題を修正しました

Safari / iOS でのビューポートサイズとスケーリングの異常を修正しました

Service Worker をリファクタリングし、ゲームの重要なアセットに cache-first 戦略を採用、レガシーキャッシュロジックの不具合を修正しました

タイトル画面のスタイルとレイアウトの問題を修正しました
