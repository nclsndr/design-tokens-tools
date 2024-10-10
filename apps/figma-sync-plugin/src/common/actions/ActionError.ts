import { ActionName } from '@common/actions/actions';

export type UnexpectedError = {
  _tag: 'UnexpectedError';
  message: string;
  originalError: unknown;
};

export type TimeoutError = {
  _tag: 'TimeoutError';
  message: string;
  messageEvent: ActionName;
  messageId: string;
};

export type ActionError = UnexpectedError | TimeoutError;
