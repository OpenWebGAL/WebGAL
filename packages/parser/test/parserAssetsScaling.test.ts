import { expect, test } from 'vitest';

import { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from '../src/config/scriptConfig';
import SceneParser from '../src/index';

/**
 * 资源密集脚本：几乎每条语句都带一个资源引用（bg / figure / vocal）。
 * sceneParser 会把每条语句的资源累积到场景级 assetsList。
 */
function buildAssetDenseScene(statementCount: number): string {
  const lines: string[] = [];
  for (let index = 0; index < statementCount; index++) {
    switch (index % 3) {
      case 0: {
        lines.push(`changeBg:background-${index % 40}.webp;`);
        break;
      }
      case 1: {
        lines.push(
          `character-${index % 6}:line ${index} -vocal=voice-${index}.mp3;`,
        );
        break;
      }
      default: {
        lines.push(
          `changeFigure:figure-${index % 12}.png -id=figure-${index % 12};`,
        );
      }
    }
  }
  return lines.join('\n');
}

const SMALL_STATEMENT_COUNT = 4000;
const LARGE_STATEMENT_COUNT = SMALL_STATEMENT_COUNT * 4;
/** 语句数 ×4 时允许的最大耗时倍率，阈值刻意放宽，只用于拦截复杂度回退 */
const MAX_TIME_RATIO = 8;

function measureParseTime(source: string): number {
  const parser = new SceneParser(
    () => { },
    (fileName) => fileName,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG,
  );

  let best = Number.POSITIVE_INFINITY;
  for (let round = 0; round < 3; round++) {
    const start = performance.now();
    parser.parse(source, 'scaling', '/scaling.txt');
    best = Math.min(best, performance.now() - start);
  }
  return best;
}

test('asset accumulation stays linear in the number of asset references', () => {
  const smallSource = buildAssetDenseScene(SMALL_STATEMENT_COUNT);
  const largeSource = buildAssetDenseScene(LARGE_STATEMENT_COUNT);

  // 预热：把首次调用的编译开销排除在测量之外
  measureParseTime(smallSource);

  const smallMs = measureParseTime(smallSource);
  const largeMs = measureParseTime(largeSource);

  // 就地追加累积时，语句数 ×4 的耗时约为 4 倍；
  // 旧的全量复制实现（[...assetsList, ...sentenceAssets]）会退化成 Θ(资源数²)，
  // 同样的 4 倍规模下耗时约为 12 倍以上。
  expect(largeMs / smallMs).toBeLessThan(MAX_TIME_RATIO);
});
