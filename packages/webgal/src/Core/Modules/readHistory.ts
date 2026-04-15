/**
 * 已读历史记录
 */

import { webgalStore } from "@/store/store";
import { SceneManager } from "./scene";
import { setReadHistory } from "@/store/userDataReducer";
import { setStage } from "@/store/stageReducer";
import { setStorage } from "../controller/storage/storageController";

export class ReadHistoryManager {
  private history: Map<string, Uint8Array> = new Map();

  private load: boolean = false;

  private readonly sceneManager: SceneManager;

  public constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
  }

  private loadReadHistory() {
    const readHistory = webgalStore.getState().userData.readHistory;

    Object.entries(readHistory).forEach(([key, value]) => {
      try {
        const uint8 = Uint8Array.from(Buffer.from(value, 'base64'));
        this.history.set(key, uint8);
      } catch {
        // 浏览器环境下没有 Buffer 时的兜底逻辑
        const binary = atob(value);
        const uint8 = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          uint8[i] = binary.charCodeAt(i);
        }
        console.log('Camille Load', uint8);
        this.history.set(key, uint8);
      }
    });

    this.load = true;
  }

  private checkLoad() {
    if (!this.load) {
      this.loadReadHistory();
    }
  }

  private saveReadHistory(key: string) {
    const bitset = this.history.get(key)!;

    try {
      const base64 = Buffer.from(bitset).toString('base64');
      webgalStore.dispatch(setReadHistory({
        key,
        value: base64,
      }));
    } catch {
      // 浏览器环境下没有 Buffer 时的兜底逻辑
      const base64 = btoa(String.fromCharCode(...bitset));
      webgalStore.dispatch(setReadHistory({
        key,
        value: base64,
      }));
    }
    setStorage();
  }

  private addReadHistory() {
    const scenarioName = this.sceneManager.sceneData.currentScene.sceneName;
    const index = this.sceneManager.sceneData.currentSentenceId;

    if (!this.history.has(scenarioName)) {
      const length = this.sceneManager.sceneData.currentScene.sentenceList.length;
      this.history.set(scenarioName, new Uint8Array(Math.ceil(length / 8)));
    }
    const bitset = this.history.get(scenarioName)!;
    bitset[index >> 3] |= (1 << (index & 7));

    this.saveReadHistory(scenarioName);
  }

  public checkIsReaded() {
    this.checkLoad();

    const scenarioName = this.sceneManager.sceneData.currentScene.sceneName;
    const index = this.sceneManager.sceneData.currentSentenceId;

    let isReaded = false;
    if (this.history.has(scenarioName)) {
      const bitset = this.history.get(scenarioName)!;
      isReaded = (bitset[index >> 3] & (1 << (index & 7))) !== 0;
    }
    webgalStore.dispatch(setStage({
      key: 'isRead',
      value: isReaded,
    }));
    if (!isReaded) {
      this.addReadHistory();
    }
  }
}
