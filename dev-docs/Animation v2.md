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
    { "duration": 500, "position": { "x": 0 }, "ease": "easeIn" }
  ],
  "relative-calc": {
    "alpha": "multiply-with-zero-fallback",
    "blur": "multiply"
  }
}
```

该动画使舞台对象围绕当前位置左右摇动一次，最终回到原位。

关键帧使用持续时间 `duration`（单位为毫秒），代表执行动画到当前关键帧的时间。`ease` 为从上一关键帧到达本帧这一区间所使用的缓动，缺省为 `easeInOut`。同一属性在同一时刻有多个关键帧时发生跳变：以顺序靠前的为插值终点，以顺序靠后的为跳变后的状态。

除了关键帧以外，还将加入用于描述动画属性的字段，目前包括：

1. 动画版本 `version`，对于 Animation v2，这个值是 2。
2. 是否为相对动画 `relative`，默认为 true。为 true 则启用相对动画，帧中的值基于舞台对象的**当前基准状态**变换；为 false 则帧中的值为绝对值。**当前基准状态**遵循 `transformFrom` 及相关参数的设置，一般为 current（当前的变换），如果为 default 则为 `baseTransform`。各属性按性质决定计算方式：
   - 加法：`position`、`rotation`、`blur`、`bevel`、`bevelThickness`、`bevelRotation`、`bevelSoftness`、`bloom`、`bloomBlur`。
   - 乘法：`scale`。如果当前基准状态的 scale 为 0，按 1 处理。
   - 始终绝对：其余属性，如 `alpha`、`brightness`、颜色、滤镜开关等。
3. 是否启用帧继承 `inherit`，默认为 true。启用时，各属性分别处理，采用类似于 AE 的方式：
   1. 在属性最后一个关键帧后：继承最近关键帧的值。
   2. 在两个关键帧之间：插值。
   3. 在属性第一个关键帧前：从**当前基准状态**过渡到第一个关键帧。
   4. 动画中未涉及的属性：保持不变。

   禁用时与 v1 一致：关键帧中未指定的属性取当前基准状态。
4. 覆盖相对动画预算方式 `relative-calc`，是一个对象，键名是要处理的字段，值可以是 `add`（加法）,`multiply`（乘法）,`absolute`（绝对），`multiply-with-zero-fallback`（乘法，但是如果被乘数为 0，则视为 1 处理）。

以上字段缺省或为非法值时，一律按默认值处理。

相对动画重复执行会累积，例如右移 100 执行两次即右移 200。多个并行动画作用于同一属性时，效果叠加。

对于旧的动画，即 JSON 文件直接是关键帧数组的，将其称为旧接口，仍然遵循 v1 的行为实现。在编辑器中，选择动画时默认隐藏 v1 动画，引擎可读取，但仅用于兼容旧脚本。

实现方案：不分别实现 v1 和 v2。动画在 `AnimationManager.addAnimation` 中统一转换为 v2 格式后写入内核。加载动画文件、`setTempAnimation`、`setTransform`、`changeFigure`、`changeBg` 注册的动画均以此方式处理。

- 顶层是对象：按 `version` 处理，缺省为 2。
- 顶层是数组：v1 动画，设置字段 `version: 1`。
- `version: 1` 不启用相对动画，不启用帧继承，并保留 v1 的 writeFullEffect 行为：`transformFrom=default` 且非并行时，动画中未涉及的属性重置为 `baseTransform`。转换后的行为应与 v1 等价。

对于 `setTempAnimation`，因为一般来说在此处并不方便按照完整的 Animation v2 接口编写动画，因此为了支持在使用类似于 v1 的写法时也能使用 v2 的相对动画、关键帧继承等特性，应当允许传入 `relative`, `inherit` 这样的参数。

所有内置动画将重写为 v2，以当前状态为基准，例如 `shake` 围绕当前位置摇动，`exit` 从当前透明度淡出。
