## 发布日志

**本仓库只发布源代码**

**如果你想要体验使用便捷的图形化编辑器创建、制作并实时预览 WebGAL 游戏，请 [下载 WebGAL 图形化编辑器](https://github.com/MakinoharaShoko/WebGAL_Terre/releases)**

### 在此版本中

#### 新功能

新增参数，用于控制 “在本条语句的演出结束后，执行下一条”。

#### 修复

修复了 `-concat` 选项动画在新行中的错误。

修复了样式定义时 ruby 不显示的问题。

修复了 intro 的 hold 问题。

修复了 say 延迟计算问题。

修复了 restoreScene 中的竞争状态。

修复了删除已关闭的自由图形的问题。

修复了变量值处理的问题。

修复了 setVar 进行 compile 字符串时异常的问题。

增强了 getValueFromState。

调整了对 `style-alltext` 键的正则匹配，使其可以触发文本框的样式修改。

修复了变量正则表达式的问题。

修复了 logo 图片的问题。


<!-- English Translation -->
## Release Notes

**Only source code is released in this repository**

**If you want to experience creating, making, and real-time previewing WebGAL games using a user-friendly graphical editor, please [download the WebGAL graphical editor](https://github.com/MakinoharaShoko/WebGAL_Terre/releases)**

### In this version

#### New Features

Added a new parameter to control "execute the next statement after the performance of this statement is finished".

#### Bug Fixes

Fixed an animation error with the `-concat` option in a new line.

Fixed an issue where ruby was not displayed when a style was defined.

Fixed the hold problem of intro.

Fixed the say delay calculation problem.

Fixed a race condition in restoreScene.

Fixed an issue with deleting closed free figures.

Fixed the variable value handling problem.

Fixed an exception when setVar compiled a string.

Enhanced getValueFromState.

Adjusted the regular expression matching for the `style-alltext` key to allow it to trigger text box style modifications.

Fixed the variable regular expression problem.

Fixed the logo image issue.


<!-- Japanese Translation -->
## リリースノート

**このリポジトリはソースコードのみを公開しています**

**もしあなたが使いやすいグラフィカルエディタでWebGALゲームを作成、制作、リアルタイムプレビューしたい場合は、[WebGALグラフィカルエディタをダウンロードしてください](https://github.com/MakinoharaShoko/WebGAL_Terre/releases)**

### このバージョンについて

#### 新機能

「このステートメントの演出終了後に次のステートメントを実行する」を制御するための新しいパラメータが追加されました。

#### 修正

`-concat` オプションのアニメーションが新しい行でエラーになる問題を修正しました。

スタイルが定義されているときにルビが表示されない問題を修正しました。

イントロのホールド問題を修正しました。

say 遅延計算の問題を修正しました。

restoreScene の競合状態を修正しました。

閉じたフリーフィギュアを削除する際の問題を修正しました。

変数値処理の問題を修正しました。

setVar が文字列をコンパイルする際の例外を修正しました。

getValueFromState を強化しました。

`style-alltext` キーの正規表現マッチングを調整し、テキストボックスのスタイル変更をトリガーできるようにしました。

変数正規表現の問題を修正しました。

ロゴ画像の問題を修正しました。
