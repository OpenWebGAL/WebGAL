# WebGAL Parser Changelog

## [4.6.3] - 2026-08-01

正式发布 4.6.3-beta.1 / beta.2 的多行语句支持，另含以下改动。

### Added
- 新增 `return` 命令，用于从被 `callScene` 调用的场景提前返回
- `sceneEntry` 新增 `locals` / `writeReturnTo`，承载 `callScene` 传入的局部变量与返回值写回目标
- 语音参数识别 `.opus` 扩展名

## [4.6.3-beta.2] - 2026-07-31

### Fixed
- `sceneTextPreProcess`：折叠序列的首行是空行时（例如空行后面紧跟一条续行），整条序列会被静默丢弃，导致预处理后行数变少。这会击穿「解析后语句 index == 文件行号」，进而让存档进度错位。改用 `null` 哨兵区分「不在折叠序列中」与「首行内容为空串」

## [4.6.3-beta.1] - 2026-07-31

### Added
- 正式启用多行语句支持：`sceneParser` 现在会先经过 `sceneTextPreProcess`，把以空白开头且首字符为 `-` 或 `|` 的续行折叠进上一条语句
- `ISentence` 新增行范围字段 `startLine` / `endLine`（0-based，含首尾）与 `isLineBreakHolder`，供图形编辑器按行范围整体替换语句
- 导出 `WEBGAL_LINE_BREAK_MARK` 与 `isLineBreakPlaceholder`

### Fixed
- `sceneTextPreProcess`：移除逐行 `console.log`；场景首行不再被误判为续行；场景末行以 `\` 结尾时不再丢失整段累积内容

### Technical Notes
- 续行会被替换成 `;_WEBGAL_LINE_BREAK_` 占位注释行，**预处理前后行数严格一致**。因此「解析后语句 index == 文件行号」这一不变量继续成立，引擎的存读档、Backlog、场景栈、已读记录（都存语句 index）无需改动，旧存档也不会错位

## [4.5.13] - 2025-07-05

### Fixed
- Fixed interface consistency between `webgal-parser` and main WebGAL project
- Added missing trailing comma in `commandType` enum to match WebGAL main project
- Updated `ISceneData` interface to use `ISceneEntry` instead of `sceneEntry` for better type consistency

### Added
- Added `ISceneEntry` interface as compatibility alias for `sceneEntry`
- Added comprehensive test cases for new animation parameters:
  - `wait` command testing
  - `changeFigure` with `duration`, `enter`, `exit` parameters
  - `changeBg` with animation and transform parameters

### Improved
- Enhanced type safety and consistency with main WebGAL project
- Better test coverage for animation-related features
- Improved interface documentation

### Technical Notes
- The parser already supports all animation parameters (`duration`, `enter`, `exit`, `transform`) through its generic argument parsing system
- No changes to core parsing logic were needed - the parser was already compatible with the latest WebGAL features
- This update focuses on interface consistency and test coverage improvements

## [4.5.12] - Previous Version
- Previous stable release with `wait` command support