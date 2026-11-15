#!/usr/bin/env node

/**
 * Compile built-in WebGAL preset screen TSX sources (`src/screens/{stage,menu}/**\/*.tsx`)
 * into self-contained browser ESM bundles under `public/game/template/screens/`
 * and run a React 18 `renderToStaticMarkup` smoke test for every screen variant.
 */

import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEBGAL_ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(WEBGAL_ROOT, 'src');
const UI_ICONS_PATH = path.join(SRC_ROOT, 'sdk', 'uiIcons.ts');
const SCREENS_STAGE_DIR = path.join(SRC_ROOT, 'screens', 'stage');
const SCREENS_MENU_DIR = path.join(SRC_ROOT, 'screens', 'menu');
const OUTPUT_SCREENS_DIR = path.join(WEBGAL_ROOT, 'public', 'game', 'template', 'screens');
const EXPECTED_VARIANT_COUNT = 24;

const SDK_PREAMBLE = [
  'const __WEBGAL_SDK__ = globalThis.__WEBGAL_UI_SDK__;',
  'if (!__WEBGAL_SDK__) {',
  '  throw new Error("WebGAL UI SDK is not initialized.");',
  '}',
].join('\n');

function collectTsxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsxFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results.sort((a, b) => a.localeCompare(b));
}

function unwrapExpr(node) {
  let current = node;
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function readAllowedSdkIcons(uiIconsPath) {
  const sourceText = fs.readFileSync(uiIconsPath, 'utf-8');
  const sourceFile = ts.createSourceFile(uiIconsPath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const icons = new Set();

  for (const stmt of sourceFile.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== 'UI_SDK_ICONS') continue;
      const init = decl.initializer ? unwrapExpr(decl.initializer) : null;
      if (!init || !ts.isObjectLiteralExpression(init)) continue;
      for (const prop of init.properties) {
        if (ts.isShorthandPropertyAssignment(prop)) {
          icons.add(prop.name.text);
        } else if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
          icons.add(prop.name.text);
        }
      }
    }
  }

  if (icons.size === 0) {
    throw new Error(`Failed to parse UI_SDK_ICONS from ${uiIconsPath}`);
  }
  return icons;
}

function inspectVariantExport(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  for (const stmt of sourceFile.statements) {
    const isExported = stmt.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword);
    if (!isExported || !ts.isVariableStatement(stmt)) continue;

    for (const decl of stmt.declarationList.declarations) {
      const hasVariantType =
        decl.type &&
        ts.isTypeReferenceNode(decl.type) &&
        ts.isIdentifier(decl.type.typeName) &&
        decl.type.typeName.text === 'BuiltInScreenVariant';
      if (!hasVariantType || !decl.initializer) continue;

      const obj = unwrapExpr(decl.initializer);
      if (!ts.isObjectLiteralExpression(obj)) continue;

      const props = new Map();
      for (const prop of obj.properties) {
        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
          props.set(prop.name.text, unwrapExpr(prop.initializer));
        } else if (ts.isShorthandPropertyAssignment(prop)) {
          props.set(prop.name.text, prop.name);
        }
      }

      const screenNode = props.get('screen');
      const variantIdNode = props.get('variantId');
      const nameNode = props.get('name');
      const componentNode = props.get('component');
      const partsNode = props.get('parts');
      const cssNode = props.get('defaultCssText');

      if (
        !screenNode ||
        !ts.isStringLiteral(screenNode) ||
        !variantIdNode ||
        !ts.isStringLiteral(variantIdNode) ||
        !nameNode ||
        !ts.isStringLiteral(nameNode) ||
        !componentNode ||
        !ts.isIdentifier(componentNode) ||
        !partsNode ||
        !ts.isIdentifier(partsNode) ||
        !cssNode ||
        !ts.isIdentifier(cssNode)
      ) {
        throw new Error(`Unsupported BuiltInScreenVariant shape in ${filePath}`);
      }

      return {
        filePath,
        sourceText,
        screen: screenNode.text,
        variantId: variantIdNode.text,
        name: nameNode.text,
        componentName: componentNode.text,
        partsName: partsNode.text,
        defaultCssName: cssNode.text,
      };
    }
  }

  return null;
}

function buildDestructureBindings(namedBindings, sourceExpr, fileLabel, filterFn) {
  const bindings = [];
  for (const element of namedBindings.elements) {
    const importedName = element.propertyName ? element.propertyName.text : element.name.text;
    const localName = element.name.text;
    if (filterFn && !filterFn(importedName, localName, element)) continue;
    bindings.push(importedName === localName ? localName : `${importedName}: ${localName}`);
  }
  return bindings.length > 0 ? `const { ${bindings.join(', ')} } = ${sourceExpr};` : '';
}

function rewriteImportDeclaration(decl, allowedIcons, fileLabel) {
  if (!ts.isStringLiteral(decl.moduleSpecifier)) {
    throw new Error(`Dynamic or non-string import in ${fileLabel}`);
  }
  const specifier = decl.moduleSpecifier.text;
  const clause = decl.importClause;
  if (!clause) return '';

  const lines = [];
  const named = clause.namedBindings;

  if (specifier === 'react' || specifier === 'react-dom' || specifier === 'react/jsx-runtime' || specifier === '@emotion/css') {
    const sdkField =
      specifier === 'react'
        ? 'react'
        : specifier === 'react-dom'
          ? 'reactDom'
          : specifier === 'react/jsx-runtime'
            ? 'jsxRuntime'
            : 'emotion';
    const targetExpr = `__WEBGAL_SDK__.${sdkField}`;
    if (clause.name) lines.push(`const ${clause.name.text} = ${targetExpr};`);
    if (named && ts.isNamespaceImport(named)) lines.push(`const ${named.name.text} = ${targetExpr};`);
    if (named && ts.isNamedImports(named)) lines.push(buildDestructureBindings(named, targetExpr, fileLabel));
    return lines.filter(Boolean).join('\n');
  }

  if (specifier === '@icon-park/react') {
    if (!named || !ts.isNamedImports(named)) {
      throw new Error(`Only named imports from '@icon-park/react' are supported (${fileLabel})`);
    }
    return buildDestructureBindings(named, '__WEBGAL_SDK__.icons', fileLabel, (importedName) => {
      if (!allowedIcons.has(importedName)) {
        throw new Error(`Icon '${importedName}' imported by ${fileLabel} is missing from UI_SDK_ICONS`);
      }
      return true;
    });
  }

  if (specifier === '@/sdk/globalUiSdk' || specifier === '@webgal/ui-sdk') {
    if (named && ts.isNamedImports(named)) {
      const sdkLine = buildDestructureBindings(named, '__WEBGAL_SDK__', fileLabel, (importedName, localName) => {
        if (importedName === 'installGlobalUiSdk') {
          lines.push(`const ${localName} = () => __WEBGAL_SDK__;`);
          return false;
        }
        return true;
      });
      if (sdkLine) lines.push(sdkLine);
    } else if (clause.name) {
      lines.push(`const ${clause.name.text} = __WEBGAL_SDK__;`);
    }
    return lines.filter(Boolean).join('\n');
  }

  throw new Error(`Unsupported import '${specifier}' in built-in screen ${fileLabel}`);
}

function rewriteTranspiledModule(jsCode, meta, allowedIcons) {
  const fileLabel = path.relative(WEBGAL_ROOT, meta.filePath);
  const sf = ts.createSourceFile(fileLabel, jsCode, ts.ScriptTarget.ES2020, true, ts.ScriptKind.JS);

  const edits = [];
  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt)) {
      edits.push({
        start: stmt.getStart(sf),
        end: stmt.getEnd(),
        text: rewriteImportDeclaration(stmt, allowedIcons, fileLabel),
      });
    }
  }

  let output = jsCode;
  for (let i = edits.length - 1; i >= 0; i--) {
    const edit = edits[i];
    output = `${output.slice(0, edit.start)}${edit.text}${output.slice(edit.end)}`;
  }

  const partsExport = meta.partsName === 'parts' ? 'parts' : `${meta.partsName} as parts`;
  const cssExport =
    meta.defaultCssName === 'defaultCssText' ? 'defaultCssText' : `${meta.defaultCssName} as defaultCssText`;
  const screenExport = meta.componentName === 'Screen' ? 'Screen' : `${meta.componentName} as Screen`;

  const trailer = [
    '',
    `export { ${partsExport}, ${cssExport}, ${screenExport} };`,
    `export default ${meta.componentName};`,
    '',
  ].join('\n');

  const finalCode = `${SDK_PREAMBLE}\n${output.trimStart()}${trailer}`.replace(/\r\n/g, '\n');
  assertZeroModuleSpecifiers(finalCode, fileLabel);
  return finalCode;
}

function assertZeroModuleSpecifiers(jsCode, fileLabel) {
  const sf = ts.createSourceFile(fileLabel, jsCode, ts.ScriptTarget.ES2020, true, ts.ScriptKind.JS);
  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt)) {
      throw new Error(`Residual import declaration found in compiled ${fileLabel}: ${stmt.getText(sf)}`);
    }
    if (ts.isExportDeclaration(stmt) && stmt.moduleSpecifier) {
      throw new Error(`Re-export with module specifier found in compiled ${fileLabel}: ${stmt.getText(sf)}`);
    }
  }
}

function compileVariant(meta, allowedIcons) {
  const transpiled = ts.transpileModule(meta.sourceText, {
    fileName: meta.filePath,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      removeComments: false,
    },
    reportDiagnostics: true,
  });

  const errors = (transpiled.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error);
  if (errors.length > 0) {
    const message = errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('; ');
    throw new Error(`TypeScript transpile error in ${meta.filePath}: ${message}`);
  }

  return rewriteTranspiledModule(transpiled.outputText, meta, allowedIcons);
}

function createStrictProxy(target, label) {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      if (typeof prop === 'symbol') return Reflect.get(obj, prop, receiver);
      if (prop === 'then') return undefined;
      if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
        throw new Error(`[smoke-sdk] Missing property '${prop}' on ${label}`);
      }
      return Reflect.get(obj, prop, receiver);
    },
  });
}

function installSmokeSdk(allowedIcons) {
  const React = require('react');
  const ReactDOM = require('react-dom');
  const jsxRuntime = require('react/jsx-runtime');
  const iconPark = require('@icon-park/react');

  const icons = {};
  for (const iconName of allowedIcons) {
    if (!iconPark[iconName]) {
      throw new Error(`[smoke-sdk] Icon '${iconName}' is missing from @icon-park/react`);
    }
    icons[iconName] = iconPark[iconName];
  }

  const noop = () => {};
  const renderRichText = (text) => (text == null ? '' : String(text));
  const parseRichTextLines = (text) => [[{ type: 'text', text: String(text ?? ''), ruby: '' }]];
  const renderRichTextLines = (lines) =>
    (Array.isArray(lines) ? lines : []).map((line, i) =>
      React.createElement(
        'span',
        { key: i },
        (Array.isArray(line) ? line : []).map((tok, j) => (tok?.text ? String(tok.text) : '')).join(''),
      ),
    );

  const rawSdk = {
    version: '1.0.0',
    react: React,
    reactDom: ReactDOM,
    jsxRuntime,
    emotion: createStrictProxy(
      {
        css: () => 'webgal-smoke-css',
        cx: (...args) => args.filter(Boolean).join(' '),
        keyframes: () => 'webgal-smoke-kf',
        injectGlobal: noop,
      },
      '__WEBGAL_UI_SDK__.emotion',
    ),
    icons: createStrictProxy(icons, '__WEBGAL_UI_SDK__.icons'),
    resolveAssetUrl: (url) => url ?? '',
    resolveScreenAssetUrl: (url) => url ?? '',
    renderRichText,
    renderRichTextLines,
    parseRichTextLines,
    useScreenParts: (screenId) => ({
      rootProps: { 'data-webgal-screen': screenId, className: 'webgal-smoke-scope' },
    }),
  };

  globalThis.__WEBGAL_UI_SDK__ = createStrictProxy(rawSdk, 'globalThis.__WEBGAL_UI_SDK__');

  return React;
}

function createPlaySeProxy() {
  const noop = () => {};
  return new Proxy({}, { get: () => noop });
}

function buildSmokeProps(screenId) {
  const noop = () => {};
  const t = (key) => key;
  const playSe = createPlaySeProxy();

  switch (screenId) {
    case 'title':
      return {
        visible: true,
        backgroundUrl: '',
        enableContinue: true,
        canContinue: true,
        enableExtra: true,
        hasAppreciationItems: true,
        onStart: noop,
        onContinue: noop,
        onOpenOptions: noop,
        onOpenLoad: noop,
        onOpenExtra: noop,
        onExit: noop,
        t,
        playSe,
      };
    case 'textbox':
      return {
        visible: true,
        isHasName: true,
        showName: 'Narrator',
        dialogSegments: ['Sample dialogue line.'],
        currentDialogKey: 'smoke-dialog',
        isRead: false,
        isPreview: false,
        miniAvatarUrl: '',
        fontFamily: 'sans-serif',
        fontSizePercent: 100,
        lineHeight: 1.5,
        lineLimit: 3,
        textDelayMs: 30,
        textDurationMs: 200,
        textRevealEndMs: 500,
        textboxOpacity: 90,
        isDialogNotend: false,
        settledSignal: 1,
        t,
        playSe,
      };
    case 'choose':
      return {
        visible: true,
        options: [{ id: 'c1', text: 'Option A', disabled: false }],
        fontFamily: 'sans-serif',
        onSelect: noop,
        t,
        playSe,
      };
    case 'save':
    case 'load':
      return {
        visible: true,
        slPage: 1,
        savesByIndex: {
          1: {
            index: 1,
            saveTime: '2026-11-15 12:00',
            previewImage: '',
            nowStageState: { showName: 'Narrator', showText: 'Saved line' },
          },
        },
        onSelectPage: noop,
        onLoadRange: noop,
        onSlotAction: noop,
        t,
        playSe,
      };
    case 'options':
      return {
        visible: true,
        optionData: {
          volumeMain: 80,
          vocalVolume: 80,
          bgmVolume: 80,
          seVolume: 80,
          uiSeVolume: 80,
          textSpeed: 2,
          autoSpeed: 2,
          textSize: 1,
          textboxOpacity: 90,
          textboxFont: 0,
          fullScreen: 1,
          language: 0,
          playSpeed: 1,
          voiceInterruption: 0,
          lineLimit: 3,
        },
        fontOptions: [{ label: 'Default', fontFamily: 'sans-serif', type: 'sans-serif' }],
        languageOptions: [{ value: 0, label: '简体中文' }],
        isFullscreenSupported: true,
        isFullscreen: false,
        previewBgUrl: '',
        version: '4.6.7',
        onChangeOption: noop,
        onChangeLanguage: noop,
        onToggleFullscreen: noop,
        onResetSaves: noop,
        onResetOptions: noop,
        onResetAll: noop,
        onExportSaves: noop,
        onImportSaves: noop,
        t,
        playSe,
      };
    case 'flowchart':
      return {
        visible: true,
        flowcharts: [],
        unlockedNodeKeys: [],
        lockedNodeVisibility: 'all',
        onJumpToNode: noop,
        t,
        playSe,
      };
    case 'menuPanel':
      return {
        visible: true,
        activeTag: 0,
        canSave: true,
        enableFlowchart: true,
        onSelectTag: noop,
        onBackToTitle: noop,
        onClose: noop,
        t,
        playSe,
      };
    case 'backlog':
      return {
        visible: true,
        items: [{ index: 0, speaker: 'Narrator', text: 'History line', vocalUrl: '', sentenceId: 1 }],
        playingIndex: null,
        onJump: noop,
        onToggleVocal: noop,
        onClose: noop,
        scrollContainerAttr: 'data-webgal-backlog-scroll',
        t,
        playSe,
      };
    case 'extra':
      return {
        visible: true,
        cgGroups: [{ key: 'g1', name: 'CG 1', resources: [{ name: 'CG 1', url: '', series: 'default' }] }],
        bgmList: [{ name: 'Main Theme', url: '', series: 'default' }],
        currentBgmUrl: '',
        isBgmPlaying: false,
        onSelectBgm: noop,
        onToggleBgmPlay: noop,
        onPrevBgm: noop,
        onNextBgm: noop,
        onClose: noop,
        t,
        playSe,
      };
    case 'bottomControlPanel':
      return {
        visible: true,
        controlsVisible: true,
        isTextBoxVisible: true,
        isControlsLocked: false,
        isAuto: false,
        isFast: false,
        isFullscreen: false,
        isFullscreenSupported: true,
        enableFlowchart: true,
        quickSavePreview: null,
        onToggleTextBox: noop,
        onOpenBacklog: noop,
        onOpenFlowchart: noop,
        onReplayVocal: noop,
        onToggleAuto: noop,
        onToggleFast: noop,
        onQuickSave: noop,
        onQuickLoad: noop,
        onOpenSave: noop,
        onOpenLoad: noop,
        onOpenOptions: noop,
        onBackToTitle: noop,
        onToggleFullscreen: noop,
        onToggleControlsLock: noop,
        t,
        playSe,
      };
    case 'globalDialog':
      return {
        visible: true,
        title: 'Confirm',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: noop,
        onCancel: noop,
        t,
        playSe,
      };
    default:
      throw new Error(`No smoke props defined for screen '${screenId}'`);
  }
}

async function main() {
  const allowedIcons = readAllowedSdkIcons(UI_ICONS_PATH);
  const tsxFiles = [...collectTsxFiles(SCREENS_STAGE_DIR), ...collectTsxFiles(SCREENS_MENU_DIR)];
  const variants = tsxFiles.map((filePath) => inspectVariantExport(filePath)).filter(Boolean);

  if (variants.length !== EXPECTED_VARIANT_COUNT) {
    throw new Error(`Expected ${EXPECTED_VARIANT_COUNT} built-in screen variants, found ${variants.length}`);
  }

  fs.rmSync(OUTPUT_SCREENS_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_SCREENS_DIR, { recursive: true });

  const React = installSmokeSdk(allowedIcons);
  const ReactDOMServer = require('react-dom/server');
  const smokeTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webgal-screens-smoke-'));

  try {
    for (const meta of variants) {
      const outDir = path.join(OUTPUT_SCREENS_DIR, meta.screen, meta.variantId);
      fs.mkdirSync(outDir, { recursive: true });

      const compiledJs = compileVariant(meta, allowedIcons);
      const entryPath = path.join(outDir, 'index.js');
      fs.writeFileSync(entryPath, compiledJs, 'utf-8');

      // Import via .mjs under tmpdir so Node treats ESM consistently regardless of package.json type.
      const smokePath = path.join(smokeTempDir, `${meta.screen}__${meta.variantId}.mjs`);
      fs.writeFileSync(smokePath, compiledJs, 'utf-8');
      const mod = await import(pathToFileURL(smokePath).href);

      if (!Array.isArray(mod.parts)) {
        throw new Error(`${meta.screen}/${meta.variantId}: exported 'parts' is not an array`);
      }
      if (typeof mod.defaultCssText !== 'string' || mod.defaultCssText.trim().length === 0) {
        throw new Error(`${meta.screen}/${meta.variantId}: exported 'defaultCssText' is empty`);
      }
      if (typeof mod.default !== 'function') {
        throw new Error(`${meta.screen}/${meta.variantId}: default export is not a component function`);
      }

      const html = ReactDOMServer.renderToStaticMarkup(React.createElement(mod.default, buildSmokeProps(meta.screen)));
      if (typeof html !== 'string' || html.trim().length === 0) {
        throw new Error(`${meta.screen}/${meta.variantId}: renderToStaticMarkup returned empty HTML`);
      }

      fs.writeFileSync(
        path.join(outDir, 'style.scss'),
        `${mod.defaultCssText.replace(/\r\n/g, '\n').trim()}\n`,
        'utf-8',
      );

      const manifest = {
        screen: meta.screen,
        variantId: meta.variantId,
        name: meta.name,
        version: '1.0.0',
        entry: 'index.js',
        style: 'style.scss',
        parts: mod.parts,
      };
      fs.writeFileSync(
        path.join(outDir, 'webgal-screen.json'),
        `${JSON.stringify(manifest, null, 2).replace(/\r\n/g, '\n')}\n`,
        'utf-8',
      );
    }
  } finally {
    fs.rmSync(smokeTempDir, { recursive: true, force: true });
  }

  console.log(`Built and smoke-tested ${variants.length} default template screens into ${path.relative(WEBGAL_ROOT, OUTPUT_SCREENS_DIR)}`);
}

main().catch((err) => {
  console.error('[build-default-template-screens] Failed:', err);
  process.exit(1);
});
