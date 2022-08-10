import { syncFast } from '@/Core/util/syncWithEditor/syncWithOrigine';

export const bindExtraFunc = () => {
  (window as any).JMP = syncFast;
};
