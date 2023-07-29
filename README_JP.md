![WebGAL](https://user-images.githubusercontent.com/30483415/227242979-297ff392-f210-47ef-b0e9-d4788ddc8df0.png)

**[中文版本](/README.md)**

**[Help us with translation | 协助翻译 | 翻訳のお手伝い ](https://github.com/MakinoharaShoko/WebGAL/tree/dev/packages/webgal/src/translations)**

**[Join Discord Server](https://discord.gg/kPrQkJttJy)**

# WebGALとは

**WebGALは、Webベースのビジュアルノベルエンジンです。魅力的な機能が豊富で、ビジュアルノベルゲームの開発が簡単にできます。**

デモビデオ: https://youtu.be/S7xxVe9MGXk

## ゲーム紹介

デモゲーム（一部AI画像を使用しています）:

https://webgal-jp-demo.onrender.com/

現在公開されているゲーム（中国語）:

[ベルカラー☆メモリー](http://hoshinasuzu.cn/suzu.html) by Hoshinasuzu  [代替リンク](http://hoshinasuzu.cc/)

### WebGALでゲームを作成

[WebGAL 開発ドキュメント](https://docs.openwebgal.com/)
※日本語の開発ドキュメントは準備中です

[WebGAL Webエディターのダウンロードはこちら](https://github.com/MakinoharaShoko/WebGAL_Terre/releases)

## WebGALの魅力と機能

WebGALは、プログラミング知識が不要で、簡単にビジュアルノベルゲームを作ることができます。
<br>作成したゲームをウェブサイトに公開すると、プレイヤーは、パソコンやスマホからいつでもどこでもゲームをプレイすることができます。
<br>ウェブサイトだけではなく、Windowsで実行できるファイルとして出力することも可能です。

主流のビジュアルノベルエンジンのほぼすべての機能をサポートしており、アニメーションや特殊効果を使用して、ゲームのエフェクトをカスタマイズすることも可能です。

### WebGALのエンジン開発に参加（オープンソースプロジェクトに参加）

**エンジン開発に参加したい開発者は、[このプロジェクトの参加ガイド](https://docs.openwebgal.com/developers/)をお読みください**
<br>上記のDiscordに参加すると多くの情報を得ることができます。

### About Live2D
本エンジンでは、Live2Dのキャラクターモデルの使用がサポートされています。Live2Dモデルを使用する場合は、以下の手順に従ってください：

1. Live2Dの使用に必要な許可を取得します。

2. 以下のリンクからLive2DとCubismCoreをダウンロードします：

   - Live2D: https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js
   - CubismCore: https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js

3. l2d.js`と`live2dcubismcore.min.js`の名前をそれぞれ変更し、そのファイルを`packages/webgal/src/assets/lib`に置いてから、`packages/webgal/index.html`に移動し、以下の2行をアンコメントする：

   ```
   htmlCopy code<script src="/src/assets/lib/l2d.js"></script>
   <script src="/src/assets/lib/live2dcubismcore.min.js"></script>
   ```

4. `packages/webgal/src/Core/controller/stage/pixi/PixiController.ts`ファイルで、以下の行のコメントを解除します：

   ```
   javascriptCopy codeimport { Live2DModel, SoundManager } from 'pixi-live2d-display';
   public addLive2dFigure(key: string, jsonPath: string, pos: string, motion: string) {
      // ...
   }
   ```

5. `packages/webgal/src/Components/Stage/MainStage/useSetFigure.ts`ファイルで、以下の行のコメントを解除します：

   ```
   javascriptCopy code
   return WebGAL.gameplay.pixiStage?.addLive2dFigure(...args);
   ```

6. これでLive2Dキャラクターモデルを立ち絵として使用することができます。キャラクターモデルのディレクトリ全体を`game/figure`ディレクトリに配置します。キャラクターモデルを表示するには、対応するJSONファイルを呼び出します。

**注意：このプロジェクトの作者は、Live2D SDKのソースコードやモデルを使用していません。Live2Dの使用によって引き起こされる著作権の問題については、二次開発者または制作者が全ての責任を負います！**

### スポンサーシップ

WebGAL はオープンソース ソフトウェアであるため、MPL-2.0 オープンソース ライセンスの範囲内で無料で使用でき、商用利用も可能です。
<br>スポンサーシップは、開発者が前進し、このプロジェクトをさらに改善する動機となることができます。

[このプロジェクトのスポンサー](https://docs.openwebgal.com/sponsor/)

# Sponsor

## Gold Sponsors

| <img src="https://avatars.githubusercontent.com/u/91712707?v=4" alt="T2"   width="150px" height="150px" /> |
| ------------------------------------------------------------ |
| [T2-official(T2)](https://github.com/T2-official)            |

## Silver Sponsors
| <img src="https://avatars.githubusercontent.com/u/103700780?v=4" alt="IdrilK"  width="150px" height="150px" /> |
| ------------------------------------------------------------ |
| [IdrilK](https://github.com/IdrilK)            |

## Sponsors
| <img src="https://avatars.githubusercontent.com/u/71590526?v=4" alt="Yuji Sakai"  width="150px" height="150px" /> | <img src="https://avatars.githubusercontent.com/u/49630998?v=4" alt="Iara"  width="150px" height="150px" /> |
| ------------------------------------------------------------ |------------------------------------------------------------ |
| [Yuji Sakai (generalfreed)](https://github.com/generalfreed) |[Iara (labiker)](https://github.com/labiker) |

## Stargazers over time

[![Stargazers over time](https://starchart.cc/MakinoharaShoko/WebGAL.svg)](https://starchart.cc/MakinoharaShoko/WebGAL)
