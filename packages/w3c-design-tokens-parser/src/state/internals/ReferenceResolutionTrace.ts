import { TokenTypeName, type JSON } from 'design-tokens-format-module';
import { JSONPath } from '../../utils/JSONPath.js';

export type ResolvedReferenceResolutionTrace = {
  status: 'resolved';
  fromTreePath: JSONPath;
  fromValuePath: JSONPath;
  toTreePath: JSONPath;
  targetType: TokenTypeName;
};
export type UnresolvableReferenceResolutionTrace = {
  status: 'unresolvable';
  fromTreePath: JSONPath;
  fromValuePath: JSONPath;
  toTreePath: JSONPath;
};
export type ReferenceResolutionTrace =
  | ResolvedReferenceResolutionTrace
  | UnresolvableReferenceResolutionTrace;
