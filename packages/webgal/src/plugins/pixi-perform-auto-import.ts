import type { PluginOption } from 'vite';
import { resolve, relative, extname } from 'path';
import { readdirSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { isEqual, debounce } from 'lodash';

interface Options {
  scriptDir: string;
  managerDir: string;
  outputFile?: string;
  watchDebounce?: number;
  clearWhenClose?: boolean;
  couldReload?: boolean;
}

export default function pixiPerformAutoImport(options: Options): PluginOption {
  const {
    scriptDir,
    managerDir,
    outputFile = 'initRegister.ts',
    watchDebounce = 100,
    clearWhenClose = false,
    couldReload = false,
  } = options;
  if (!scriptDir || !managerDir) {
    throw new Error('scriptDir and managerDir are required options');
  }
  const outputPath = resolve(managerDir, outputFile);
const relativePath = relative(managerDir, scriptDir).replace(/\\/g, '/');
  let lastFiles: string[] = [];

  function setInitFile() {
    console.log('正在自动编写pixi特效依赖注入');
    writeFileSync(
      outputPath,
      lastFiles
        .map((v) => {
          const filePath = relativePath + '/' + v.slice(0, v.lastIndexOf('.'));
          return `import '${filePath}';`;
        })
        .join('\n') + '\n',
      { encoding: 'utf-8' },
    );
  }

  function getPixiPerformScriptFiles() {
    const scriptFiles = readdirSync(scriptDir, { encoding: 'utf-8' }).filter((v) => {
      return ['.ts', '.js', '.tsx', '.jsx'].includes(extname(v));
    });
    if (!isEqual(scriptFiles, lastFiles)) {
      lastFiles = scriptFiles;
      setInitFile();
      return true;
    } else {
      return false;
    }
  }

  return {
    name: 'vite-plugin-webgal-pixi-perform-auto-import',
    configResolved() {
      // 确保输出目录存在
      try {
        mkdirSync(resolve(managerDir), { recursive: true });
      } catch (e) {
        console.error(e);
      }
    },
    // 开发服务器配置
    configureServer(server) {
      const updateImports = debounce((path: string) => {
        if (!path.includes(scriptDir)) {
          return;
        }
        const shouldReload = getPixiPerformScriptFiles();
        if (couldReload && shouldReload) {
          server.ws.send({ type: 'full-reload' });
        }
      }, watchDebounce);

      server.watcher
        .add(scriptDir)
        .on('add', updateImports)
        .on('unlink', updateImports)
        .on('addDir', updateImports)
        .on('unlinkDir', updateImports);
    },

    // 构建时处理
    buildStart() {
      getPixiPerformScriptFiles();
    },

    // 关闭时清理
    closeBundle() {
      if (clearWhenClose && process.env.NODE_ENV !== 'production') {
        try {
          unlinkSync(outputPath);
        } catch (e) {
          console.error(e);
        }
      }
    },
  };
}
