## 发布日志

**本仓库发布源代码，并在 Release 中附带 WebGAL 引擎网页版压缩包**

**如果你想要体验使用便捷的图形化编辑器创建、制作并实时预览 WebGAL 游戏，请 [下载 WebGAL 图形化编辑器](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### 在此版本中

#### 新功能

setAnimation / setTempAnimation / setTransform 支持 parallel 参数，可在同一目标上并行动画

wait 支持 nobreak 参数，可阻止等待被点击或自动播放跳过

新增已读历史记录与快进模式设置，支持按已读快进或全文快进，已读文本默认以浅灰色显示

快速预览中的 choose 支持 defaultChoose 参数，可自动选择指定选项

资源预加载改为随剧情进度按窗口预取，支持资源与场景去重、队列限速，减少一次性资源请求

Pixi 舞台支持按需渲染，仅在动画或动态资源存在时运行 ticker，降低空闲资源消耗

背景与立绘资源识别支持带 query / hash 的扩展名，并可正确识别 gif 资源

#### 修复

修复 setTransform 连续作用同一目标时动画被错误中断或覆盖的问题

修复语音播放时 AudioContext 被浏览器挂起导致口型分析或语音演出异常的问题

修复背景清空时仍拼接空 url、可能产生无效资源请求，以及 EBG 淡出异常的问题

修复 Service Worker 在本地预览、Electron、iOS 环境中可能产生缓存干扰的问题，并改为只缓存带 hash 的构建资源

修复旧版用户数据字段缺失时被整体重置的问题，改为补齐默认字段并兼容旧存档

<!-- English Translation -->
## Release Notes

**This repository releases source code and includes a WebGAL engine web package in each Release**

**If you want to experience creating, making, and real-time previewing WebGAL games using a user-friendly graphical editor, please [download the WebGAL graphical editor](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### In this version

#### New Features

setAnimation / setTempAnimation / setTransform now support the parallel argument, allowing animations to run in parallel on the same target

wait now supports the nobreak argument to prevent waits from being skipped by clicks or auto-play

Added read history and skip mode settings, supporting read-text skip or full skip; read text is now shown in light gray by default

choose in fast preview now supports the defaultChoose argument for automatically selecting a specified option

Resource prefetching now follows story progress with a lookahead window, deduplicated asset and scene queues, and throttled requests

The Pixi stage now supports on-demand rendering, running the ticker only while animations or dynamic resources exist to reduce idle resource usage

Background and figure source detection now supports extensions with query / hash suffixes and correctly identifies gif resources

#### Fixes

Fixed setTransform animations being incorrectly interrupted or overwritten when applied continuously to the same target

Fixed lip-sync analysis or vocal performs failing when the browser suspends AudioContext before playback

Fixed empty background changes still producing empty url references, unnecessary resource requests, and abnormal EBG fade-out behavior

Fixed Service Worker cache interference in local preview, Electron, and iOS environments; only hashed build assets are now cached

Fixed old user data being fully reset when fields are missing; missing default fields are now migrated into existing saves

<!-- Japanese Translation -->
## リリースノート

**このリポジトリではソースコードを公開し、Release には WebGAL エンジンの Web 版パッケージも同梱しています**

**もしあなたが使いやすいグラフィカルエディタでWebGALゲームを作成、制作、リアルタイムプレビューしたい場合は、[WebGALグラフィカルエディタをダウンロードしてください](https://github.com/OpenWebGAL/WebGAL_Terre/releases)**

### このバージョンについて

#### 新機能

setAnimation / setTempAnimation / setTransform が parallel 引数に対応し、同じターゲット上で複数のアニメーションを並列実行できるようになりました

wait が nobreak 引数に対応し、待機がクリックや自動再生でスキップされるのを防げるようになりました

既読履歴とスキップモード設定を追加し、既読のみスキップ / 全文スキップを選択できるようになりました。既読テキストは既定で薄いグレー表示になります

高速プレビュー中の choose が defaultChoose 引数に対応し、指定した選択肢を自動選択できるようになりました

リソースのプリフェッチを進行状況に応じた先読み方式に変更し、アセットとシーンの重複排除、キュー制御、リクエスト間隔の制御に対応しました

Pixi ステージがオンデマンドレンダリングに対応し、アニメーションや動的リソースが存在する場合のみ ticker を実行してアイドル時の負荷を削減します

背景と立ち絵のリソース判定が query / hash 付き拡張子に対応し、gif リソースも正しく識別できるようになりました

#### 修正

setTransform を同じターゲットに連続適用した際、アニメーションが誤って中断または上書きされる問題を修正しました

ブラウザによって AudioContext が停止され、口パク解析やボイス演出が異常になる問題を修正しました

背景を空にした際に空の url が生成される、不要なリソースリクエストが発生する、または EBG のフェードアウトが不自然になる問題を修正しました

ローカルプレビュー、Electron、iOS 環境で Service Worker のキャッシュが干渉する問題を修正し、ハッシュ付きビルドアセットのみをキャッシュするようにしました

旧バージョンのユーザーデータでフィールドが不足している場合に全体がリセットされる問題を修正し、既存セーブに既定フィールドを補完するようにしました
