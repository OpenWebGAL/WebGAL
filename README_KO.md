![WebGAL](https://user-images.githubusercontent.com/30483415/227242979-297ff392-f210-47ef-b0e9-d4788ddc8df0.png)

**[中文版本](/README.md)**

**[번역을 도와주세요 | 翻译协助 | 翻訳のお手伝い ](https://github.com/MakinoharaShoko/WebGAL/tree/dev/packages/webgal/src/translations)**

**[Discord 서버 참가하기](https://discord.gg/kPrQkJttJy)**

# WebGAL

**시각적으로 매력적이며, 기능이 풍부하고, 쉽게 개발할 수 있는 새로운 웹 기반 비주얼 노벨 엔진**

데모 비디오: https://www.bilibili.com/video/BV1jS4y1i7Wz/

## 온라인 체험

짧은 예시:

https://demo.openwebgal.com

완성된 게임:

[铃色☆记忆](http://hoshinasuzu.cn/) by Hoshinasuzu  [백업 링크](http://hoshinasuzu.cc/)

### WebGAL로 게임 만들기

[WebGAL 개발 문서](https://docs.openwebgal.com/)

[WebGAL 그래픽 에디터 다운로드](https://github.com/MakinoharaShoko/WebGAL_Terre/releases)

## WebGAL의 장점 및 특징

한 번 작성하면 어디서든 실행할 수 있으며, 웹 개발 배경이 필요 없으며, 모든 구문을 3분 만에 배울 수 있고, 영감이 떠오르자마자 자신만의 비주얼 노벨을 만들기 시작할 수 있습니다!

### 시각적으로 매력적인 인터페이스

아름답고 우아한 그래픽 사용자 인터페이스와 상호작용 효과, 모두가 더 나은 사용자 경험을 위한 것입니다.

### 특징이 풍부함

주요 비주얼 노벨 엔진의 거의 모든 기능을 지원하며, 게임에 사용자 정의 효과를 추가하기 위해 Pixi.js를 사용할 수 있습니다.

### 개발하기 쉬움

WebGAL 스크립트를 사용하든 비주얼 에디터를 사용하든 개발은 모두 간단하고 자연스럽습니다.

### WebGAL 개발에 참여하기

**엔진 개발에 참여하고 싶은 개발자는 [이 프로젝트에 참여하기 위한 안내서](https://docs.openwebgal.com/developers/)를 읽어주세요.**

### Live2D에 대하여
엔진은 이제 Live2D 캐릭터 모델의 사용을 지원합니다. Live2D 모델을 사용하려면 다음 단계를 따르세요:

1. Live2D 사용에 필요한 권한을 얻습니다.

2. 다음 링크에서 Live2D와 CubismCore를 다운로드합니다:

  - Live2D: https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js
  - CubismCore: https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js

3. `l2d.js`와 `live2dcubismcore.min.js`를 각각 이름 변경하고, 파일을 `packages/webgal/src/assets/lib`에 넣은 다음 `packages/webgal/index.html`로 이동하여 다음 두 줄의 주석을 해제합니다:
   ```
   htmlCopy code<script src="/src/assets/lib/l2d.js"></script>
   <script src="/src/assets/lib/live2dcubismcore.min.js"></script>
   ```

4. `packages/webgal/src/Core/controller/stage/pixi/PixiController.ts` 파일에서 다음 줄의 주석을 해제합니다:

   ```
   javascriptCopy codeimport { Live2DModel, SoundManager } from 'pixi-live2d-display';
   public addLive2dFigure(key: string, jsonPath: string, pos: string, motion: string) {
      // ...
   }
   ```

5. `packages/webgal/src/Components/Stage/MainStage/useSetFigure.ts` 파일에서 다음 줄의 주석을 해제합니다:

   ```
   javascriptCopy code
   return WebGAL.gameplay.pixiStage?.addLive2dFigure(...args);
   ```

6. 이제 Live2D 캐릭터 모델을 삽화의 일부로 사용할 수 있습니다. 전체 모델 디렉토리를 `game/figure` 디렉토리 안에 넣습니다. 캐릭터 모델을 표시하려면 해당 JSON 파일을 호출합니다.

**주의: 이 프로젝트의 작성자는 Live2D SDK 소스 코드나 모델을 사용하지 않았습니다. Live2D 사용으로 인해 발생하는 저작권 분쟁은 수정된 프로젝트의 개발자나 창작자의 단독 책임입니다!**

### 후원

WebGAL은 오픈소스 소프트웨어이므로 MPL-2.0 오픈소스 라이센스의 범위 내에서 이 소프트웨어를 무료로 사용할 수 있으며, 상업적으로 사용할 수 있습니다.

그럼에도 불구하고, 귀하의 후원은 개발자들에게 동기를 부여하고 이 프로젝트를 더욱 발전시키는 데 도움이 될 수 있습니다.

[이 프로젝트 후원하기](https://docs.openwebgal.com/sponsor/)

# 후원자

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

## 시간에 따른 사용자 수

[![시간에 따른 사용자 수](https://starchart.cc/MakinoharaShoko/WebGAL.svg)](https://starchart.cc/MakinoharaShoko/WebGAL)
