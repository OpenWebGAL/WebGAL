![WebGAL](https://user-images.githubusercontent.com/30483415/227242979-297ff392-f210-47ef-b0e9-d4788ddc8df0.png)

### **[English Version](/README_EN.md)** | **[日本語版](/README_JP.md)** | **[한국어](/README_KO.md)** | **[Français](/README_FR.md)**

**[Help us with translation | 协助翻译 | 翻訳のお手伝い | 번역을 도와주세요](https://github.com/MakinoharaShoko/WebGAL/tree/dev/packages/webgal/src/translations)**

**[Join Discord Server | 加入 Discord 讨论 | Discordのディスカッションに参加する](https://discord.gg/kPrQkJttJy)**

# WebGAL

**界面美观、功能强大、易于开发的全新网页端视觉小说引擎**

## 在线体验

#### WebGAL 示例游戏，一般会演示最新开发的功能

https://demo.openwebgal.com

#### 完整的游戏

[铃色☆记忆](http://hoshinasuzu.cn/) by 星奈组  [备用链接](http://hoshinasuzu.cc/)

[Elf of Era Idols Project](https://store.steampowered.com/app/2414730/Elf_of_Era_Idols_Project/) (通过 Steam 获取)

## 使用 WebGAL 制作游戏

[WebGAL 开发文档](https://docs.openwebgal.com/)

[下载 WebGAL 图形化编辑器](https://github.com/MakinoharaShoko/WebGAL_Terre/releases)

你也可以使用源代码或 [WebGAL 调试工具](https://github.com/MakinoharaShoko/WebGAL/releases) 制作游戏，并使用 [WebGAL Script VS Code 插件](https://marketplace.visualstudio.com/items?itemName=c6h5-no2.webgal-script-basics) 来启用语法高亮

## WebGAL 优势与特色

一次编写，处处运行，无需网页开发基础，3 分钟即可学会所有的语法，只要你有灵感，就可以立刻开始开始创作你自己的视觉小说！

### 界面美观

美观优雅的图形用户界面与交互效果，一切都是为了更好的用户体验。

### 功能强大

不仅支持主流视觉小说引擎所具有的几乎全部功能，你还可以使用 Pixi.js 为你的游戏添加自定义效果。

### 易于开发

无论是使用 WebGAL 脚本还是使用可视化编辑器进行开发，一切都是那么简单自然。

### 参与 WebGAL 的开发工作

**想要参与引擎开发的开发者请阅读 [此项目的参与指南](https://docs.openwebgal.com/developers/)**

### 关于Live2D
本引擎现已支持使用 live2D 立绘。如果你要使用 live2D 立绘，请：

1、自行取得 live2D 的授权

2、到 https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js 和 https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js 分别下载 live2D 和 cubismcore

3、分别重命名为 `l2d.js` 和 `live2dcubismcore.min.js` ，然后将文件放到`packages/webgal/src/assets/lib`，然后到 `packages/webgal/index.html`,取消注释以下两行，使其变为：
```html
<script src="/src/assets/lib/l2d.js"></script>
<script src="/src/assets/lib/live2dcubismcore.min.js"></script>
```
4、到 `packages/webgal/src/Core/controller/stage/pixi/PixiController.ts` ，取消注释
`import { Live2DModel, SoundManager } from 'pixi-live2d-display';` 和 `public addLive2dFigure(key: string, jsonPath: string, pos: string, motion: string) {...... 取消注释这一整个函数}`

5、到 `packages/webgal/src/Components/Stage/MainStage/useSetFigure.ts` 取消注释 `return WebGAL.gameplay.pixiStage?.addLive2dFigure(...args);`

6、现在开始你可以使用 live2D 作为立绘了。你需要将整个模型的目录放入 `game/figure` 目录中，调用立绘的方法是调用立绘的 json 文件。

**注意：本项目的作者没有使用任何 live2D SDK 的源码和模型，由于使用 live2D 造成的任何版权纠纷，皆由二次开发者或制作者自行承担！**

### 赞助

WebGAL 是一款开源软件，因此你可以免费在 MPL-2.0 开源协议的范畴下使用本软件，并可用于商业使用。

但即便如此，你的赞助也可以给予开发者前进的动力，让这个项目变得更好。

[赞助本项目](https://docs.openwebgal.com/sponsor/)

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
