import { JSONValuePath } from '../../definitions/JSONDefinitions.js';
import { TokenTypeName } from '../../definitions/tokenTypes.js';

export type ResolvedReferenceResolutionTrace = {
  status: 'resolved';
  fromTreePath: JSONValuePath;
  fromValuePath: JSONValuePath;
  toTreePath: JSONValuePath;
  targetType: TokenTypeName;
};
export type UnresolvableReferenceResolutionTrace = {
  status: 'unresolvable';
  fromTreePath: JSONValuePath;
  fromValuePath: JSONValuePath;
  toTreePath: JSONValuePath;
};
export type ReferenceResolutionTrace =
  | ResolvedReferenceResolutionTrace
  | UnresolvableReferenceResolutionTrace;
