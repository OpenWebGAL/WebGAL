import { characterFigureService } from './characterFigureService';
import type { ICharacterFigureTarget } from './characterFigureSource';

export interface ICharacterFigureDelivery {
  key: string;
  sourceUrl: string;
  position: ICharacterFigureTarget['position'];
  skipAnimation: boolean;
}

export interface ICharacterFigureSourceAdapter {
  replaceFigure: (figure: ICharacterFigureDelivery) => void;
  removeFigure: (key: string, skipAnimation: boolean) => void;
  hasFigure: (key: string) => boolean;
  reportError: (message: string, error: unknown) => void;
}

interface IPendingCharacterRequest {
  epoch: number;
  sourceKey: string;
  skipAnimation: boolean;
}

export class CharacterFigureSourceSync {
  // 这里只保存运行时请求世代；可恢复来源始终以 Figure Target 为唯一事实源。
  private latestTargets = new Map<string, ICharacterFigureTarget>();
  private appliedSourceKeys = new Map<string, string>();
  private pendingRequests = new Map<string, IPendingCharacterRequest>();
  private nextEpoch = 1;

  public constructor(private readonly adapter: ICharacterFigureSourceAdapter) {}

  public sync(targets: ICharacterFigureTarget[], skipAnimation: boolean): void {
    const nextTargets = new Map(targets.map((target) => [target.key, target]));
    for (const key of this.latestTargets.keys()) {
      if (!nextTargets.has(key)) {
        this.adapter.removeFigure(key, skipAnimation);
        this.appliedSourceKeys.delete(key);
        this.pendingRequests.delete(key);
      }
    }
    this.latestTargets = nextTargets;

    for (const target of targets) {
      const sourceKey = getCharacterSourceKey(target);
      const hasAppliedFigure = this.adapter.hasFigure(target.key);
      const pendingRequest = this.pendingRequests.get(target.key);
      if (this.appliedSourceKeys.get(target.key) === sourceKey && hasAppliedFigure) {
        continue;
      }
      if (pendingRequest?.sourceKey === sourceKey) {
        pendingRequest.skipAnimation ||= skipAnimation;
        continue;
      }
      // 每次新来源请求获得单调世代；只有仍匹配最新逻辑状态的世代可以写入 Pixi 舞台。
      const request = { epoch: this.nextEpoch++, sourceKey, skipAnimation };
      this.pendingRequests.set(target.key, request);
      void characterFigureService
        .prepare(target.source)
        .then((sourceUrl) => this.applyPreparedFigure(target, request, sourceUrl))
        .catch((error) => {
          const isLatestRequest = this.pendingRequests.get(target.key)?.epoch === request.epoch;
          if (isLatestRequest) {
            this.pendingRequests.delete(target.key);
            this.adapter.reportError(`角色 ${target.source.name} 的组合图片准备失败`, error);
          }
        });
    }
  }

  private applyPreparedFigure(target: ICharacterFigureTarget, request: IPendingCharacterRequest, sourceUrl: string) {
    const latest = this.latestTargets.get(target.key);
    if (
      !latest ||
      getCharacterSourceKey(latest) !== request.sourceKey ||
      this.pendingRequests.get(target.key)?.epoch !== request.epoch
    ) {
      return;
    }
    this.adapter.replaceFigure({
      key: target.key,
      sourceUrl,
      position: target.position,
      skipAnimation: request.skipAnimation,
    });
    this.appliedSourceKeys.set(target.key, request.sourceKey);
    this.pendingRequests.delete(target.key);
  }
}

function getCharacterSourceKey(target: ICharacterFigureTarget): string {
  return JSON.stringify([target.source.name, target.source.items, target.position]);
}
