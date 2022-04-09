import { runtime_gamePlay } from '../../runtime/gamePlay';

export const unmountPerform = (name: string) => {
    for (let i = 0; i < runtime_gamePlay.performList.length; i++) {
        const e = runtime_gamePlay.performList[i];
        if (!e.isHoldOn && e.performName === name) {
            e.stopFunction();
            clearTimeout(e.stopTimeout);
            runtime_gamePlay.performList.splice(i, 1);
            i--;
        }
    }
};
