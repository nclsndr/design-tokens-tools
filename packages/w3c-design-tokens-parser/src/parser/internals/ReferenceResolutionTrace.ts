import { TokenTypeName, type JSON } from 'design-tokens-format-module';

export type ResolvedReferenceResolutionTrace = {
  status: 'resolved';
  fromTreePath: JSON.ValuePath;
  fromValuePath: JSON.ValuePath;
  toTreePath: JSON.ValuePath;
  targetType: TokenTypeName;
};
export type UnresolvableReferenceResolutionTrace = {
  status: 'unresolvable';
  fromTreePath: JSON.ValuePath;
  fromValuePath: JSON.ValuePath;
  toTreePath: JSON.ValuePath;
};
export type ReferenceResolutionTrace =
  | ResolvedReferenceResolutionTrace
  | UnresolvableReferenceResolutionTrace;
