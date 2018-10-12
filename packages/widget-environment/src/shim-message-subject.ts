import { Subject, Observable, Observer, fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ShimMessage, SHIM_MESSAGE_TYPE } from './shim-message';

export function createShimMessageSubject(win: Window) : Subject<ShimMessage> {
  const messageEventObservable: Observable<MessageEvent> = 
    fromEvent<MessageEvent>(win, 'message');
  const postMessageObservable: Observable<ShimMessage> = 
      messageEventObservable.pipe(
        filter(event => {
            if (!event.data ||
              !Object.values(SHIM_MESSAGE_TYPE).includes(event.data.type)) {
            return false;
          }
          console.log('(I) outer -> inner ', event.data);
          return true;
        }),
        map(event => event.data as ShimMessage));

  const postMessageObserver: Observer<ShimMessage> = {
    next(message: ShimMessage) {
      console.log('(I) inner -> outer ', message);
      win.top.postMessage(message, '*');
    },
    error() {},
    complete() {},
  };

  return Subject.create(postMessageObserver, postMessageObservable);
}
