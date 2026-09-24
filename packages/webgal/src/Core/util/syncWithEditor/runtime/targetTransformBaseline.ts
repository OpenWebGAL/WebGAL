import cloneDeep from 'lodash/cloneDeep';
import { STAGE_KEYS } from '@/Core/constants';
import { baseTransform, FIGURE_KEYS } from '@/Core/Modules/stage/stageInterface';
import type { IStageState, ITransform } from '@/Core/Modules/stage/stageInterface';
import type { TransformBaselineQueryResultPayload } from '@/types/editorPreviewProtocol';
import type { FastPreviewResult } from './previewSyncSceneCommand';

const FIXED_TARGETS = new Set<string>([STAGE_KEYS.STAGE_MAIN, STAGE_KEYS.BGMAIN, ...FIGURE_KEYS]);

type BaselineRevisionState =
  | {
      status: 'none';
    }
  | {
      status: 'pending';
      revision: string;
      snapshot?: TargetTransformBaselineSnapshot;
    }
  | {
      status: 'ready';
      revision: string;
      snapshot: TargetTransformBaselineSnapshot;
    }
  | {
      status: 'unavailable';
      revision: string;
    };

interface TargetTransformBaselineSnapshot {
  knownTargets: Set<string>;
  transformsByTarget: Map<string, ITransform>;
}

interface TargetTransformBaselineSyncTarget {
  sceneName: string;
  sentenceId: number;
}

interface TargetTransformBaselineManager {
  /**
   * 登记一次 `sync-scene`：编辑指针变化时失效当前 baseline，携带 token 时接受新 attempt。
   */
  applySyncSceneTarget: (target: TargetTransformBaselineSyncTarget, revision: string | undefined) => void;
  captureSnapshot: (revision: string, stageState: IStageState) => void;
  publishCapturedSnapshot: (revision: string) => boolean;
  failRevision: (revision: string) => void;
  invalidateBaselines: () => void;
  getReadyTransformBaselineOverride: (target: string) => ITransform | undefined;
  queryTransformBaseline: (target: string, revision: string) => TransformBaselineQueryResultPayload;
}

export function cloneBaseTransform(): ITransform {
  return cloneDeep(baseTransform);
}

/**
 * revision-bound sync 的 settle 成功条件：replay 精确停在目标停点上。
 *
 * 不能用 `result.sentenceId === payload.sentenceId` 判定：`payload.sentenceId` 是编辑器指针（可能落在多行
 * 语句的续行上），而 replay 的停点是 `resolveStopSentenceId` 解析后的首行之后，`-next` 链还会一次性越过它。
 * 停点判定已由 `runFastPreview` 写进 `result.stoppedAtTarget`，这里只需再用 payload 的 sceneName 确认场景。
 */
export function isTargetTransformBaselineSyncSettled(result: FastPreviewResult | null, sceneName: string): boolean {
  return result !== null && !result.isTimedOut && result.stoppedAtTarget && result.sceneName === sceneName;
}

export function createTargetTransformBaselineManager(): TargetTransformBaselineManager {
  let revisionState: BaselineRevisionState = { status: 'none' };
  let lastSyncTarget: TargetTransformBaselineSyncTarget | null = null;

  const isLatestRevision = (revision: string) => {
    return revisionState.status !== 'none' && revisionState.revision === revision;
  };

  const isPendingRevision = (revision: string) => {
    return revisionState.status === 'pending' && revisionState.revision === revision;
  };

  // 用 payload 的原始 sentenceId 比较编辑指针，不解析续行占位：同一多行语句的不同续行会被判成指针变化，
  // 方向是 fail closed（多一次失效，不会沿用错基线）。
  const isSameSyncTarget = (target: TargetTransformBaselineSyncTarget) => {
    return (
      lastSyncTarget !== null &&
      lastSyncTarget.sceneName === target.sceneName &&
      lastSyncTarget.sentenceId === target.sentenceId
    );
  };

  /**
   * 失效 baseline 的全部来源：编辑指针、token 与已发布 snapshot。
   */
  const invalidateBaselines = () => {
    lastSyncTarget = null;
    if (revisionState.status === 'none') {
      return;
    }

    revisionState = {
      status: 'unavailable',
      revision: revisionState.revision,
    };
  };

  return {
    applySyncSceneTarget(target, revision) {
      // snapshot 与 set-effect 基线的语义边界是编辑指针，而不是「最近一次携带 token 的 sync」：
      // 同一指针上的重复 sync（保存场景、自动保存、预览刷新）重放的是同一段脚本，重放终点前的
      // 计算态与已发布 snapshot 同源，因此不失效；指针变化时旧 snapshot 已不代表目标语句前状态。
      // 前提是本次 sync 重放同一段脚本（调用方义务）：保存若带进指针之前的编辑，runtime 只按
      // (sceneName, sentenceId) 无法识别，必须由客户端在保存落地后重建 baseline。
      if (!isSameSyncTarget(target)) {
        invalidateBaselines();
      }

      lastSyncTarget = {
        sceneName: target.sceneName,
        sentenceId: target.sentenceId,
      };

      if (!revision) {
        // 当前 token 仍是 pending 就说明那次 sync 还在途中（settle 回调一定会先结算 token 再清在途标记），
        // 无 token 的本次 sync 已经让它的 snapshot 采样点不可达：不能让 token 永久停在 pending，
        // 也不能让 query 继续等到一个不会到来的结果。已 ready 的 snapshot 不受影响。
        if (revisionState.status === 'pending') {
          revisionState = {
            status: 'unavailable',
            revision: revisionState.revision,
          };
        }

        return;
      }

      revisionState = {
        status: 'pending',
        revision,
      };
    },

    captureSnapshot(revision, stageState) {
      if (!isPendingRevision(revision)) {
        return;
      }

      revisionState = {
        status: 'pending',
        revision,
        snapshot: createSnapshot(stageState),
      };
    },

    publishCapturedSnapshot(revision) {
      if (!isLatestRevision(revision)) {
        return false;
      }

      // baseline 已经由本次同 token attempt 在目标语句执行前发布：settle 时的再次 publish
      // 只是确认该 attempt 成功，不能因此判失败。
      if (revisionState.status === 'ready') {
        return true;
      }

      if (revisionState.status !== 'pending' || !revisionState.snapshot) {
        return false;
      }

      revisionState = {
        status: 'ready',
        revision,
        snapshot: revisionState.snapshot,
      };
      return true;
    },

    failRevision(revision) {
      if (!isLatestRevision(revision)) {
        return;
      }

      revisionState = {
        status: 'unavailable',
        revision,
      };
    },

    invalidateBaselines,

    getReadyTransformBaselineOverride(target) {
      if (revisionState.status !== 'ready') {
        return undefined;
      }

      return getSnapshotTransformOverride(revisionState.snapshot, target);
    },

    queryTransformBaseline(target, revision) {
      if (!isLatestRevision(revision)) {
        return {
          status: 'unavailable',
        };
      }

      if (revisionState.status === 'pending') {
        return {
          status: 'loading',
        };
      }

      if (revisionState.status !== 'ready') {
        return {
          status: 'unavailable',
        };
      }

      return querySnapshot(revisionState.snapshot, target);
    },
  };
}

function createSnapshot(stageState: IStageState): TargetTransformBaselineSnapshot {
  const knownTargets = new Set<string>(FIXED_TARGETS);
  stageState.freeFigure.forEach((figure) => {
    knownTargets.add(figure.key);
  });

  const transformsByTarget = new Map<string, ITransform>();
  stageState.effects.forEach((effect) => {
    if (!knownTargets.has(effect.target) || !effect.transform) {
      return;
    }

    transformsByTarget.set(effect.target, cloneDeep(effect.transform));
  });

  return {
    knownTargets,
    transformsByTarget,
  };
}

function querySnapshot(snapshot: TargetTransformBaselineSnapshot, target: string): TransformBaselineQueryResultPayload {
  const transform = getSnapshotTransformOverride(snapshot, target);
  if (transform === undefined) {
    return {
      status: 'unavailable',
    };
  }

  return {
    status: 'ready',
    transform,
  };
}

function getSnapshotTransformOverride(
  snapshot: TargetTransformBaselineSnapshot,
  target: string,
): ITransform | undefined {
  if (!snapshot.knownTargets.has(target)) {
    return undefined;
  }

  const transform = snapshot.transformsByTarget.get(target);
  return transform ? createSparseTransformOverride(transform, baseTransform) : {};
}

function createSparseTransformOverride(transform: ITransform, base: ITransform): ITransform {
  const result: ITransform = {};

  const position = createVectorOverride(transform.position, base.position);
  if (position) {
    result.position = position;
  }

  const scale = createVectorOverride(transform.scale, base.scale);
  if (scale) {
    result.scale = scale;
  }

  (Object.keys(transform) as Array<keyof ITransform>).forEach((key) => {
    if (key === 'position' || key === 'scale') {
      return;
    }

    const value = transform[key];
    if (value !== undefined && value !== base[key]) {
      (result as Record<keyof ITransform, unknown>)[key] = value;
    }
  });

  return result;
}

type TransformVector = NonNullable<ITransform['position']>;

function createVectorOverride(
  transformValue: TransformVector | undefined,
  baseValue: TransformVector | undefined,
): TransformVector | undefined {
  if (!transformValue) {
    return undefined;
  }

  const vectorOverride: TransformVector = {};
  (Object.keys(transformValue) as Array<keyof TransformVector>).forEach((nestedKey) => {
    if (transformValue[nestedKey] !== undefined && transformValue[nestedKey] !== baseValue?.[nestedKey]) {
      vectorOverride[nestedKey] = transformValue[nestedKey];
    }
  });

  return Object.keys(vectorOverride).length > 0 ? vectorOverride : undefined;
}
