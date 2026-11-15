# WebGAL Custom Screen Plugin

这是一个独立的 WebGAL 自定义 Screen 插件工程模板。

## 核心规范

1. **逻辑坐标系（2560 × 1440 px）**  
   WebGAL 舞台及所有 Screen 统一建立在 `2560 × 1440` 逻辑像素空间内（根容器固定 `width: 2560px; height: 1440px` 并随窗口等比缩放）。请直接使用绝对 `px` 排版，不要依赖 `vw` / `vh`。
2. **React 18 宿主约束**  
   引擎宿主向全局暴露 `globalThis.__WEBGAL_UI_SDK__`（含 React 18、ReactDOM、jsxRuntime、`@emotion/css`、富文本渲染与路径解析能力），产物通过 Vite External 共享宿主实例，严禁私自升级或更改 `package.json` 中的 `react` / `react-dom` 版本（否则 `npm run export` 会直接拦截）。
3. **资源引用约定**  
   - 在 `src/style.scss` 中直接使用相对路径（例如 `url('./assets/bg.png')`），引擎会自动重映射到当前 Screen 所在模板目录。
   - 在 TSX 中请通过 `@webgal/ui-sdk` 的 `resolveAssetUrl('./assets/icon.png')` 解析资源路径。
4. **MenuPanel 底部安全区提醒（重要）**  
   当你在制作 `save`、`load`、`options` 或 `flowchart` Screen 时，注意 `menuPanel` 会以独立悬浮层形式叠放在页面底部，请务必为你的界面容器预留足够的底部内边距（推荐 `padding-bottom: 144px;`），避免列表内容或翻页按钮被 `MenuPanel` 遮挡。
5. **部件声明（parts）**  
   通过 `parts` 导出给可视化编辑器的可编辑部件；列表/重复按钮等项应设置 `allowLayoutEdit: false`（仅编辑外观样式），顶层面板/按钮栏可设置 `allowLayoutEdit: true`。

## 常用命令

- `npm run typecheck`：TypeScript 类型检查
- `npm run build`：生成单文件 ESM 产物 `dist/index.js`
- `npm run export`：校验 React 版本并打包可导入的 `.zip` 插件压缩包（包含 `dist/index.js`、`src/style.scss`、`webgal-screen.json` 与 `src/assets/`）
