目前的动画实现不支持两项关键功能：相对动画和继承关键帧。

因此，将开发 Animation v2 接口，这一接口将拓展现有的动画体系。

v2 动画的 JSON 是一个对象：

```json
{
  "version": 2,
  "relative": true,
  "inherit": true,
  "keyframes": [
    { "duration": 250, "position": { "x": -100 }, "ease": "easeOut" },
    { "duration": 500, "position": { "x": 100 }, "ease": "easeInOut" },
    { "duration": 250, "position": { "x": 0 }, "ease": "easeIn" }
  ]
}
```

该动画使舞台对象围绕当前位置左右摇动一次，最终回到原位。

关键帧的 `duration`（单位为毫秒）是从上一关键帧到本关键帧的时长。上一关键帧指数组中的前一项，与其指定了哪些属性无关；第一个关键帧的 `duration` 从动画开始计算。`ease` 为从上一关键帧到达本帧这一区间所使用的缓动，缺省为 `easeInOut`。`duration` 为 0 的关键帧与上一关键帧处于同一时刻，构成跳变：以靠前的关键帧为插值终点，以靠后的关键帧为跳变后的状态。

除了关键帧以外，还将加入用于描述动画属性的字段，目前包括：

1. 动画版本 `version`，对于 Animation v2，这个值是 2。
2. 是否为相对动画 `relative`，默认为 true。为 true 则启用相对动画，帧中的值基于舞台对象的**当前基准状态**变换；为 false 则帧中的值为绝对值。**当前基准状态**遵循 `transformFrom` 及相关参数的设置，一般为 current（当前的变换），如果为 default 则为 `baseTransform`。各属性默认的计算方式如下（取值含义见第 4 项）：
   - `add`：`position`、`rotation`、`blur`、`bevel`、`bevelThickness`、`bevelRotation`、`bevelSoftness`、`bloom`、`bloomBlur`。
   - `multiplyWithZeroFallback`：`scale`。
   - `absolute`：其余属性，如 `alpha`、`brightness`、颜色、滤镜开关等。
3. 是否启用帧继承 `inherit`，默认为 true。启用时，各属性分别处理，采用类似于 AE 的方式：
   1. 在属性最后一个关键帧后：继承最近关键帧的值。
   2. 在两个关键帧之间：插值。
   3. 在属性第一个关键帧前：从**当前基准状态**过渡到第一个关键帧。
   4. 动画中未涉及的属性：保持不变。

   禁用时，关键帧中未指定的属性取当前基准状态；在第一个关键帧前，同样从当前基准状态过渡到第一个关键帧。
4. 覆盖相对动画计算方式 `relativeCalc`，是一个对象，键名为属性名，值为计算方式：
   - `add`：基准值加帧中的值。
   - `multiply`：基准值乘帧中的值。
   - `multiplyWithZeroFallback`：同 `multiply`，但基准值为 0 时按 1 处理。
   - `absolute`：直接使用帧中的值。

   例如 `"relativeCalc": { "alpha": "multiplyWithZeroFallback" }` 使 `alpha` 按当前透明度的倍数变化。`position`、`scale` 等嵌套属性的设置同时作用于两轴。未指定或值非法的属性按默认计算方式处理。`relative` 为 false 时，此字段不生效。

以上字段缺省或为非法值时，一律按默认值处理。

相对动画重复执行会累积，例如右移 100 执行两次即右移 200。多个并行动画作用于同一属性时，效果叠加。

对于旧的动画，即 JSON 文件直接是关键帧数组的，将其称为旧接口，仍然遵循 v1 的行为实现。在编辑器中，选择动画时默认隐藏 v1 动画，引擎可读取，但仅用于兼容旧脚本。

实现方案：不分别实现 v1 和 v2。动画在 `AnimationManager.addAnimation` 中统一转换为 v2 格式后写入内核。加载动画文件、`setTempAnimation`、`setTransform`、`changeFigure`、`changeBg` 注册的动画均以此方式处理。

- 顶层是对象：按 `version` 处理，缺省为 2。
- 顶层是数组：v1 动画，以该数组作为 `keyframes`，并设置 `version: 1`。

需要与 v1 保持一致的行为，均由 `version: 1` 决定，转换后的行为应与 v1 等价：

- `relative`、`inherit` 固定为 false，`relativeCalc` 不生效。
- 禁用帧继承时，在第一个关键帧前保持第一个关键帧的值。
- 保留 v1 的 writeFullEffect 行为：`transformFrom=default` 且非并行时，动画中未涉及的属性重置为 `baseTransform`。

对于 `setTempAnimation`，在此处一般不便按照完整的 Animation v2 接口编写动画。为了在使用类似于 v1 的写法时也能使用相对动画、帧继承等特性，允许传入 `relative`、`inherit` 参数：

- 传入关键帧数组且未传入这两个参数：按 v1 处理，用于兼容旧脚本。
- 传入关键帧数组且传入了其中任一参数：以该数组作为 `keyframes` 按 v2 处理，传入的参数覆盖默认值。
- 传入 v2 对象：传入的参数覆盖对象中对应字段的值。

所有内置动画将重写为 v2，以当前状态为基准，例如 `shake` 围绕当前位置摇动，`exit` 从当前透明度淡出。
