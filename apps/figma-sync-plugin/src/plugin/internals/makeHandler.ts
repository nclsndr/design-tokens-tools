import {
  ActionName,
  PickRequestAction,
  PickResponseAction,
  ResponseAction,
} from '@common/actions/actions';

export function makeHandler<AN extends ActionName>(
  actionName: AN,
  handler: (
    payload: PickRequestAction<AN>['payload']
  ) => Promise<PickResponseAction<AN>['payload']>
) {
  return async function handleAction(action: PickRequestAction<AN>) {
    try {
      const response: {
        id: string;
        action: AN;
        payload: PickResponseAction<AN>['payload'];
      } = {
        id: action.id,
        action: actionName,
        payload: await handler(action.payload),
      };
      figma.ui.postMessage(response);
    } catch (error) {
      console.error(error);
      const response: ResponseAction = {
        id: action.id,
        action: actionName,
        payload: [
          undefined,
          {
            _tag: 'UnexpectedError',
            message: (error as any).message,
            originalError: error,
          },
        ],
      };
      figma.ui.postMessage(response);
    }
  };
}
