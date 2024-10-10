import { makeUniqueId } from '@nclsndr/design-tokens-utils';
import {
  ActionName,
  PickRequestAction,
  PickResponseAction,
  RequestAction,
  ResponseAction,
} from '@common/actions/actions';

export function makeAction<AN extends ActionName>(actionName: AN) {
  return function (
    reqPayload: PickRequestAction<AN>['payload'],
    callback: (resPayload: PickResponseAction<AN>['payload']) => void
  ) {
    const reqMessage: RequestAction = {
      id: makeUniqueId(),
      action: actionName,
      payload: reqPayload,
    };
    parent.postMessage(
      {
        pluginMessage: reqMessage,
      },
      '*'
    );
    const listener = (
      action: MessageEvent<{ pluginMessage: ResponseAction }>
    ) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('message', listener);
      }, 2000);
      if (
        action.data.pluginMessage.action === reqMessage.action &&
        action.data.pluginMessage.id === reqMessage.id
      ) {
        callback(action.data.pluginMessage.payload as any);
        clearTimeout(timeout);
        window.removeEventListener('message', listener);
      }
    };
    window.addEventListener('message', listener);
  };
}
