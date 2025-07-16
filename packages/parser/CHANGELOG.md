# WebGAL Parser Changelog

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