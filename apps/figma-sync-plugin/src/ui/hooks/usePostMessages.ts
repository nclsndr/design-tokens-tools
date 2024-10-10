import {
  GET_VARIABLES_AND_COLLECTIONS,
  SEED_TESTING_DATA,
} from '@common/actions/actions';
import { makeAction } from '@ui/utils/makeAction';

export function usePostMessages() {
  return {
    getVariablesAndCollections: makeAction(GET_VARIABLES_AND_COLLECTIONS),
    seedTestingData: makeAction(SEED_TESTING_DATA),
  };
}
