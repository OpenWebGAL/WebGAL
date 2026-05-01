import mitt from 'mitt';

interface IWebgalEvent<T> {
  on: (callback: (message?: T) => void, id?: string) => void;
  off: (callback: (message?: T) => void, id?: string) => void;
  emit: (message?: T, id?: string) => void;
}

export class Events {
  public textSettle = formEvent('text-settle');
  public userInteractNext = formEvent('__NEXT');
  public fullscreenDbClick = formEvent('fullscreen-dbclick');
  public styleUpdate = formEvent('style-update');
  public afterStyleUpdate = formEvent('after-style-update');
}

const eventBus = mitt();

function formEvent<T>(eventName: string): IWebgalEvent<T> {
  return {
    on: (callback, id?) => {
      // @ts-ignore
      eventBus.on(`${eventName}-${id ?? ''}`, callback);
    },
    emit: (message?, id?) => {
      eventBus.emit(`${eventName}-${id ?? ''}`, message);
    },
    off: (callback, id?) => {
      // @ts-ignore
      eventBus.off(`${eventName}-${id ?? ''}`, callback);
    },
  };
}
