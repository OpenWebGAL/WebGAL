import type { FastPreviewStopReason } from './previewSyncSceneCommand';

/**
 * `resolveStopSentenceId` 只依赖语句列表的续行占位标记。
 */
interface StopSentenceCandidate {
  isLineBreakHolder: boolean;
}

/**
 * 把停止指针从多行语句的续行占位上回退到该语句首行之后。
 *
 * 续行占位是带 -next 的注释，一次 forward 会沿着 -next 一路穿过它们，
 * 顺带把下一条真实语句也执行掉。而编辑器不论把指针落在续行的哪一行，
 * 想要的都是「执行完这条多行语句就停下」，即停在它首行之后。
 */
export function resolveStopSentenceId(sentenceList: readonly StopSentenceCandidate[], sentenceId: number): number {
  let stopSentenceId = sentenceId;
  while (stopSentenceId > 0 && sentenceList[stopSentenceId - 1]?.isLineBreakHolder) {
    stopSentenceId--;
  }

  return stopSentenceId;
}

/**
 * replay 是否停在解析后的目标停点上。
 *
 * 不能用 `currentSentenceId === payload.sentenceId`：payload 的指针可能落在多行语句的续行上，而停点已经被
 * `resolveStopSentenceId` 归一到语句首行之后。也不能用严格相等比较停点：一次 forward 会执行完整个 `-next`
 * 链，合法地越过停点。因此判定是「同场景 + 指针不早于停点」。
 */
export function didFastPreviewStopAtTarget(
  stopReason: FastPreviewStopReason,
  sceneName: string,
  sentenceId: number,
  currentSceneName: string,
  stopSentenceId: number,
): boolean {
  return stopReason === 'target-reached' && sceneName === currentSceneName && sentenceId >= stopSentenceId;
}
