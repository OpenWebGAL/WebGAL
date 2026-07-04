import cloneDeep from 'lodash/cloneDeep';
import { STAGE_KEYS } from '@/Core/constants';
import { baseTransform } from '@/Core/Modules/stage/stageInterface';
import type { IStageState, ITransform } from '@/Core/Modules/stage/stageInterface';
import type { TransformBaselineQueryResultPayload } from '@/types/editorPreviewProtocol';
import type { FastPreviewResult } from './previewSyncSceneCommand';

const FIXED_TARGETS = new Set<string>([
  STAGE_KEYS.STAGE_MAIN,
  STAGE_KEYS.BGMAIN,
  STAGE_KEYS.FIG_C,
  STAGE_KEYS.FIG_L,
  STAGE_KEYS.FIG_R,
]);

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
  acceptRevision: (revision: string) => void;
  captureSnapshot: (revision: string, stageState: IStageState) => void;
  publishCapturedSnapshot: (revision: string) => boolean;
  failRevision: (revision: string) => void;
  invalidateCurrentRevision: () => void;
  getReadyTransformBaselineOverride: (target: string) => ITransform | undefined;
  queryTransformBaseline: (target: string, revision: string) => TransformBaselineQueryResultPayload;
}

export function cloneBaseTransform(): ITransform {
  return cloneDeep(baseTransform);
}

export function isTargetTransformBaselineSyncSettled(
  result: FastPreviewResult | null,
  target: TargetTransformBaselineSyncTarget,
): boolean {
  return (
    result !== null &&
    !result.isTimedOut &&
    result.stopReason === 'target-reached' &&
    result.sceneName === target.sceneName &&
    result.sentenceId === target.sentenceId
  );
}

export function createTargetTransformBaselineManager(): TargetTransformBaselineManager {
  let revisionState: BaselineRevisionState = { status: 'none' };

  const isLatestRevision = (revision: string) => {
    return revisionState.status !== 'none' && revisionState.revision === revision;
  };

  const isPendingRevision = (revision: string) => {
    return revisionState.status === 'pending' && revisionState.revision === revision;
  };

  return {
    acceptRevision(revision) {
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
      if (revisionState.status !== 'pending' || revisionState.revision !== revision || !revisionState.snapshot) {
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

    invalidateCurrentRevision() {
      if (revisionState.status === 'none') {
        return;
      }

      revisionState = {
        status: 'unavailable',
        revision: revisionState.revision,
      };
    },

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

function getSnapshotTransformOverride(snapshot: TargetTransformBaselineSnapshot, target: string): ITransform | undefined {
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
