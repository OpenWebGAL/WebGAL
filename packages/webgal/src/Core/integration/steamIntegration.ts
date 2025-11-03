import { logger } from '@/Core/util/logger';

interface SteamBridge {
  initialize: (appId: string) => boolean | Promise<boolean>;
  unlockAchievement: (achievementId: string) => boolean | Promise<boolean>;
}

const isWindowAvailable = (): boolean => typeof window !== 'undefined';

/**
 * Provides a thin bridge between the renderer process and the Electron Steam integration.
 */
export class SteamIntegration {
  public appId: string | null = null;
  private initialized = false;

  public get isInitialized(): boolean {
    return this.initialized;
  }

  public async initialize(appId: string): Promise<boolean> {
    this.appId = appId;
    const bridge = this.getSteamBridge();
    if (!bridge?.initialize) {
      logger.warn('Steam integration initialize call skipped: Electron bridge not present');
      this.initialized = false;
      return false;
    }

    try {
      const result = await Promise.resolve(bridge.initialize(appId));
      if (result) {
        logger.info(`Steam integration initialized with AppID ${appId}`);
      }
      this.initialized = result;
      return result;
    } catch (error) {
      logger.error('Steam integration failed to initialize', error);
      this.initialized = false;
      return false;
    }
  }

  public async unlockAchievement(achievementId: string): Promise<boolean> {
    const bridge = this.getSteamBridge();
    if (!bridge?.unlockAchievement) {
      logger.warn(`Steam integration unlock call skipped for ${achievementId}: Electron bridge not present`);
      return false;
    }

    if (!this.initialized) {
      if (this.appId) {
        await this.initialize(this.appId);
      } else {
        logger.warn('Steam integration unlock call skipped: AppID not set');
        return false;
      }
    }

    try {
      const result = await Promise.resolve(bridge.unlockAchievement(achievementId));
      return result;
    } catch (error) {
      logger.error(`Steam integration failed to unlock achievement ${achievementId}`, error);
      return false;
    }
  }

  private getSteamBridge(): SteamBridge | undefined {
    if (!isWindowAvailable()) {
      logger.debug('Steam integration unavailable: window is undefined');
      return undefined;
    }
    return window.electronFuncs?.steam;
  }
}
