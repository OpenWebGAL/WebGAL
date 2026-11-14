import type { ISentence } from '@/Core/controller/scene/sceneInterface';
import {
  FIGURE_POSITIONS,
  figureStateKeyByPosition,
  type IFigurePosition,
  type IStageState,
} from '@/Core/Modules/stage/stageInterface';
import { getFigurePositionFromArgs, getStringArgByKey } from '@/Core/util/getSentenceArg';

export const CHARACTER_FIGURE_SOURCE_PREFIX = 'webgal-character-source:';

/** 可直接写入 Figure 槽位与存档的组合角色来源描述。 */
export interface ICharacterFigureSource {
  name: string;
  items: string[];
}

export interface IFigureSlotTarget {
  key: string;
  position: IFigurePosition;
  isFree: boolean;
}

export interface IFigureSlotTargetState extends IFigureSlotTarget {
  source: string;
}

export function isCharacterFigureSource(value: string): boolean {
  return value.startsWith(CHARACTER_FIGURE_SOURCE_PREFIX);
}

export function serializeCharacterFigureSource(source: ICharacterFigureSource): string {
  return `${CHARACTER_FIGURE_SOURCE_PREFIX}${encodeURIComponent(JSON.stringify([source.name, source.items]))}`;
}

export function parseCharacterFigureSource(value: string): ICharacterFigureSource | null {
  if (!isCharacterFigureSource(value)) {
    return null;
  }
  try {
    const decoded = JSON.parse(decodeURIComponent(value.slice(CHARACTER_FIGURE_SOURCE_PREFIX.length))) as unknown;
    if (!Array.isArray(decoded) || decoded.length !== 2) {
      return null;
    }
    const [rawName, rawItems] = decoded;
    if (typeof rawName !== 'string' || !rawName.trim()) {
      return null;
    }
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return null;
    }
    const items: string[] = [];
    for (const item of rawItems) {
      if (typeof item !== 'string' || !item.trim()) {
        return null;
      }
      items.push(item.trim());
    }
    return { name: rawName.trim(), items };
  } catch {
    return null;
  }
}

export function resolveFigureSlotTarget(sentence: ISentence): IFigureSlotTarget {
  const position = getFigurePositionFromArgs(sentence) || 'center';
  const explicitId = getStringArgByKey(sentence, 'id')?.trim() ?? '';
  return {
    key: explicitId || `fig-${position}`,
    position,
    isFree: explicitId !== '',
  };
}

export function listStageFigureTargets(state: IStageState): IFigureSlotTargetState[] {
  const presetTargets: IFigureSlotTargetState[] = FIGURE_POSITIONS.map((position) => ({
    key: `fig-${position}`,
    position,
    isFree: false,
    source: state[figureStateKeyByPosition[position]] ?? '',
  }));
  const freeTargets: IFigureSlotTargetState[] = (state.freeFigure ?? []).map((figure) => ({
    key: figure.key,
    position: figure.basePosition,
    isFree: true,
    source: figure.name,
  }));
  return [...presetTargets, ...freeTargets];
}
