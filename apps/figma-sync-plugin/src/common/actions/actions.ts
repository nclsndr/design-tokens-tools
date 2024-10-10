import {
  ActionRequest,
  ActionResponse,
} from '@common/actions/ActionDefinition';
import { UnexpectedError } from '@common/actions/ActionError';

export const GET_VARIABLES_AND_COLLECTIONS = 'GET_VARIABLES_AND_COLLECTIONS';
export type GetVariablesAndCollectionsRequest = ActionRequest<
  typeof GET_VARIABLES_AND_COLLECTIONS,
  null
>;
export type GetVariablesAndCollectionsResponse = ActionResponse<
  typeof GET_VARIABLES_AND_COLLECTIONS,
  [
    {
      variables: string[];
      collections: string[];
    },
    UnexpectedError
  ]
>;

export const SEED_TESTING_DATA = 'SEED_TESTING_DATA';
export type SeedTestingDataRequest = ActionRequest<
  typeof SEED_TESTING_DATA,
  null
>;
export type SeedTestingDataResponse = ActionResponse<
  typeof SEED_TESTING_DATA,
  [null, UnexpectedError]
>;

export type RequestAction =
  | GetVariablesAndCollectionsRequest
  | SeedTestingDataRequest;
export type ResponseAction =
  | GetVariablesAndCollectionsResponse
  | SeedTestingDataResponse;

export type ActionName = RequestAction['action'];

export type PickRequestAction<T extends ActionName> = Extract<
  RequestAction,
  { action: T }
>;
export type PickResponseAction<T extends ActionName> = Extract<
  ResponseAction,
  { action: T }
>;
