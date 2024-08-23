import {
  AliasValue,
  DesignToken,
  type JSON,
  TokenTypeName,
} from 'design-tokens-format-module';

import { Reference } from './Reference.js';
import { TokenState } from './TokenState.js';
import { JSONPath } from '../utils/JSONPath.js';
import { extractRawValuePartsFromJSON } from './internals/extractRawValuePartsFromJSON.js';
import { ReferenceResolutionTrace } from './internals/ReferenceResolutionTrace.js';
import { RawValuePart } from './RawValuePart.js';
import { Token } from '../client/Token.js';

export type TokenTypeAliasingCompatibilityMap = {
  color: 'color';
  dimension: 'dimension';
  fontFamily: 'fontFamily';
  fontWeight: 'fontWeight';
  duration: 'duration';
  cubicBezier: 'cubicBezier';
  number: 'number';
  strokeStyle: 'strokeStyle';
  'strokeStyle.dashArray.0': 'dimension';
  border: 'border';
  'border.width': 'dimension';
  'border.color': 'color';
  'border.style': 'strokeStyle';
  transition: 'transition';
  'transition.duration': 'duration';
  'transition.delay': 'duration';
  'transition.timingFunction': 'cubicBezier';
  shadow: 'shadow';
  'shadow.color': 'color';
  'shadow.offsetX': 'dimension';
  'shadow.offsetY': 'dimension';
  'shadow.blur': 'dimension';
  'shadow.spread': 'dimension';
  gradient: 'gradient';
  'gradient.0': 'gradient';
  'gradient.0.color': 'color';
  typography: 'typography';
  'typography.fontFamily': 'fontFamily';
  'typography.fontWeight': 'fontWeight';
  'typography.fontSize': 'dimension';
  'typography.letterSpacing': 'dimension';
  'typography.lineHeight': 'number';
};
export type PickTokenTypeAliasingCompatibilityEntry<T extends string> =
  T extends keyof TokenTypeAliasingCompatibilityMap
    ? TokenTypeAliasingCompatibilityMap[T]
    : never;
export type SwapValueSignature<
  Type extends string,
  Value,
> = Value extends AliasValue
  ? AliasReference<PickTokenTypeAliasingCompatibilityEntry<Type>>
  : Value extends { [k: PropertyKey]: unknown }
    ? ObjectValue<{
        [K in keyof Value]: ValueMapper<
          SwapValueSignature<
            `${Type}.${K extends string ? K : string}`,
            Value[K]
          >
        >;
      }>
    : Value extends Array<infer A>
      ? ArrayValue<Array<ValueMapper<SwapValueSignature<`${Type}.0`, A>>>>
      : Value extends JSON.Primitive
        ? ScalarValue<Value>
        : never;

export type PickSwappedValueSignature<T extends TokenTypeName> =
  Extract<Required<DesignToken>, { $type: T }> extends {
    $type: infer Type extends string;
    $value: infer Value;
  }
    ? ValueMapper<SwapValueSignature<Type, Value>>
    : never;

export class BaseValue {
  #valuePath: JSONPath;
  #tokenState: TokenState;

  constructor(valuePath: JSONPath, tokenState: TokenState) {
    this.#valuePath = valuePath;
    this.#tokenState = tokenState;
  }

  get valuePath() {
    return this.#valuePath;
  }

  protected get tokenState() {
    return this.#tokenState;
  }
}

export class ObjectValue<
  Value extends { [k: PropertyKey]: any } = { [k: PropertyKey]: any },
> extends BaseValue {
  #value: Value;

  constructor(value: Value, valuePath: JSONPath, tokenState: TokenState) {
    super(valuePath, tokenState);
    this.#value = value;
  }

  mapKey<K extends keyof Value, R>(
    key: K,
    callback: (keyValue: Value[K]) => R,
  ): ObjectValue<Omit<Value, K> & { [key in K]: R }> {
    if (key in this.#value) {
      // @ts-expect-error
      this.#value[key] = callback(this.#value[key]);
    }
    return this;
  }

  flatMap<R>(callback: (objectValue: Value) => R): R {
    return callback(this.#value);
  }

  unwrap() {
    return this.#value;
  }
}

export class ArrayValue<
  Value extends Array<any> = Array<any>,
> extends BaseValue {
  #value: Value;

  constructor(value: Value, valuePath: JSONPath, tokenState: TokenState) {
    super(valuePath, tokenState);
    this.#value = value;
  }

  mapItems<R>(
    callback: (arrayValue: Value[number], index: number) => R,
  ): ArrayValue<Array<R>> {
    // @ts-expect-error
    this.#value = this.#value.map(callback);
    return this as any;
  }

  unwrap() {
    return this.#value;
  }
}

export class ScalarValue<
  Inner extends JSON.Primitive = JSON.Primitive,
  Value extends RawValuePart<Inner> = RawValuePart<Inner>,
> extends BaseValue {
  #value: Value;

  constructor(value: Value, valuePath: JSONPath, tokenState: TokenState<any>) {
    super(valuePath, tokenState);
    this.#value = value;
  }

  get raw(): Inner {
    return this.#value.value;
  }
}

function makeResolveTraces(
  fromTreePath: JSONPath,
  resolutionTraces: Array<ReferenceResolutionTrace>,
): any {
  if (resolutionTraces.length < 1) {
    throw new Error('No resolution traces');
  }
  return resolutionTraces
    .filter((trace) => trace.fromTreePath.equalsJSONPath(fromTreePath))
    .reduce((acc, trace) => {
      const [tr, next] = makeResolveTraces(trace.toTreePath, resolutionTraces);
      acc.push(trace);
      if (tr) acc.push(tr);
      if (next) acc.push(next);
      return acc;
    }, [] as any);
}

export class AliasReference<
  Type extends TokenTypeName = TokenTypeName,
  Value = unknown,
> extends BaseValue {
  #reference: Reference;
  #value: Value = undefined as Value;

  constructor(reference: Reference, tokenState: TokenState<any>) {
    super(reference.fromValuePath, tokenState);
    this.#reference = reference;
  }

  get from() {
    return {
      treePath: this.#reference.fromTreePath,
      valuePath: this.#reference.fromValuePath,
    };
  }

  get to() {
    return {
      treePath: this.#reference.toTreePath,
    };
  }

  get toType() {
    return this.#reference.toType;
  }

  resolve() {
    return this.#reference.resolve();
  }

  mapResolvedValue<R>(
    callback: (resolvedToken: Token) => R,
  ): AliasReference<Type, R> {
    if (this.#reference.isShallowlyResolved) {
      this.tokenState.treeState.tokenStates
        .get(this.#reference.toTreePath.array)
        .match({
          Some: (tokenState) => {
            // @ts-expect-error
            this.#value = callback(new Token(tokenState));
          },
          None: () => {},
        });
    }
    return this as any;
  }

  mapUnresolvableValue<R>(
    callback: (unresolvableReference: {
      from: { treePath: JSONPath; valuePath: JSONPath };
      to: { treePath: JSONPath };
    }) => R,
  ): AliasReference<Type, R> {
    if (!this.#reference.isShallowlyResolved) {
      // @ts-expect-error
      this.#value = callback({
        from: {
          treePath: this.#reference.fromTreePath,
          valuePath: this.#reference.fromValuePath,
        },
        to: { treePath: this.#reference.toTreePath },
      });
    }
    return this as any;
  }

  mapResolved<R>(
    callback: (resolvedToken: Extract<Value, ValueMapper>) => R,
  ): AliasReference<Type, R | Exclude<Value, ValueMapper>> {
    if (this.#value instanceof ValueMapper) {
      // @ts-expect-error
      this.#value = callback(this.#value);
    }
    return this as any;
  }

  unwrap() {
    return this.#value;
  }

  override toString() {
    return `{
  from: {
    treePath: ${this.#reference.fromTreePath.toDebugString()},
    valuePath: ${this.#reference.fromValuePath.toDebugString()},
  },
  to: {
    treePath: ${this.#reference.toTreePath.toDebugString()},
  },
  isShallowlyResolved: ${this.#reference.isShallowlyResolved ? 'true' : 'false'},
  isFullyResolved: ${this.#reference.isFullyResolved ? 'true' : 'false'},
}`;
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `Reference ${this.toString()}`;
  }
}

export class ValueMapper<
  Value = AliasReference | ScalarValue | ObjectValue | ArrayValue,
> {
  #value: Value;
  #tokenState: TokenState;

  constructor(value: Value, tokenState: TokenState<any>) {
    this.#value = value;
    this.#tokenState = tokenState;
  }

  mapScalarValue<R>(
    callback: (rawValue: Extract<Value, ScalarValue>) => R,
  ): ValueMapper<R | Exclude<Value, ScalarValue>> {
    if (this.#value instanceof ScalarValue) {
      // @ts-expect-error
      this.#value = callback(this.#value);
    }
    return this as any;
  }

  mapAliasReference<T extends TokenTypeName, R>(
    callback: (reference: Extract<Value, AliasReference>) => R,
  ): ValueMapper<R | Exclude<Value, AliasReference>> {
    if (this.#value instanceof AliasReference) {
      // @ts-expect-error
      this.#value = callback(this.#value);
    }
    return this as any;
  }

  mapObjectValue<R>(
    callback: (objectValue: Extract<Value, ObjectValue<any>>) => R,
  ): ValueMapper<R | Exclude<Value, ObjectValue<any>>> {
    if (this.#value instanceof ObjectValue) {
      // @ts-expect-error
      this.#value = callback(this.#value);
    }
    return this as any;
  }

  mapArrayValue<R>(
    callback: (arrayValue: Extract<Value, ArrayValue<any>>) => R,
  ): ValueMapper<R | Exclude<Value, ArrayValue<any>>> {
    if (this.#value instanceof ArrayValue) {
      // @ts-expect-error
      this.#value = callback(this.#value);
    }
    return this as any;
  }

  unwrap() {
    return this.#value;
  }
}

export function makeValueMapper(
  entries: Array<{
    currentValuePath: JSONPath;
    data: ValueMapper<AliasReference | ScalarValue>;
  }>,
  tokenState: TokenState<any>,
) {
  if (entries.length === 0) {
    throw new Error('DESIGN ERROR :: No entries to collect');
  }
  const firstEntry = entries[0];

  // Scalar based value (color, dimension, etc.)
  if (entries.length === 1 && firstEntry.currentValuePath.length === 0) {
    return firstEntry.data;
  }

  // Non-scalar based value (object, array)
  // We use the first entry to determine if the value is array based or object based
  const isArrayBased = typeof firstEntry.currentValuePath.first === 'number';

  const accumulated = entries.reduce(
    (acc: any, en) => {
      if (en.currentValuePath.first === undefined) {
        throw new Error(`DESIGN ERROR :: No first value path`);
      }
      if (en.currentValuePath.length === 1) {
        acc[en.currentValuePath.first] = en.data;
      } else {
        acc[en.currentValuePath.first] = makeValueMapper(
          entries
            .filter(
              (e) =>
                e.currentValuePath.length > 1 &&
                e.currentValuePath.first === en.currentValuePath.first,
            )
            .map((e) => ({
              ...e,
              currentValuePath: e.currentValuePath.tail,
            })),
          tokenState,
        );
      }
      return acc;
    },
    isArrayBased ? [] : {},
  );

  return isArrayBased
    ? new ValueMapper(
        new ArrayValue(
          accumulated,
          firstEntry.currentValuePath.head,
          tokenState,
        ),
        tokenState,
      )
    : new ValueMapper(
        new ObjectValue(
          accumulated,
          firstEntry.currentValuePath.head,
          tokenState,
        ),
        tokenState,
      );
}
