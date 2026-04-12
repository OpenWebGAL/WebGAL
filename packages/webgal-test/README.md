# WebGAL Integration Test Framework

集成测试框架，通过 Playwright 浏览器自动化验证 WebGAL 引擎核心功能。

## 运行方式

### 一键运行（本地开发 / CI）

```bash
# globalSetup 会自动检测 dist 是否存在，不存在则自动构建
yarn test:integration
```

### 分步运行（CI 推荐，可缓存构建产物）

```bash
# Step 1: 构建测试包（包含 window.webgalTest 暴露）
yarn build:test

# Step 2: 运行测试（从 dist 启动静态服务器 + 无头浏览器）
yarn test:integration
```

### 本地调试（显示浏览器窗口）

```bash
WEBGAL_TEST_HEADLESS=false yarn test:integration
```

## 架构

```
┌─────────────────────────────────────────────────────────┐
│  yarn build:test                                        │
│  → parser:build → webgal:build (WEBGAL_TEST=true)       │
│  → packages/webgal/dist/  (含 window.webgalTest 暴露)   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  vitest globalSetup                                     │
│  → 检测 dist 是否存在（不存在则自动构建）                  │
│  → 启动内建静态服务器 (localhost:4173)                    │
│  → 服务 packages/webgal/dist/                           │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  vitest test workers                                    │
│  → Playwright 启动无头 Chromium                          │
│  → 导航到 localhost:4173                                 │
│  → page.evaluate() 调用 window.webgalTest.*              │
│  → 验证状态快照、场景注入、Pixi 舞台、演出管理 等          │
└─────────────────────────────────────────────────────────┘
```

### 文件结构

```
packages/webgal          (被测应用)
  └── src/test/
      ├── exposeTestAPI.ts  暴露内核到 window.webgalTest
      └── types.ts          API 类型定义

packages/webgal-test     (测试包 - 本目录)
  └── src/
      ├── server.ts           内建静态文件服务器
      ├── globalSetup.ts      vitest 全局设置（构建检测 + 启动服务器）
      ├── setup.ts            worker 级 setup
      ├── utils/
      │   ├── bridge.ts       page.evaluate 桥接工具函数
      │   └── fixture.ts      Playwright 浏览器生命周期管理
      ├── types/
      │   └── global.d.ts     window.webgalTest 类型声明
      └── tests/
          ├── auto-mode.test.ts         自动模式测试
          ├── fast-mode.test.ts         快进模式测试
          ├── random-click.test.ts      随机点击测试
          ├── save-load.test.ts         存档/读档一致性测试
          ├── backlog.test.ts           Backlog 回溯一致性测试
          ├── scene-injection.test.ts   场景注入测试
          ├── pixi-stage.test.ts        Pixi 舞台状态测试
          └── perform-manager.test.ts   演出管理器测试
```

## 暴露的 API

`window.webgalTest` 在测试模式下暴露以下模块（可通过 `page.evaluate()` 访问）：

| 模块 | 说明 |
|------|------|
| `core` | WebGAL 核心实例（sceneManager, backlogManager, animationManager, gameplay, events） |
| `live2d` | Live2D 核心实例 |
| `store` | Redux store（getState, dispatch, subscribe） |
| `pixiStage` | Pixi 舞台（figureObjects, backgroundObjects, containers, 动画注册） |
| `pixiApp` | Pixi Application 实例 |
| `sceneManager` | 场景管理器快捷访问 |
| `backlogManager` | Backlog 管理器快捷访问 |
| `animationManager` | 动画管理器快捷访问 |
| `performController` | 演出管理器（performList, arrangeNewPerform, removeAllPerform） |
| `gameplay` | Gameplay 状态（isAuto, isFast） |
| `events` | 事件系统（textSettle, userInteractNext, styleUpdate 等） |
| `controllers` | 游戏控制函数（nextSentence, switchAuto, saveGame, loadGame, changeScene 等） |
| `sceneTools` | 场景解析/注入（sceneParser, injectScene, injectSceneAndRun, injectParsedScene） |
| `dispatch` | Redux dispatch 快捷方法（setStage, resetStageState, setVisibility） |
| `config` | 系统配置（SYSTEM_CONFIG, PERFORM_CONFIG） |
| `takeSnapshot()` | 完整状态快照（Redux, scene, backlog, performs, pixi, gameplay, animations） |
| `utils` | 工具函数（cloneDeep） |

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `WEBGAL_TEST_URL` | `http://localhost:4173` | 由 globalSetup 自动设置，也可手动覆盖 |
| `WEBGAL_TEST_PORT` | `4173` | 静态服务器端口 |
| `WEBGAL_TEST_HEADLESS` | `true` | 设为 `false` 显示浏览器窗口（调试用） |
| `WEBGAL_TEST_SKIP_BUILD` | `false` | 设为 `true` 时，dist 不存在会直接报错而非自动构建 |

## 测试说明

### auto-mode.test.ts (3 tests)
- 验证自动模式开启后游戏自动推进
- 验证推进过程中存档/读档状态一致
- 验证停止后不再推进

### fast-mode.test.ts (4 tests)
- 验证快进模式快速推进（比自动模式快）
- 验证快进中存档/读档状态一致
- 验证停止后不再推进

### random-click.test.ts (5 tests)
- 模拟用户不规律点击，验证游戏不崩溃
- 模拟疯狂连点，验证不出现状态损坏
- 验证随机操作中存档/读档一致

### save-load.test.ts (4 tests)
- 验证存档/读档核心状态完全一致
- 验证从存档点重放与原始执行到达相同状态
- 验证多个存档槽位互不干扰
- 验证存档数据包含正确的 backlog 和场景信息

### backlog.test.ts (5 tests)
- 验证推进过程中 backlog 正确累积
- 验证 backlog 跳转后状态恢复
- 验证连续多次跳转的一致性
- 验证跳转后继续推进，backlog 正确截断续接

### scene-injection.test.ts (5 tests)
- 注入原始 WebGAL 脚本文本并验证场景数据更新
- 注入后通过 nextSentence 依次推进
- 注入含 changeBg 等指令的场景
- 验证注入后 backlog 正确记录
- 验证注入后快照数据完整

### pixi-stage.test.ts (6 tests)
- 读取立绘列表及 transform 属性（x, y, scale, rotation, alpha, visible）
- 读取背景列表
- 验证 snapshot 中 pixiState 结构
- 注入含 changeFigure 的场景后验证舞台对象结构
- 验证 performs 在快照中的数据结构
- 验证 animations 在快照中的数据结构

### perform-manager.test.ts (4 tests)
- 读取当前演出列表
- 注入对话场景后验证演出状态
- removeAllPerform 清空演出列表
- 验证 perform 的阻塞属性

## 工作原理

1. **编译标志**：`WEBGAL_TEST=true` 环境变量触发 Vite `define` 注入 `__WEBGAL_TEST__`
2. **API 暴露**：测试模式下 `main.tsx` 动态加载 `src/test/`，将 WebGAL 核心、Redux store、Pixi 舞台、控制器、场景工具等绑定到 `window.webgalTest`
3. **自动构建**：vitest `globalSetup` 检测 `packages/webgal/dist/` 是否存在，不存在则自动执行 `yarn build:test`
4. **内建服务器**：globalSetup 启动零依赖 Node.js 静态文件服务器（`src/server.ts`），服务构建产物
5. **浏览器桥接**：vitest 通过 Playwright 打开无头 Chromium，导航到内建服务器，通过 `page.evaluate()` 调用 `window.webgalTest` 上的方法
6. **场景注入**：`injectSceneAndRun()` 直接将 WebGAL 脚本文本解析为场景并替换当前场景，无需实际文件，方便测试
7. **状态快照**：`takeSnapshot()` 深拷贝 Redux state、场景数据、backlog、演出列表、Pixi 舞台可视状态、gameplay 状态、动画列表
8. **一致性比较**：`compareSnapshots()` 排除不稳定字段（PerformList、currentDialogKey 等）后进行 JSON 比较
9. **自动清理**：测试完成后 globalSetup teardown 自动关闭静态服务器

## CI 示例（GitHub Actions）

```yaml
- name: Install dependencies
  run: yarn install --frozen-lockfile

- name: Install Playwright
  run: npx playwright install chromium

- name: Build test bundle
  run: yarn build:test

- name: Run integration tests
  run: yarn test:integration
  env:
    WEBGAL_TEST_SKIP_BUILD: 'true'
```
