import { TokenTypeName } from 'design-tokens-format-module';
import { JSONPath } from '../../utils/JSONPath.js';

export type LinkedReferenceResolutionTrace = {
  status: 'linked';
  fromTreePath: JSONPath;
  fromValuePath: JSONPath;
  toTreePath: JSONPath;
  targetType: TokenTypeName;
};
export type UnlinkedReferenceResolutionTrace = {
  status: 'unlinked';
  fromTreePath: JSONPath;
  fromValuePath: JSONPath;
  toTreePath: JSONPath;
};
export type ReferenceResolutionTrace =
  | LinkedReferenceResolutionTrace
  | UnlinkedReferenceResolutionTrace;
