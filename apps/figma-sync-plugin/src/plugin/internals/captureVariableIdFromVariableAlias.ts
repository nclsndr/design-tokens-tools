import { Option } from '@swan-io/boxed';
import { isFigmaVariableAlias } from '@plugin/internals/isFigmaVariableAlias';

export function captureVariableIdFromVariableAlias(
  value: VariableValue
): Option<string> {
  if (isFigmaVariableAlias(value)) {
    return Option.Some(value.id);
  }
  return Option.None();
}
