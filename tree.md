```
src
├─App.tsx
├─favicon.svg
├─index.css
├─logo.svg
├─main.tsx
├─vite-env.d.ts
├─assets
|   ├─fonts
|   |   └SourceHanSerifSC-Regular.otf
├─Core
|  ├─initializeScript.ts
|  ├─util
|  |  ├─assetSetter.ts
|  |  ├─assetsPrefetcher.ts
|  |  ├─getRandomPerformName.ts
|  |  ├─infoFetcher.ts
|  |  ├─logger.ts
|  |  ├─playBgm.ts
|  |  ├─resize.ts
|  |  ├─sceneFetcher.ts
|  |  ├─scenePrefetcher.ts
|  |  └util.ts
|  ├─store
|  |   ├─GUI.ts
|  |   ├─stage.ts
|  |   ├─storeRef.ts
|  |   └userData.ts
|  ├─runtime
|  |    ├─backlog.ts
|  |    ├─etc.ts
|  |    ├─gamePlay.ts
|  |    └sceneData.ts
|  ├─parser
|  |   ├─sceneParser.ts
|  |   ├─语句解析示例.md
|  |   ├─scriptParser
|  |   |      ├─argsParser.ts
|  |   |      ├─assetsScanner.ts
|  |   |      ├─commandParser.ts
|  |   |      ├─contentParser.ts
|  |   |      ├─scriptParser.ts
|  |   |      └subSceneScanner.ts
|  ├─interface
|  |     ├─stateInterface
|  |     |       ├─guiInterface.ts
|  |     |       ├─stageInterface.ts
|  |     |       ├─storeRefInterface.ts
|  |     |       └userDataInterface.ts
|  |     ├─coreInterface
|  |     |       ├─performInterface.ts
|  |     |       ├─runtimeInterface.ts
|  |     |       └sceneInterface.ts
|  |     ├─componentsInterface
|  |     |          ├─OptionInterface.ts
|  |     |          └menuPanelInterface.ts
|  ├─controller
|  |     ├─演出调用说明.md
|  |     ├─ui
|  |     | └uiController.ts
|  |     ├─storage
|  |     |    ├─jumpFromBacklog.ts
|  |     |    ├─loadGame.ts
|  |     |    ├─saveGame.ts
|  |     |    └storageController.ts
|  |     ├─scene
|  |     |   ├─callScene.ts
|  |     |   ├─changeScene.ts
|  |     |   └restoreScene.ts
|  |     ├─perform
|  |     |    ├─unmountPerform.ts
|  |     |    ├─pixi
|  |     |    |  └pixiController.ts
|  |     ├─gamePlay
|  |     |    ├─autoPlay.ts
|  |     |    ├─fastSkip.ts
|  |     |    ├─nextSentence.ts
|  |     |    ├─runScript.ts
|  |     |    ├─scriptExecutor.ts
|  |     |    ├─startGame.ts
|  |     |    ├─scripts
|  |     |    |    ├─bgm.ts
|  |     |    |    ├─callSceneScript.ts
|  |     |    |    ├─changeBg.ts
|  |     |    |    ├─changeFigure.ts
|  |     |    |    ├─changeSceneScript.ts
|  |     |    |    ├─intro.tsx
|  |     |    |    ├─playVocal.ts
|  |     |    |    ├─say.ts
|  |     |    |    └template.ts
|  |     ├─eventBus
|  |     |    └eventSender.ts
├─Components
|     ├─界面层级划分.md
|     ├─UI
|     | ├─etc
|     | |  └QuickSL.tsx
|     | ├─Title
|     | |   ├─Title.tsx
|     | |   └title.module.scss
|     | ├─Menu
|     | |  ├─Menu.tsx
|     | |  ├─menu.module.scss
|     | |  ├─SaveAndLoad
|     | |  |      ├─SaveAndLoad.module.scss
|     | |  |      ├─Save
|     | |  |      |  └Save.tsx
|     | |  |      ├─Load
|     | |  |      |  └Load.tsx
|     | |  ├─Options
|     | |  |    ├─NormalButton.tsx
|     | |  |    ├─NormalOption.tsx
|     | |  |    ├─OptionSlider.tsx
|     | |  |    ├─Options.tsx
|     | |  |    ├─normalButton.module.scss
|     | |  |    ├─normalOption.module.scss
|     | |  |    ├─options.module.scss
|     | |  |    └slider.css
|     | |  ├─MenuPanel
|     | |  |     ├─MenuIconMap.tsx
|     | |  |     ├─MenuPanel.tsx
|     | |  |     ├─MenuPanelButton.tsx
|     | |  |     └menuPanel.module.scss
|     | ├─BottomControlPanel
|     | |         ├─ButtomControlPanel.tsx
|     | |         └bottomControlPanel.module.scss
|     | ├─Backlog
|     | |    ├─Backlog.tsx
|     | |    └backlog.module.scss
|     ├─Stage
|     |   ├─MainStage.tsx
|     |   ├─mainStage.module.scss
|     |   ├─TextBox
|     |   |    ├─TextBox.tsx
|     |   |    └textbox.module.scss
|     |   ├─FullScreenPerform
|     |   |         ├─FullScreenPerform.tsx
|     |   |         └fullScreenPerform.module.scss
|     |   ├─FigureContainer
|     |   |        ├─FigureContainer.tsx
|     |   |        └figureContainer.module.scss
|     |   ├─AudioContainer
|     |   |      └AudioContainer.tsx
```
