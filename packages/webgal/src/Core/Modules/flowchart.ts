import { SceneManager } from '@/Core/Modules/scene';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { ISaveData } from '@/store/userDataInterface';
import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import localforage from 'localforage';

export interface IFlowchartNodeData extends Record<string, unknown> {
  label: string;
  sceneName: string;
  isRoot?: boolean;
}

export interface IFlowchartNode {
  id: string;
  position: { x: number; y: number };
  data: IFlowchartNodeData;
  type?: 'root' | 'chapter' | 'branch' | 'ending' | 'event' | string;
}

export interface IFlowchartEdge {
  id: string;
  source: string;
  target: string;
}

export interface IFlowchart {
  id: string;
  name: string;
  type?: 'main' | 'character';
  nodes: IFlowchartNode[];
  edges: IFlowchartEdge[];
}

export interface IFlowchartData {
  flowcharts: IFlowchart[];
}

const FLOWCHART_UPDATED_EVENT = 'webgal-flowchart-updated';

export class FlowchartManager {
  public enabled = false;
  private gameKey = '';
  private data: IFlowchartData = { flowcharts: [] };
  private unlocked = new Set<string>();
  private snapshots = new Map<string, ISaveData>();
  private pendingUnlockCurrentScene = false;
  private waitingUnlockSceneKey = '';

  public constructor(private readonly sceneManager: SceneManager) {}

  public async init(gameKey: string, enabled: boolean) {
    this.gameKey = gameKey;
    this.enabled = enabled;
    this.data = { flowcharts: [] };
    this.unlocked.clear();
    this.snapshots.clear();
    if (!enabled || !gameKey) return;
    try {
      const res = await axios.get('./game/flowchart.json');
      this.data = normalizeFlowchartData(res.data);
      const unlocked = await localforage.getItem<string[]>(this.progressKey());
      this.unlocked = new Set(Array.isArray(unlocked) ? unlocked : []);
      this.unlockPendingCurrentScene();
    } catch {
      this.data = { flowcharts: [] };
    }
  }

  public hasFlowchart() {
    return this.enabled && this.data.flowcharts.length > 0;
  }

  public getFlowcharts() {
    return this.data.flowcharts;
  }

  public getEventName() {
    return FLOWCHART_UPDATED_EVENT;
  }

  public isUnlocked(flowchartId: string, nodeId: string) {
    return this.unlocked.has(this.nodeKey(flowchartId, nodeId));
  }

  public requestUnlockCurrentScene() {
    if (this.currentSceneKey() !== this.waitingUnlockSceneKey) return;
    this.pendingUnlockCurrentScene = true;
  }

  public unlockPendingCurrentScene() {
    if (!this.pendingUnlockCurrentScene || !this.hasFlowchart()) return;
    this.pendingUnlockCurrentScene = false;
    this.waitingUnlockSceneKey = '';
    this.unlockCurrentScene(true);
  }

  public waitForCurrentSceneDialog() {
    this.pendingUnlockCurrentScene = false;
    this.waitingUnlockSceneKey = this.currentSceneKey();
  }

  public async loadSnapshot(flowchartId: string, nodeId: string) {
    const key = this.nodeKey(flowchartId, nodeId);
    if (!this.unlocked.has(key)) return null;
    const cached = this.snapshots.get(key);
    if (cached) return cached;
    return await localforage.getItem<ISaveData>(this.snapshotKey(flowchartId, nodeId));
  }

  public async clearProgress() {
    const keys = [...this.unlocked];
    this.unlocked.clear();
    this.snapshots.clear();
    await Promise.all(keys.map((key) => localforage.removeItem(this.snapshotKeyByNodeKey(key))));
    await localforage.removeItem(this.progressKey());
    window.dispatchEvent(new Event(FLOWCHART_UPDATED_EVENT));
  }

  public unlockCurrentScene(refreshSnapshot = false) {
    if (!this.hasFlowchart()) return;
    const sceneNames = new Set([
      normalizeSceneName(this.sceneManager.sceneData.currentScene.sceneName),
      normalizeSceneName(this.sceneManager.sceneData.currentScene.sceneUrl),
    ]);
    const matched = this.data.flowcharts.flatMap((flowchart) =>
      flowchart.nodes
        .filter((node) => sceneNames.has(normalizeSceneName(node.data?.sceneName)))
        .map((node) => ({ flowchart, node })),
    );
    if (matched.length === 0) return;
    const snapshot = this.createSnapshot();
    let changed = false;
    matched.forEach(({ flowchart, node }) => {
      const key = this.nodeKey(flowchart.id, node.id);
      const isUnlocked = this.unlocked.has(key);
      if (isUnlocked && !refreshSnapshot) return;
      if (!isUnlocked) {
        changed = true;
        this.unlocked.add(key);
      }
      this.snapshots.set(key, snapshot);
      localforage.setItem(this.snapshotKey(flowchart.id, node.id), snapshot);
    });
    if (changed) {
      localforage.setItem(this.progressKey(), [...this.unlocked]);
      window.dispatchEvent(new Event(FLOWCHART_UPDATED_EVENT));
    }
  }

  private createSnapshot(): ISaveData {
    return {
      nowStageState: cloneDeep(stageStateManager.getViewStageState()),
      backlog: [],
      index: -1,
      saveTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString('chinese', { hour12: false }),
      sceneData: {
        currentSentenceId: this.sceneManager.sceneData.currentSentenceId,
        sceneStack: cloneDeep(this.sceneManager.sceneData.sceneStack),
        sceneName: this.sceneManager.sceneData.currentScene.sceneName,
        sceneUrl: this.sceneManager.sceneData.currentScene.sceneUrl,
      },
      previewImage: '',
    };
  }

  private progressKey() {
    return `${this.gameKey}-flowchart`;
  }

  private snapshotKey(flowchartId: string, nodeId: string) {
    return `${this.gameKey}-flowchart-${flowchartId}-${nodeId}`;
  }

  private snapshotKeyByNodeKey(key: string) {
    return `${this.gameKey}-flowchart-${key}`;
  }

  private nodeKey(flowchartId: string, nodeId: string) {
    return `${flowchartId}-${nodeId}`;
  }

  private currentSceneKey() {
    const { currentScene } = this.sceneManager.sceneData;
    return `${normalizeSceneName(currentScene.sceneName)}|${normalizeSceneName(currentScene.sceneUrl)}`;
  }
}

function normalizeFlowchartData(raw: string | IFlowchartData): IFlowchartData {
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const flowcharts: IFlowchart[] = Array.isArray(data?.flowcharts) ? data.flowcharts : [];
  return {
    flowcharts: flowcharts.map((flowchart) => ({
      ...flowchart,
      type: flowchart.id === 'main' ? 'main' : flowchart.type || 'character',
      nodes: Array.isArray(flowchart.nodes) ? flowchart.nodes : [],
      edges: Array.isArray(flowchart.edges) ? flowchart.edges : [],
    })),
  };
}

function normalizeSceneName(sceneName = '') {
  return decodeURI(sceneName)
    .replace(/\\/g, '/')
    .replace(/^\.?\/?game\/scene\//, '')
    .replace(/^\.?\//, '');
}
