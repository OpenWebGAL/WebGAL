import { CharacterTemplateError } from './characterTemplate';
import type { IFigurePosition, IStageState } from '@/Core/Modules/stage/stageInterface';
import { listFigureTargets } from './characterFigureTarget';

const CHARACTER_FIGURE_SOURCE_PREFIX = 'webgal-character-source:';

/** 可直接写入 Figure Target 与存档的角色来源描述。 */
export interface ICharacterFigureSource {
  name: string;
  items: string[];
}

export interface ICharacterFigureTarget {
  key: string;
  position: IFigurePosition;
  source: ICharacterFigureSource;
}

export function serializeCharacterFigureSource(source: ICharacterFigureSource): string {
  return `${CHARACTER_FIGURE_SOURCE_PREFIX}${encodeURIComponent(JSON.stringify([source.name, source.items]))}`;
}

export function parseCharacterFigureSource(value: string): ICharacterFigureSource | null {
  if (!value.startsWith(CHARACTER_FIGURE_SOURCE_PREFIX)) {
    return null;
  }

  try {
    const decoded = JSON.parse(decodeURIComponent(value.slice(CHARACTER_FIGURE_SOURCE_PREFIX.length))) as unknown;
    if (
      !Array.isArray(decoded) ||
      decoded.length !== 2 ||
      typeof decoded[0] !== 'string' ||
      !decoded[0] ||
      !Array.isArray(decoded[1]) ||
      decoded[1].length === 0 ||
      decoded[1].some((item) => typeof item !== 'string' || !item)
    ) {
      throw new Error('invalid source payload');
    }
    return { name: decoded[0], items: [...decoded[1]] };
  } catch (error) {
    throw new CharacterTemplateError(`角色 Figure 来源描述无效：${String(error)}`);
  }
}

export function collectCharacterFigureTargets(state: IStageState): ICharacterFigureTarget[] {
  const targets: ICharacterFigureTarget[] = [];
  for (const target of listFigureTargets(state)) {
    const source = parseCharacterFigureSource(target.source);
    if (source) {
      targets.push({ key: target.key, position: target.position, source });
    }
  }
  return targets;
}
