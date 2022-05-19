import {syncFast} from "@/Core/util/syncWithOrigine";

export const bindExtraFunc = () => {
  (window as any).JMP = syncFast;
};
