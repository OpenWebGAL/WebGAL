## 发布日志

**本仓库发布源代码，并在 Release 中附带 WebGAL 引擎网页版压缩包。**

**如果你想要体验使用便捷的图形化编辑器创建、制作并实时预览 WebGAL 游戏，请 [下载 WebGAL 图形化编辑器](https://github.com/OpenWebGAL/WebGAL_Terre/releases)。**

### 在此版本中

#### 新功能

新增组合立绘功能。可以将身体、服装、表情等多个部件图片组合为同一个角色立绘，调整各图层的偏移、缩放和旋转，并在演出时按预设或自定义图层组合进行展示与切换。

优化编辑器实时预览。预览新版动画时的变换定位更加准确，并支持向编辑器同步模板与游戏配置信息。

#### 修复

修复导出存档时，未打开过的存档页不会被一并导出的问题。

修复条件判断中使用 >=、<=、!= 直接与变量比较时结果不正确的问题。

修复获取玩家输入时若带有 -continue 参数，确认后会多跳过一句剧情的问题。

修复快速切换对话或语音提前结束时，配音与口型、眨眼动画可能未及时停止的问题。

<!-- English Translation -->
## Release Notes

**This repository releases source code and includes a WebGAL engine web package in each Release.**

**If you want to create, edit, and preview WebGAL games with a graphical editor, please [download the WebGAL graphical editor](https://github.com/OpenWebGAL/WebGAL_Terre/releases).**

### In this version

#### New Features

Added composite figures. Multiple part images such as body, outfit, and expression can be combined into a single character figure, with per-layer offset, scale, and rotation adjustments, and displayed or switched using presets or custom layer combinations.

Improved editor live preview. Transform positioning is more accurate when previewing the new animation format, and template and game config information can now be synced to the editor.

#### Fixes

Fixed unopened save pages not being included when exporting saves.

Fixed incorrect condition results when comparing directly against a variable with >=, <=, or !=.

Fixed getting user input with the -continue option skipping an extra line after confirmation.

Fixed voice playback and lip-sync or blink animations sometimes not stopping promptly when switching dialogue quickly or ending voice playback early.

<!-- Japanese Translation -->
## リリースノート

**このリポジトリではソースコードを公開し、Release には WebGAL エンジンの Web 版パッケージも同梱しています。**

**グラフィカルエディターで WebGAL ゲームを作成、編集、リアルタイムプレビューしたい場合は、[WebGAL グラフィカルエディターをダウンロードしてください](https://github.com/OpenWebGAL/WebGAL_Terre/releases)。**

### このバージョンについて

#### 新機能

合成立ち絵機能を追加しました。素体、衣装、表情などの複数のパーツ画像を 1 つのキャラクター立ち絵として組み合わせ、各レイヤーの位置、拡大縮小、回転を調整し、演出時にプリセットや任意のレイヤー構成で表示・切り替えができます。

エディターのリアルタイムプレビューを改善しました。新しいアニメーション形式をプレビューする際の変換位置がより正確になり、テンプレートやゲーム設定の情報をエディターへ同期できるようになりました。

#### 修正

セーブデータをエクスポートする際、一度も開いていないセーブページが含まれない問題を修正しました。

条件判定で >=、<=、!= を使って変数と直接比較した際の結果が正しくならない問題を修正しました。

プレイヤー入力の取得で -continue を指定した際、確定後にストーリーが 1 行余分にスキップされる問題を修正しました。

会話を素早く切り替えた時やボイスが途中で終了した時に、ボイス再生や口パク・まばたきアニメーションがすぐに止まらないことがある問題を修正しました。
