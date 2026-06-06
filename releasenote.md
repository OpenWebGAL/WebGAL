## 发布日志

**本仓库发布源代码，并在 Release 中附带 WebGAL 引擎网页版压缩包。**

**如果你想要体验使用便捷的图形化编辑器创建、制作并实时预览 WebGAL 游戏，请 [下载 WebGAL 图形化编辑器](https://github.com/OpenWebGAL/WebGAL_Terre/releases)。**

### 在此版本中

#### 新功能

优化编辑器实时预览，提升场景跳转和状态同步的稳定性，并支持调试变量、模板刷新和更多界面预览设置。

changeBg / changeFigure / setTransition / setAnimation / setTempAnimation / setTransform 支持 ignoreDefault 参数，可让自定义动画忽略未声明的默认变换和效果。

CG 鉴赏支持按 series 分组并按 order 排序，系列图片可堆叠显示并依次预览。

新增 Enable_Continue 配置项，可控制继续游戏按钮是否显示；无自动存档时按钮会置灰，游戏结束时会清理自动存档。

新增巴西葡萄牙语和韩语，并将语言设置优化为下拉选择。

#### 修复

修复使用 vocal 参数指定语音时资源路径解析错误的问题。

修复快速预览、滚轮推进和重置舞台后，快进与动画状态可能不一致的问题。

修复长场景连续推进时可能发生调用栈溢出的问题。

修复自定义模板样式仍受引擎默认样式干扰的问题。

修复非官方引擎构建时自身版本号被错误覆盖的问题。

修复自定义模板未包含 game/tex 纹理文件时，内置雨、雪和樱花特效无法显示的问题。

<!-- English Translation -->
## Release Notes

**This repository releases source code and includes a WebGAL engine web package in each Release.**

**If you want to create, edit, and preview WebGAL games with a graphical editor, please [download the WebGAL graphical editor](https://github.com/OpenWebGAL/WebGAL_Terre/releases).**

### In this version

#### New Features

Improved editor live preview with more reliable scene navigation and state synchronization, plus support for debug variables, template refreshes, and additional interface preview settings.

changeBg / changeFigure / setTransition / setAnimation / setTempAnimation / setTransform now support the ignoreDefault argument, allowing custom animations to ignore undeclared default transforms and effects.

The CG gallery now supports grouping by series and sorting by order, with series images displayed as a stack for sequential preview.

Added the Enable_Continue configuration option to control whether the Continue button is shown; it is disabled without an autosave, and autosaves are cleared when the game ends.

Added Brazilian Portuguese and Korean translations, and improved language settings with a dropdown selector.

#### Fixes

Fixed incorrect voice asset path resolution when specifying voice files with the vocal argument.

Fixed fast-forward and animation states becoming inconsistent after fast preview, mouse-wheel advancement, or stage reset.

Fixed possible call stack overflow when advancing continuously through long scenes.

Fixed custom template styles still being affected by engine default styles.

Fixed version numbers of unofficial engine packages being overwritten incorrectly during builds.

Fixed built-in rain, snow, and cherry blossom effects not displaying when custom templates do not include the game/tex texture files.

<!-- Japanese Translation -->
## リリースノート

**このリポジトリではソースコードを公開し、Release には WebGAL エンジンの Web 版パッケージも同梱しています。**

**グラフィカルエディターで WebGAL ゲームを作成、編集、リアルタイムプレビューしたい場合は、[WebGAL グラフィカルエディターをダウンロードしてください](https://github.com/OpenWebGAL/WebGAL_Terre/releases)。**

### このバージョンについて

#### 新機能

エディターのリアルタイムプレビューを改善し、シーン移動と状態同期の安定性を向上しました。また、デバッグ変数、テンプレート更新、より多くの画面プレビュー設定に対応しました。

changeBg / changeFigure / setTransition / setAnimation / setTempAnimation / setTransform が ignoreDefault 引数に対応し、カスタムアニメーションで未指定のデフォルト変換やエフェクトを無視できるようになりました。

CG 鑑賞が series によるグループ化と order による並べ替えに対応し、シリーズ画像を重ねて表示して順番にプレビューできるようになりました。

続きからボタンの表示を制御する Enable_Continue 設定を追加しました。自動セーブがない場合はボタンが無効になり、ゲーム終了時には自動セーブが削除されます。

ブラジルポルトガル語と韓国語を追加し、言語設定をドロップダウン選択に改善しました。

#### 修正

vocal 引数でボイスを指定した際、アセットパスが正しく解決されない問題を修正しました。

高速プレビュー、マウスホイールによる進行、舞台リセット後に、早送りとアニメーションの状態が一致しない問題を修正しました。

長いシーンを連続して進めた際に、コールスタックのオーバーフローが発生する場合がある問題を修正しました。

カスタムテンプレートのスタイルがエンジンのデフォルトスタイルの影響を受ける問題を修正しました。

非公式エンジンのビルド時に拡張パッケージのバージョン番号が誤って上書きされる問題を修正しました。

カスタムテンプレートに game/tex のテクスチャファイルが含まれていない場合、内蔵の雨、雪、桜エフェクトが表示されない問題を修正しました。
