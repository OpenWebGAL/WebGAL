# GameScript 实现指南

这里的 gameScript 指 `packages/webgal/src/Core/gameScripts` 下的内核命令实现。它不是给游戏作者看的脚本语法文档，而是给内核命令维护者看的执行模型说明。

核心原则：命令函数负责推进可恢复的演算状态，`IPerform` 负责 commit 后的运行时演出。不要把这两件事混在一起。

## 一条命令做什么

一个命令实现接收 `ISentence`，返回 `IPerform`。

```ts
export function someCommand(sentence: ISentence): IPerform {
  // 1. 解析 sentence.content / sentence.args
  // 2. 修改 calculationStageState 中可恢复、可被后续命令读取的状态
  // 3. 返回 perform，让 commit 后的运行时层启动或清理演出
}
```

命令注册入口在 `Core/parser/sceneParser.ts`。没有运行时演出的命令应返回 `createNonePerform()`。

## 执行顺序

用户正常步进时，主流程是：

1. `preForward()` 检查当前正在运行的 perform 是否阻塞下一步。
2. `forward()` 清理未提交的临时 perform，开始收集本轮 perform。
3. `scriptExecutor()` 执行当前句；如果有 `-next`，会在同一轮 `forward()` 内继续执行后续句。
4. 命令函数只修改 `calculationStageState`，并把返回的 perform 放进 pending 列表。
5. `commitForward()` 调用 `stageStateManager.commit({ applyPixiEffects: false })`，把演算态提交成 `viewStageState`。
6. stage commit handler 同步 Pixi/React/audio 等视图对象。
7. `performController.commitPendingPerforms()` 启动 pending perform 的 `startFunction`。
8. `stageStateManager.applyCommittedPixiEffects()` 把提交后的 `effects` 应用到未被动画锁定的 Pixi 对象。

因此，命令函数里不要主动 `commit()`。命令可能运行在 `-next` 链、快速预览、回放恢复、跳转恢复等流程里，提前 commit 会破坏统一提交点。

## 两种状态

`calculationStageState` 是脚本执行期间的权威状态。后续命令、条件判断、快速预览都会从这里继续算。

`viewStageState` 是提交后的视图状态。React、Pixi 同步层和运行时演出应基于提交后的状态工作。

如果后续命令需要读取某个结果，这个结果必须在命令函数阶段写进 `calculationStageState`，或者在特殊的 pending discard 结算钩子里补写。不要只写在 `startFunction`、Pixi loader 回调、动画结束回调里；这些代码在快速预览历史行里可能根本不会执行。

## IPerform 生命周期

`IPerform` 有三个常见状态：

1. pending：命令函数已经返回，但本轮还没有 commit，`startFunction` 还没执行。
2. running：commit 后 `startFunction` 已执行，perform 在 `performList` 中等待自然结束或手动卸载。
3. discarded：pending perform 在 commit 前被丢弃，不会进入 running。

字段职责：

- `performName`：用于去重、保存和卸载。目标相关演出应使用稳定前缀，例如 `animation-${target}`。
- `duration`：非 hold 演出的自动回收时间。
- `isHoldOn`：是否为保持型演出。保持型演出会留在状态中，直到显式卸载。
- `startFunction`：只做运行时动作，例如注册 Pixi 动画、播放媒体、挂载 UI。它只在 commit 后执行。
- `stopFunction`：清理已经启动的运行时动作。它只应该假设 `startFunction` 已经执行过。
- `blockingNext`：是否阻塞用户下一步。
- `blockingAuto`：是否阻塞自动播放。
- `blockingStateCalculation`：是否阻塞继续演算后续状态。只有需要外部输入才能确定后续状态时才使用，例如选项和用户输入。
- `settleStateOnDiscard`：pending perform 被“结算式丢弃”时的补偿钩子。它不是正常生命周期，不在 commit、start、stop、自然结束时执行。

## settleStateOnDiscard

`settleStateOnDiscard` 只解决一个窄问题：某条历史命令的 pending perform 在 commit 前被跳过，但它的最终状态又必须影响后续演算。

当前触发点是 `forward()` 开头：

```ts
performController.discardUncommittedNonHoldPerforms(WebGAL.gameplay.isFastPreview);
```

也就是说，只有调用方传入 `settleDiscardedState = true` 时，被丢弃的非 hold pending perform 才会执行 `settleStateOnDiscard`。目前这个 true 只用于实时预览快进。普通 discard 不会执行这个钩子。

实现要求：

- 必须同步执行，不能等待 loader、timer、动画帧或网络。
- 必须幂等，重复调用不能把状态越写越偏。
- 只写 `calculationStageState` 中可恢复、可被后续命令依赖的状态。
- 不要操作 Pixi 对象、DOM、音频实例、ticker。
- 不要调用 `commit()`。

什么时候需要实现：

- 命令返回一个非 hold perform。
- 命令的最终状态没有在命令函数阶段直接写入。
- 这个最终状态对后续命令有意义。
- 如果在命令函数阶段直接写入终态，会破坏当前行的正常视觉表现。

什么时候不需要实现：

- 命令已经在函数阶段写好了后续命令需要的状态，例如普通 `setAnimation`、`setTransform`。
- 命令只产生一次性声音、日志、UI 提示，后续演算不依赖它。
- perform 是 hold，并且本来就应该保留到后续状态里。

## 快速预览为什么特殊

实时预览快进会连续调用 `forward()`，中间不 commit，只在到达目标位置后提交一次。

这会带来一个差异：前一轮 `forward()` 收集到的非 hold pending perform，在下一轮 `forward()` 开头会被丢弃。被丢弃的 perform 不会执行：

- `startFunction`
- `stopFunction`
- Pixi 注册动画后的结束回调
- `setTimeout` 自动卸载逻辑

所以，如果某个命令把终态延迟到了这些阶段，快速预览历史行就会丢状态。

这次 `changeFigure -transform` 的问题就是这个类型：

1. `changeFigure` 创建新立绘，并把 transform 做成进入动画。
2. 正常播放时，进入动画由 Pixi sync 注册，终态会在动画结束或 preset 结算时写入 `effects`。
3. 快速预览时，这条 enter perform 作为历史行被丢弃，没有机会注册进入动画。
4. 后续 `setAnimation -parallel` 读取不到 figure 的 position，只能从默认 transform 开始算。
5. 因此 `changeFigure` 需要在 `settleStateOnDiscard` 中把进入动画终态补写到 `calculationStageState.effects`。

## 动画命令

动画命令要区分两件事：

- 演算终态：后续命令、存档、恢复、快速预览要读取的状态。
- 运行时动画：当前画面上逐帧播放的效果。

`setAnimation`、`setTransform`、`setTempAnimation` 这类命令通常应该在命令函数阶段调用 `applyAnimationEndState()` 或等价逻辑，把终态写入 `calculationStageState.effects`。运行时动画再由 returned perform 的 `startFunction` 注册。

`-parallel` 下只能写动画实际控制的字段。例如只改 `scale` 的并行动画不应该把 `position` 重置成默认值。生成 timeline 或写终态时要使用局部字段合并，而不是完整覆盖目标 transform。

新背景、新立绘的进入动画是特殊情况。当前行正常播放时不能无条件提前写入目标 `effects`，因为 `registerPresetAnimation()` 会把已有 effect 解释为目标已经结算，于是直接应用终态并跳过进入动画。它们应该在正常路径交给 Pixi preset 动画结算，在快速预览历史行被丢弃时再通过 `settleStateOnDiscard` 补写终态。

## 参数和资源

参数解析使用 `getStringArgByKey`、`getNumberArgByKey`、`getBooleanArgByKey` 等工具。注意区分参数缺省和显式传入 `false`。

资源路径使用 `assetSetter()` 处理，不要在命令里手写资源目录拼接。

JSON 参数必须 try/catch。解析失败时应回退到旧语义或安全默认值，不能让脚本执行器抛出异常中断整个 `forward()`。

## 状态更新原则

只把可恢复、可存档、可被后续命令依赖的内容写入 stage state。临时 DOM、Pixi ticker、timer、音频实例、loader 中间状态都不应该写进 stage state。

直接访问 `WebGAL.gameplay.pixiStage` 的代码尽量放在 `startFunction`、`stopFunction` 或 stage sync 层。命令函数阶段如果必须访问 Pixi，只能用于不会决定可恢复状态的标记或清理。

修改已有目标时，先判断 URL、id、target 是否真的变化。资源未变化时应保留旧 transform、Live2D 参数、metadata 等状态，只更新显式传入的字段。

## 检查清单

- 后续命令需要读取的状态是否已经写入 `calculationStageState`？
- perform 在快速预览历史行中被丢弃时，最终状态是否仍然正确？
- `settleStateOnDiscard` 是否只处理 pending discard 补偿，没有混入正常生命周期逻辑？
- `startFunction` 是否只依赖已 commit 的状态？
- `stopFunction` 是否只清理已经启动过的运行时动作？
- `-next`、`-continue`、`-parallel`、`-keep` 下状态是否一致？
- 并行动画是否只写自己控制的 transform 字段？
- 没有运行时演出的命令是否使用了 `createNonePerform()`？
