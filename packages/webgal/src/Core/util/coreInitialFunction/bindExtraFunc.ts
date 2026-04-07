import { fastForwardToSentence } from '@/Core/util/syncWithEditor/runtime/previewSyncSceneCommand';

export const bindExtraFunc = () => {
  (window as any).JMP = fastForwardToSentence;
};
