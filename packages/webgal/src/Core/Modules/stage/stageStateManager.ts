import cloneDeep from 'lodash/cloneDeep';
import { isUndefined, omitBy } from 'lodash';
import { commandType } from '@/Core/controller/scene/sceneInterface';
import { STAGE_KEYS } from '@/Core/constants';
import { baseBlinkParam, baseFocusParam } from '@/Core/live2DCore';
import {
  baseTransform,
  IEffect,
  IFigureMetadata,
  IFreeFigure,
  ILive2DBlink,
  ILive2DExpression,
  ILive2DFocus,
  ILive2DMotion,
  IRunPerform,
  ISetGameVar,
  IStageState,
  IUpdateAnimationSettingPayload,
} from '@/Core/Modules/stage/stageInterface';

type StageStateListener = (stageState: IStageState) => void;
export interface IStageCommitOptions {
  syncPixiStage?: boolean;
  applyPixiEffects?: boolean;
  notifyReact?: boolean;
}

export interface IResolvedStageCommitOptions {
  syncPixiStage: boolean;
  applyPixiEffects: boolean;
  notifyReact: boolean;
}

type StageCommitHandler = (stageState: IStageState, options: IResolvedStageCommitOptions) => void;

export const initState: IStageState = {
  oldBgName: '',
  bgName: '',
  figName: '',
  figNameLeft: '',
  figNameRight: '',
  freeFigure: [],
  figureAssociatedAnimation: [],
  isRead: false,
  showText: '',
  showTextSize: -1,
  showName: '',
  command: '',
  choose: [],
  vocal: '',
  playVocal: '',
  vocalVolume: 100,
  bgm: {
    src: '',
    enter: 0,
    volume: 100,
  },
  uiSe: '',
  miniAvatar: '',
  GameVar: {},
  effects: [
    {
      target: 'stage-main',
      transform: baseTransform,
    },
  ],
  animationSettings: [],
  bgFilter: '',
  bgTransform: '',
  PerformList: [],
  currentDialogKey: 'initial',
  live2dMotion: [],
  live2dExpression: [],
  live2dBlink: [],
  live2dFocus: [],
  currentConcatDialogPrev: '',
  enableFilm: '',
  isDisableTextbox: false,
  replacedUIlable: {},
  figureMetaData: {},
};

/**
 * WebGAL 5 stage state machine.
 *
 * calculationStageState is mutated by script execution during forward.
 * viewStageState is the committed state observed by React/Pixi/audio views.
 */
export class StageStateManager {
  private calculationStageState: IStageState = cloneDeep(initState);
  private viewStageState: IStageState = cloneDeep(initState);
  private listeners = new Set<StageStateListener>();
  private commitHandler: StageCommitHandler | null = null;

  public getCalculationStageState(): IStageState {
    return this.calculationStageState;
  }

  public getViewStageState(): IStageState {
    return this.viewStageState;
  }

  public setStage<K extends keyof IStageState>(key: K, value: IStageState[K]) {
    this.calculationStageState[key] = value;
  }

  public setStageAndCommit<K extends keyof IStageState>(key: K, value: IStageState[K]) {
    this.setStage(key, value);
    this.commit();
  }

  public setStageVar(payload: ISetGameVar) {
    this.calculationStageState.GameVar[payload.key] = payload.value;
  }

  public setStageVarAndCommit(payload: ISetGameVar) {
    this.setStageVar(payload);
    this.commit();
  }

  public replaceCalculationStageState(stageState: IStageState) {
    this.calculationStageState = cloneDeep(stageState);
  }

  public replaceAllStageState(stageState: IStageState) {
    this.calculationStageState = cloneDeep(stageState);
    this.commit();
  }

  public resetCalculationStageState(stageState: IStageState) {
    this.replaceCalculationStageState(stageState);
  }

  public resetAllStageState(stageState: IStageState) {
    this.replaceAllStageState(stageState);
  }

  public updateEffect(payload: IEffect) {
    const { target, transform } = payload;
    const state = this.calculationStageState;
    const activeTargets = [
      STAGE_KEYS.STAGE_MAIN,
      STAGE_KEYS.BGMAIN,
      STAGE_KEYS.FIG_C,
      STAGE_KEYS.FIG_L,
      STAGE_KEYS.FIG_R,
      ...state.freeFigure.map((figure) => figure.key),
    ];
    if (!activeTargets.includes(target)) return;

    const effectIndex = state.effects.findIndex((e) => e.target === target);
    if (effectIndex >= 0) {
      if (!state.effects[effectIndex].transform) {
        state.effects[effectIndex].transform = transform;
      } else if (transform) {
        const targetScale = state.effects[effectIndex].transform!.scale || {};
        const targetPosition = state.effects[effectIndex].transform!.position || {};
        if (transform.scale) Object.assign(targetScale, omitBy(transform.scale, isUndefined));
        if (transform.position) Object.assign(targetPosition, omitBy(transform.position, isUndefined));
        Object.assign(state.effects[effectIndex].transform!, omitBy(transform, isUndefined));
        state.effects[effectIndex].transform!.scale = targetScale;
        state.effects[effectIndex].transform!.position = targetPosition;
      }
    } else {
      state.effects.push({
        target,
        transform: transform ? { ...baseTransform, ...transform } : { ...baseTransform },
      });
    }
  }

  public updateEffectAndCommit(payload: IEffect) {
    this.updateEffect(payload);
    this.commit();
  }

  public removeEffectByTargetId(target: string) {
    const index = this.calculationStageState.effects.findIndex((e) => e.target === target);
    if (index >= 0) {
      this.calculationStageState.effects.splice(index, 1);
    }
  }

  public updateAnimationSettings(payload: IUpdateAnimationSettingPayload) {
    const { target, key, value } = payload;
    const state = this.calculationStageState;
    const animationIndex = state.animationSettings.findIndex((a) => a.target === target);
    if (animationIndex >= 0) {
      state.animationSettings[animationIndex] = {
        ...state.animationSettings[animationIndex],
        [key]: value,
      };
    } else {
      state.animationSettings.push({
        target,
        [key]: value,
      });
    }
  }

  public removeAnimationSettingsByTarget(target: string) {
    const state = this.calculationStageState;
    const index = state.animationSettings.findIndex((a) => a.target === target);
    if (index >= 0) {
      const prev = state.animationSettings[index];
      state.animationSettings.splice(index, 1);

      if (prev.exitAnimationName || prev.exitDuration !== undefined) {
        const prevTarget = `${target}-off`;
        const prevSetting = {
          ...prev,
          target: prevTarget,
        };
        const prevIndex = state.animationSettings.findIndex((a) => a.target === prevTarget);
        if (prevIndex >= 0) {
          state.animationSettings.splice(prevIndex, 1, prevSetting);
        } else {
          state.animationSettings.push(prevSetting);
        }
      }
    }
  }

  public removeAnimationSettingsByTargetOff(target: string) {
    const index = this.calculationStageState.animationSettings.findIndex((a) => a.target === target);
    if (index >= 0) {
      this.calculationStageState.animationSettings.splice(index, 1);
    }
  }

  public addPerform(performToAdd: IRunPerform) {
    const dupId = performToAdd.id;
    this.calculationStageState.PerformList = this.calculationStageState.PerformList.filter((p) => p.id !== dupId);
    this.calculationStageState.PerformList.push(performToAdd);
  }

  public removePerformByName(name: string) {
    this.calculationStageState.PerformList = this.calculationStageState.PerformList.filter(
      (performItem) => performItem.id !== name && !performItem.id.startsWith(name + '#'),
    );
  }

  public removePerformByPrefix(prefix: string) {
    this.calculationStageState.PerformList = this.calculationStageState.PerformList.filter(
      (performItem) => !performItem.id.startsWith(prefix),
    );
  }

  public removeAllPerform() {
    this.calculationStageState.PerformList.splice(0, this.calculationStageState.PerformList.length);
  }

  public removeAllPixiPerforms() {
    this.calculationStageState.PerformList = this.calculationStageState.PerformList.filter(
      (performItem) => performItem.script.command !== commandType.pixi,
    );
  }

  public setFreeFigureByKey(newFigure: IFreeFigure) {
    const state = this.calculationStageState;
    const currentFreeFigures = state.freeFigure;
    const index = currentFreeFigures.findIndex((figure) => figure.key === newFigure.key);
    if (index >= 0) {
      if (newFigure.name === '') {
        currentFreeFigures.splice(index, 1);
        const figureAssociatedAnimationIndex = state.figureAssociatedAnimation.findIndex(
          (a) => a.targetId === newFigure.key,
        );
        if (figureAssociatedAnimationIndex >= 0) {
          state.figureAssociatedAnimation.splice(figureAssociatedAnimationIndex, 1);
        }
      } else {
        currentFreeFigures[index].basePosition = newFigure.basePosition;
        currentFreeFigures[index].name = newFigure.name;
      }
    } else if (newFigure.name !== '') {
      currentFreeFigures.push(newFigure);
    }
  }

  public setLive2dMotion(payload: ILive2DMotion) {
    const { target, motion, skin, overrideBounds } = payload;
    const index = this.calculationStageState.live2dMotion.findIndex((e) => e.target === target);
    if (index < 0) {
      this.calculationStageState.live2dMotion.push({ target, motion, skin, overrideBounds });
    } else {
      this.calculationStageState.live2dMotion[index].motion = motion;
      this.calculationStageState.live2dMotion[index].skin = skin;
      this.calculationStageState.live2dMotion[index].overrideBounds = overrideBounds;
    }
  }

  public setLive2dExpression(payload: ILive2DExpression) {
    const { target, expression } = payload;
    const index = this.calculationStageState.live2dExpression.findIndex((e) => e.target === target);
    if (index < 0) {
      this.calculationStageState.live2dExpression.push({ target, expression });
    } else {
      this.calculationStageState.live2dExpression[index].expression = expression;
    }
  }

  public setLive2dBlink(payload: ILive2DBlink) {
    const { target, blink } = payload;
    const index = this.calculationStageState.live2dBlink.findIndex((e) => e.target === target);
    if (index < 0) {
      this.calculationStageState.live2dBlink.push({ target, blink: { ...baseBlinkParam, ...blink } });
    } else {
      this.calculationStageState.live2dBlink[index].blink = {
        ...this.calculationStageState.live2dBlink[index].blink,
        ...blink,
      };
    }
  }

  public setLive2dFocus(payload: ILive2DFocus) {
    const { target, focus } = payload;
    const index = this.calculationStageState.live2dFocus.findIndex((e) => e.target === target);
    if (index < 0) {
      this.calculationStageState.live2dFocus.push({ target, focus: { ...baseFocusParam, ...focus } });
    } else {
      this.calculationStageState.live2dFocus[index].focus = {
        ...this.calculationStageState.live2dFocus[index].focus,
        ...focus,
      };
    }
  }

  public replaceUIlable(payload: [string, string]) {
    this.calculationStageState.replacedUIlable[payload[0]] = payload[1];
  }

  public setFigureMetaData(payload: [string, keyof IFigureMetadata, any, undefined | boolean]) {
    if (payload[3]) {
      if (this.calculationStageState.figureMetaData[payload[0]]) {
        delete this.calculationStageState.figureMetaData[payload[0]];
      }
    } else {
      if (!this.calculationStageState.figureMetaData[payload[0]]) {
        this.calculationStageState.figureMetaData[payload[0]] = {};
      }
      this.calculationStageState.figureMetaData[payload[0]][payload[1]] = payload[2];
    }
  }

  public clearUncommittedNonHoldPerforms() {
    this.calculationStageState.PerformList = this.calculationStageState.PerformList.filter((perform) => perform.isHoldOn);
  }

  public removeNonHoldPerformsAndCommit() {
    this.clearUncommittedNonHoldPerforms();
    this.commit();
  }

  public commit(options: IStageCommitOptions = {}) {
    const resolvedOptions: IResolvedStageCommitOptions = {
      syncPixiStage: options.syncPixiStage ?? true,
      applyPixiEffects: options.applyPixiEffects ?? true,
      notifyReact: options.notifyReact ?? true,
    };
    this.viewStageState = cloneDeep(this.calculationStageState);
    this.commitHandler?.(this.viewStageState, resolvedOptions);
    if (resolvedOptions.notifyReact) {
      this.notify();
    }
  }

  public applyCommittedPixiEffects() {
    this.commitHandler?.(this.viewStageState, {
      syncPixiStage: false,
      applyPixiEffects: true,
      notifyReact: false,
    });
  }

  public setCommitHandler(handler: StageCommitHandler | null) {
    this.commitHandler = handler;
  }

  public subscribe(listener: StageStateListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const stageState = this.viewStageState;
    this.listeners.forEach((listener) => listener(stageState));
  }
}

export const stageStateManager = new StageStateManager();
