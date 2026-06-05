import { fileType } from './interface/assets';
import { arg, commandType, IAsset, IScene, ISentence } from './interface/sceneInterface';

export type SceneAnalyzerSeverity = 'info' | 'warning' | 'error';

export type SceneReferenceKind =
  | 'changeScene'
  | 'callScene'
  | 'choose'
  | 'subScene'
  | 'label'
  | 'unknown';

export type VariableUsageKind = 'read' | 'write' | 'condition';

export interface SceneAnalyzerPosition {
  lineNumber: number;
  sentenceIndex: number;
}

export interface SceneLabelInfo extends SceneAnalyzerPosition {
  name: string;
  duplicate: boolean;
}

export interface SceneReferenceInfo extends SceneAnalyzerPosition {
  kind: SceneReferenceKind;
  target: string;
  sourceCommand: commandType;
  sourceCommandRaw: string;
  resolved: boolean;
}

export interface SceneChoiceInfo extends SceneAnalyzerPosition {
  text: string;
  target: string;
  resolvedScene: boolean;
  raw: string;
}

export interface SceneAssetInfo extends IAsset {
  sentenceIndex: number;
  sourceCommand: commandType;
  sourceCommandRaw: string;
}

export interface SceneVariableUsage extends SceneAnalyzerPosition {
  name: string;
  kind: VariableUsageKind;
  expression: string;
  sourceCommand: commandType;
  sourceCommandRaw: string;
}

export interface SceneAnalyzerWarning extends SceneAnalyzerPosition {
  severity: SceneAnalyzerSeverity;
  code: string;
  message: string;
  command?: commandType;
  commandRaw?: string;
}

export interface SceneCommandSummary {
  command: commandType;
  commandRaw: string;
  count: number;
  firstLine: number;
  lastLine: number;
}

export interface SceneAnalyzerOptions {
  knownScenes?: string[];
  strictSceneExtensions?: boolean;
  includeInfoWarnings?: boolean;
}

export interface SceneAnalysisResult {
  sceneName: string;
  sceneUrl: string;
  sentenceCount: number;
  labels: SceneLabelInfo[];
  references: SceneReferenceInfo[];
  choices: SceneChoiceInfo[];
  assets: SceneAssetInfo[];
  variables: SceneVariableUsage[];
  commands: SceneCommandSummary[];
  warnings: SceneAnalyzerWarning[];
  assetsByType: Partial<Record<fileType, SceneAssetInfo[]>>;
  referencedScenes: string[];
  referencedLabels: string[];
  definedLabels: string[];
}

interface LabelMapEntry {
  first: SceneLabelInfo;
  all: SceneLabelInfo[];
}

interface AnalyzerContext {
  scene: IScene;
  options: Required<SceneAnalyzerOptions>;
  knownScenes: Set<string>;
  labelMap: Map<string, LabelMapEntry>;
  labels: SceneLabelInfo[];
  references: SceneReferenceInfo[];
  choices: SceneChoiceInfo[];
  assets: SceneAssetInfo[];
  variables: SceneVariableUsage[];
  warnings: SceneAnalyzerWarning[];
  commandMap: Map<string, SceneCommandSummary>;
  assetsByType: Partial<Record<fileType, SceneAssetInfo[]>>;
}

const DEFAULT_OPTIONS: Required<SceneAnalyzerOptions> = {
  knownScenes: [],
  strictSceneExtensions: false,
  includeInfoWarnings: true,
};

const SCENE_COMMANDS = new Set<commandType>([
  commandType.changeScene,
  commandType.callScene,
]);

const LABEL_REFERENCE_COMMANDS = new Set<commandType>([
  commandType.jumpLabel,
  commandType.chooseLabel,
]);

const WRITE_VARIABLE_COMMANDS = new Set<commandType>([
  commandType.setVar,
]);

const CONDITION_COMMANDS = new Set<commandType>([
  commandType.if,
]);

const TERMINAL_COMMANDS = new Set<commandType>([
  commandType.end,
  commandType.changeScene,
]);

const SCENE_LIKE_EXTENSION_RE = /\.(txt|ks|webgal)$/i;
const VARIABLE_TOKEN_RE = /[A-Za-z_\u4e00-\u9fa5][\w\u4e00-\u9fa5]*/g;
const RESERVED_VARIABLE_WORDS = new Set([
  'true',
  'false',
  'null',
  'undefined',
  'and',
  'or',
  'not',
  'if',
  'else',
]);

export function analyzeScene(
  scene: IScene,
  options: SceneAnalyzerOptions = {},
): SceneAnalysisResult {
  const context = createAnalyzerContext(scene, options);

  collectCommandSummary(context);
  collectAssets(context);
  collectLabels(context);
  collectSentenceFacts(context);
  collectSubSceneReferences(context);
  validateDuplicateLabels(context);
  validateReferences(context);
  validateChoices(context);
  validateAssets(context);
  validateControlFlow(context);

  return buildResult(context);
}

function createAnalyzerContext(scene: IScene, options: SceneAnalyzerOptions): AnalyzerContext {
  const mergedOptions: Required<SceneAnalyzerOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
    knownScenes: options.knownScenes ?? DEFAULT_OPTIONS.knownScenes,
  };

  return {
    scene,
    options: mergedOptions,
    knownScenes: new Set(mergedOptions.knownScenes.map(normalizeSceneTarget)),
    labelMap: new Map(),
    labels: [],
    references: [],
    choices: [],
    assets: [],
    variables: [],
    warnings: [],
    commandMap: new Map(),
    assetsByType: {},
  };
}

function collectCommandSummary(context: AnalyzerContext): void {
  context.scene.sentenceList.forEach((sentence, sentenceIndex) => {
    const lineNumber = getSentenceLineNumber(sentence, sentenceIndex);
    const key = `${sentence.command}:${sentence.commandRaw}`;
    const existing = context.commandMap.get(key);

    if (existing) {
      existing.count += 1;
      existing.lastLine = lineNumber;
      return;
    }

    context.commandMap.set(key, {
      command: sentence.command,
      commandRaw: sentence.commandRaw,
      count: 1,
      firstLine: lineNumber,
      lastLine: lineNumber,
    });
  });
}

function collectAssets(context: AnalyzerContext): void {
  context.scene.sentenceList.forEach((sentence, sentenceIndex) => {
    sentence.sentenceAssets.forEach((asset) => {
      const normalizedAsset: SceneAssetInfo = {
        ...asset,
        sentenceIndex,
        sourceCommand: sentence.command,
        sourceCommandRaw: sentence.commandRaw,
      };

      context.assets.push(normalizedAsset);

      const bucket = context.assetsByType[asset.type] ?? [];
      bucket.push(normalizedAsset);
      context.assetsByType[asset.type] = bucket;
    });
  });
}

function collectLabels(context: AnalyzerContext): void {
  context.scene.sentenceList.forEach((sentence, sentenceIndex) => {
    if (sentence.command !== commandType.label) {
      return;
    }

    const name = normalizeLabel(sentence.content);
    const lineNumber = getSentenceLineNumber(sentence, sentenceIndex);
    const label: SceneLabelInfo = {
      name,
      lineNumber,
      sentenceIndex,
      duplicate: false,
    };

    context.labels.push(label);

    const existing = context.labelMap.get(name);
    if (existing) {
      label.duplicate = true;
      existing.first.duplicate = true;
      existing.all.push(label);
      return;
    }

    context.labelMap.set(name, {
      first: label,
      all: [label],
    });
  });
}

function collectSentenceFacts(context: AnalyzerContext): void {
  context.scene.sentenceList.forEach((sentence, sentenceIndex) => {
    collectSceneReferences(context, sentence, sentenceIndex);
    collectLabelReferences(context, sentence, sentenceIndex);
    collectChoices(context, sentence, sentenceIndex);
    collectVariableUsage(context, sentence, sentenceIndex);
    collectInlineCommentWarnings(context, sentence, sentenceIndex);
  });
}

function collectSceneReferences(
  context: AnalyzerContext,
  sentence: ISentence,
  sentenceIndex: number,
): void {
  if (!SCENE_COMMANDS.has(sentence.command)) {
    return;
  }

  const target = normalizeSceneTarget(sentence.content);
  if (!target) {
    pushWarning(context, sentence, sentenceIndex, 'empty-scene-reference', 'warning', 'Scene reference is empty.');
    return;
  }

  context.references.push({
    kind: sentence.command === commandType.changeScene ? 'changeScene' : 'callScene',
    target,
    sourceCommand: sentence.command,
    sourceCommandRaw: sentence.commandRaw,
    lineNumber: getSentenceLineNumber(sentence, sentenceIndex),
    sentenceIndex,
    resolved: isSceneResolved(context, target),
  });
}

function collectLabelReferences(
  context: AnalyzerContext,
  sentence: ISentence,
  sentenceIndex: number,
): void {
  if (!LABEL_REFERENCE_COMMANDS.has(sentence.command)) {
    return;
  }

  const target = normalizeLabel(sentence.content);
  if (!target) {
    pushWarning(context, sentence, sentenceIndex, 'empty-label-reference', 'warning', 'Label reference is empty.');
    return;
  }

  context.references.push({
    kind: 'label',
    target,
    sourceCommand: sentence.command,
    sourceCommandRaw: sentence.commandRaw,
    lineNumber: getSentenceLineNumber(sentence, sentenceIndex),
    sentenceIndex,
    resolved: context.labelMap.has(target),
  });
}

function collectChoices(
  context: AnalyzerContext,
  sentence: ISentence,
  sentenceIndex: number,
): void {
  if (sentence.command !== commandType.choose) {
    return;
  }

  splitChoiceContent(sentence.content).forEach((choice) => {
    const target = normalizeSceneTarget(choice.target);
    const choiceInfo: SceneChoiceInfo = {
      text: choice.text,
      target,
      resolvedScene: target ? isSceneResolved(context, target) : false,
      raw: choice.raw,
      lineNumber: getSentenceLineNumber(sentence, sentenceIndex),
      sentenceIndex,
    };

    context.choices.push(choiceInfo);

    if (target) {
      context.references.push({
        kind: 'choose',
        target,
        sourceCommand: sentence.command,
        sourceCommandRaw: sentence.commandRaw,
        lineNumber: choiceInfo.lineNumber,
        sentenceIndex,
        resolved: choiceInfo.resolvedScene,
      });
    }
  });
}

function collectVariableUsage(
  context: AnalyzerContext,
  sentence: ISentence,
  sentenceIndex: number,
): void {
  if (WRITE_VARIABLE_COMMANDS.has(sentence.command)) {
    collectWriteVariables(context, sentence, sentenceIndex);
  }

  if (CONDITION_COMMANDS.has(sentence.command)) {
    collectConditionVariables(context, sentence, sentenceIndex);
  }

  sentence.args.forEach((argument) => {
    if (argument.key === 'when' && typeof argument.value === 'string') {
      collectExpressionVariables(context, sentence, sentenceIndex, argument.value, 'condition');
    }
  });
}

function collectWriteVariables(
  context: AnalyzerContext,
  sentence: ISentence,
  sentenceIndex: number,
): void {
  const expression = sentence.content.trim();
  if (!expression) {
    pushWarning(context, sentence, sentenceIndex, 'empty-set-var', 'warning', 'setVar command has no expression.');
    return;
  }

  const variableName = extractAssignedVariableName(expression);
  if (!variableName) {
    pushWarning(context, sentence, sentenceIndex, 'invalid-set-var', 'warning', `Unable to find assigned variable in "${expression}".`);
    return;
  }

  context.variables.push({
    name: variableName,
    kind: 'write',
    expression,
    sourceCommand: sentence.command,
    sourceCommandRaw: sentence.commandRaw,
    lineNumber: getSentenceLineNumber(sentence, sentenceIndex),
    sentenceIndex,
  });

  const rightSide = expression.slice(expression.indexOf('=') + 1);
  collectExpressionVariables(context, sentence, sentenceIndex, rightSide, 'read');
}

function collectConditionVariables(
  context: AnalyzerContext,
  sentence: ISentence,
  sentenceIndex: number,
): void {
  const expression = sentence.content.trim();
  if (!expression) {
    pushWarning(context, sentence, sentenceIndex, 'empty-condition', 'warning', 'Conditional command has no expression.');
    return;
  }

  collectExpressionVariables(context, sentence, sentenceIndex, expression, 'condition');
}

function collectExpressionVariables(
  context: AnalyzerContext,
  sentence: ISentence,
  sentenceIndex: number,
  expression: string,
  kind: VariableUsageKind,
): void {
  const names = extractVariableNames(expression);
  names.forEach((name) => {
    context.variables.push({
      name,
      kind,
      expression,
      sourceCommand: sentence.command,
      sourceCommandRaw: sentence.commandRaw,
      lineNumber: getSentenceLineNumber(sentence, sentenceIndex),
      sentenceIndex,
    });
  });
}

function collectInlineCommentWarnings(
  context: AnalyzerContext,
  sentence: ISentence,
  sentenceIndex: number,
): void {
  if (!sentence.inlineComment) {
    return;
  }

  if (!sentence.inlineComment.trim().startsWith('//')) {
    pushWarning(
      context,
      sentence,
      sentenceIndex,
      'unusual-inline-comment',
      'info',
      'Inline comment does not start with //.',
    );
  }
}

function collectSubSceneReferences(context: AnalyzerContext): void {
  context.scene.subSceneList.forEach((subScene, index) => {
    const target = normalizeSceneTarget(subScene);
    if (!target) {
      return;
    }

    context.references.push({
      kind: 'subScene',
      target,
      sourceCommand: commandType.callScene,
      sourceCommandRaw: 'subScene',
      lineNumber: index + 1,
      sentenceIndex: -1,
      resolved: isSceneResolved(context, target),
    });
  });
}

function validateDuplicateLabels(context: AnalyzerContext): void {
  context.labelMap.forEach((entry) => {
    if (entry.all.length <= 1) {
      return;
    }

    entry.all.forEach((label) => {
      context.warnings.push({
        severity: 'error',
        code: 'duplicate-label',
        message: `Duplicate label "${label.name}" appears ${entry.all.length} times.`,
        lineNumber: label.lineNumber,
        sentenceIndex: label.sentenceIndex,
        command: commandType.label,
        commandRaw: 'label',
      });
    });
  });
}

function validateReferences(context: AnalyzerContext): void {
  context.references.forEach((reference) => {
    if (reference.kind === 'label' && !reference.resolved) {
      context.warnings.push({
        severity: 'error',
        code: 'missing-label',
        message: `Label "${reference.target}" is referenced but not defined in this scene.`,
        lineNumber: reference.lineNumber,
        sentenceIndex: reference.sentenceIndex,
        command: reference.sourceCommand,
        commandRaw: reference.sourceCommandRaw,
      });
    }

    if (isSceneReference(reference.kind) && !reference.resolved && context.knownScenes.size > 0) {
      context.warnings.push({
        severity: 'warning',
        code: 'unknown-scene',
        message: `Scene "${reference.target}" is referenced but not present in knownScenes.`,
        lineNumber: reference.lineNumber,
        sentenceIndex: reference.sentenceIndex,
        command: reference.sourceCommand,
        commandRaw: reference.sourceCommandRaw,
      });
    }

    if (
      context.options.strictSceneExtensions &&
      isSceneReference(reference.kind) &&
      reference.target &&
      !SCENE_LIKE_EXTENSION_RE.test(reference.target)
    ) {
      context.warnings.push({
        severity: 'warning',
        code: 'scene-extension',
        message: `Scene reference "${reference.target}" does not look like a scene file.`,
        lineNumber: reference.lineNumber,
        sentenceIndex: reference.sentenceIndex,
        command: reference.sourceCommand,
        commandRaw: reference.sourceCommandRaw,
      });
    }
  });
}

function validateChoices(context: AnalyzerContext): void {
  context.choices.forEach((choice) => {
    const sentence = context.scene.sentenceList[choice.sentenceIndex];
    if (!choice.text) {
      pushWarning(context, sentence, choice.sentenceIndex, 'empty-choice-text', 'warning', 'Choice text is empty.');
    }

    if (!choice.target) {
      pushWarning(context, sentence, choice.sentenceIndex, 'empty-choice-target', 'warning', `Choice "${choice.raw}" has no target scene.`);
    }
  });
}

function validateAssets(context: AnalyzerContext): void {
  const seen = new Set<string>();

  context.assets.forEach((asset) => {
    const key = `${asset.type}:${asset.url}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    if (!asset.url || asset.url.trim().length === 0) {
      const sentence = context.scene.sentenceList[asset.sentenceIndex];
      context.warnings.push({
        severity: 'warning',
        code: 'empty-asset-url',
        message: `Asset "${asset.name}" has an empty URL.`,
        lineNumber: asset.lineNumber > 0 ? asset.lineNumber : getSentenceLineNumber(sentence, asset.sentenceIndex),
        sentenceIndex: asset.sentenceIndex,
        command: asset.sourceCommand,
        commandRaw: asset.sourceCommandRaw,
      });
    }
  });
}

function validateControlFlow(context: AnalyzerContext): void {
  context.scene.sentenceList.forEach((sentence, index) => {
    if (!TERMINAL_COMMANDS.has(sentence.command)) {
      return;
    }

    if (sentence.args.some((arg) => arg.key === 'when')) {
      return;
    }

    const nextMeaningful = findNextMeaningfulSentence(context.scene.sentenceList, index + 1);
    if (!nextMeaningful) {
      return;
    }

    const [nextSentence, nextIndex] = nextMeaningful;
    if (nextSentence.command === commandType.label) {
      return;
    }

    pushWarning(
      context,
      nextSentence,
      nextIndex,
      'unreachable-after-terminal-command',
      'info',
      'This sentence follows a terminal command before the next label.',
    );
  });
}

function buildResult(context: AnalyzerContext): SceneAnalysisResult {
  const warnings = context.options.includeInfoWarnings
    ? context.warnings
    : context.warnings.filter((warning) => warning.severity !== 'info');

  const referencedScenes = uniqueSorted(
    context.references
      .filter((reference) => isSceneReference(reference.kind))
      .map((reference) => reference.target)
      .filter(Boolean),
  );

  const referencedLabels = uniqueSorted(
    context.references
      .filter((reference) => reference.kind === 'label')
      .map((reference) => reference.target)
      .filter(Boolean),
  );

  return {
    sceneName: context.scene.sceneName,
    sceneUrl: context.scene.sceneUrl,
    sentenceCount: context.scene.sentenceList.length,
    labels: context.labels,
    references: context.references,
    choices: context.choices,
    assets: context.assets,
    variables: context.variables,
    commands: Array.from(context.commandMap.values()).sort((a, b) => a.firstLine - b.firstLine),
    warnings,
    assetsByType: context.assetsByType,
    referencedScenes,
    referencedLabels,
    definedLabels: uniqueSorted(context.labels.map((label) => label.name)),
  };
}

function splitChoiceContent(content: string): Array<{ text: string; target: string; raw: string }> {
  if (!content.trim()) {
    return [];
  }

  return splitEscaped(content, '|').map((rawChoice) => {
    const [rawText, ...targetParts] = splitEscaped(rawChoice, ':');
    return {
      text: unescapeChoiceToken(rawText.trim()),
      target: unescapeChoiceToken(targetParts.join(':').trim()),
      raw: rawChoice,
    };
  });
}

function splitEscaped(input: string, separator: string): string[] {
  const parts: string[] = [];
  let current = '';
  let escaped = false;

  for (const char of input) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      current += char;
      continue;
    }

    if (char === separator) {
      parts.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  parts.push(current);
  return parts;
}

function unescapeChoiceToken(input: string): string {
  return input.replace(/\\([|:])/g, '$1');
}

function extractAssignedVariableName(expression: string): string | undefined {
  const equalIndex = expression.indexOf('=');
  if (equalIndex < 0) {
    return undefined;
  }

  const left = expression.slice(0, equalIndex).trim();
  const match = left.match(/[A-Za-z_\u4e00-\u9fa5][\w\u4e00-\u9fa5]*/);
  return match?.[0];
}

function extractVariableNames(expression: string): string[] {
  const withoutStrings = expression.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, ' ');
  const names = new Set<string>();
  const matches = withoutStrings.match(VARIABLE_TOKEN_RE) || [];

  for (const token of matches) {
    if (!RESERVED_VARIABLE_WORDS.has(token.toLowerCase()) && Number.isNaN(Number(token))) {
      names.add(token);
    }
  }

  return Array.from(names);
}

function findNextMeaningfulSentence(
  sentences: ISentence[],
  startIndex: number,
): [ISentence, number] | undefined {
  for (let i = startIndex; i < sentences.length; i++) {
    const sentence = sentences[i];
    if (sentence.command === commandType.comment) {
      continue;
    }
    if (!sentence.content && sentence.args.length === 0 && sentence.sentenceAssets.length === 0) {
      continue;
    }
    return [sentence, i];
  }

  return undefined;
}

function getSentenceLineNumber(sentence: ISentence, sentenceIndex: number): number {
  const firstAssetLine = sentence.sentenceAssets.find((asset) => asset.lineNumber > 0)?.lineNumber;
  return firstAssetLine ?? sentenceIndex + 1;
}

function normalizeLabel(label: string): string {
  return label.trim();
}

function normalizeSceneTarget(sceneTarget: string): string {
  return sceneTarget.trim().replace(/\\/g, '/');
}

function isSceneResolved(context: AnalyzerContext, target: string): boolean {
  if (context.knownScenes.size === 0) {
    return true;
  }

  const normalized = normalizeSceneTarget(target);
  const stripped = stripLeadingSlash(normalized);
  return context.knownScenes.has(normalized) || context.knownScenes.has(stripped) || context.knownScenes.has(`/${stripped}`);
}

function stripLeadingSlash(input: string): string {
  return input.replace(/^\/+/, '');
}

function isSceneReference(kind: SceneReferenceKind): boolean {
  return kind === 'changeScene' || kind === 'callScene' || kind === 'choose' || kind === 'subScene';
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function pushWarning(
  context: AnalyzerContext,
  sentence: ISentence,
  sentenceIndex: number,
  code: string,
  severity: SceneAnalyzerSeverity,
  message: string,
): void {
  context.warnings.push({
    severity,
    code,
    message,
    lineNumber: getSentenceLineNumber(sentence, sentenceIndex),
    sentenceIndex,
    command: sentence.command,
    commandRaw: sentence.commandRaw,
  });
}
