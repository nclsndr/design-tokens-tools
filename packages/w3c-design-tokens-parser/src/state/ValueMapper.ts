import {
  AliasValue,
  DesignToken,
  type JSON,
  TokenTypeName,
} from 'design-tokens-format-module';

import { Reference } from './Reference.js';
import { TokenState } from './TokenState.js';
import { JSONPath } from '../utils/JSONPath.js';
import { RawValuePart } from './RawValuePart.js';
import { Token } from '../client/Token.js';
import { Option } from '@swan-io/boxed';

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
  Key extends string,
  Value,
> = Value extends AliasValue
  ? AliasReference<PickTokenTypeAliasingCompatibilityEntry<Key>>
  : Value extends { [k: PropertyKey]: unknown }
    ? ObjectValue<{
        [K in keyof Value]: ValueMapper<
          SwapValueSignature<
            `${Key}.${K extends string ? K : string}`,
            Value[K]
          >
        >;
      }>
    : Value extends Array<infer A>
      ? ArrayValue<Array<ValueMapper<SwapValueSignature<`${Key}.0`, A>>>>
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

  /**
   * Get the value path
   */
  get valuePath() {
    return this.#valuePath;
  }

  /**
   * Get the related token state
   * @protected
   */
  protected get _tokenState() {
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

  /**
   * Get the raw scalar value
   */
  get raw(): Inner {
    return this.#value.value;
  }
}

export class AliasReference<
  Type extends TokenTypeName = TokenTypeName,
  Value = AliasValue,
> extends BaseValue {
  #reference: Reference;
  #value: Value;

  constructor(reference: Reference, tokenState: TokenState<any>) {
    super(reference.fromValuePath, tokenState);
    this.#reference = reference;
    this.#value = reference.toTreePath.toDesignTokenAliasPath() as Value;
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

  getToken<T extends Type>(): Token<T> | undefined {
    return this._tokenState.treeState.tokenStates
      .get(this.#reference.toTreePath)
      .match({
        Some: (tokenState) => new Token(tokenState),
        None: () => undefined,
      }) as any;
  }

  // resolve(options?: { resolveAtDepth?: number }): any {
  //   const { resolveAtDepth } = options ?? {};
  //   if (typeof resolveAtDepth === 'number' && resolveAtDepth < 1) {
  //     throw new Error('Depth must be greater or equal to 1');
  //   }
  //
  //   const { raws, refs } = this.#reference.resolve(resolveAtDepth ?? Infinity);
  //
  //   const scalarValues: Array<ScalarValue> = raws.map(
  //     (r) => new ScalarValue(r, r.path, this._tokenState),
  //   );
  //   const aliasReferences: Array<AliasReference> = refs.map(
  //     (r) => new AliasReference(r, this._tokenState),
  //   );
  //
  //   const mergedValues = [...aliasReferences, ...scalarValues];
  //
  //   return makeValueMapper(
  //     mergedValues.map((v) => ({
  //       currentValuePath: v.valuePath,
  //       data: new ValueMapper(v, this._tokenState),
  //     })),
  //     this._tokenState,
  //   ) as any;
  // }

  /**
   * Map against the value of the alias reference.
   * @param callback
   */
  map<R>(callback: (value: Value) => R): AliasReference<Type, R> {
    // @ts-expect-error
    this.#value = callback(this.#value);
    return this as any;
  }

  /**
   * Map against the shallowly linked value of the alias reference.
   * @param callback
   */
  mapShallowlyLinkedValue<T extends Type, R>(
    callback: (resolvedToken: Token<T>) => R,
  ): AliasReference<Type, R | Value> {
    if (this.#reference.isShallowlyLinked) {
      this._tokenState.treeState.tokenStates
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

  /**
   * Map against the deeply linked value of the alias reference.
   * @param callback
   */
  mapDeeplyLinkedToken<T extends Type, R>(
    callback: (resolvedToken: Token<T>) => R,
  ): AliasReference<Type, R | Value> {
    if (this.#reference.isFullyLinked) {
      this._tokenState.treeState.tokenStates
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

  /**
   * Map against the shallowly unlinked value of the alias reference.
   * @param callback
   */
  mapShallowlyUnlinkedReference<R>(
    callback: (unresolvableReference: AliasReference<Type, Value>) => R,
  ): AliasReference<Type, R | Value> {
    if (!this.#reference.isShallowlyLinked) {
      // @ts-expect-error
      this.#value = callback(this);
    }
    return this as any;
  }

  /**
   * Map against the deeply unlinked value of the alias reference.
   * @param callback
   */
  mapDeeplyUnlinkedReference<R>(
    callback: (unresolvableReference: AliasReference<Type, Value>) => R,
  ): AliasReference<Type, R | Value> {
    if (!this.#reference.isFullyLinked) {
      // @ts-expect-error
      this.#value = callback(this);
    }
    return this as any;
  }

  /**
   * Unwrap the current value.
   */
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
  isShallowlyResolved: ${this.#reference.isShallowlyLinked ? 'true' : 'false'},
  isFullyResolved: ${this.#reference.isFullyLinked ? 'true' : 'false'},
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

  /**
   * Map against the scalar value of the token.
   * @param callback
   */
  mapScalarValue<R>(
    callback: (rawValue: Extract<Value, ScalarValue>) => R,
  ): ValueMapper<R | Exclude<Value, ScalarValue>> {
    if (this.#value instanceof ScalarValue) {
      // @ts-expect-error
      this.#value = callback(this.#value);
    }
    return this as any;
  }

  /**
   * Map against the alias reference of the token.
   * @param callback
   */
  mapAliasReference<R>(
    callback: (reference: Extract<Value, AliasReference>) => R,
  ): ValueMapper<R | Exclude<Value, AliasReference>> {
    if (this.#value instanceof AliasReference) {
      // @ts-expect-error
      this.#value = callback(this.#value);
    }
    return this as any;
  }

  /**
   * Map against the object-based value of the token.
   * @param callback
   */
  mapObjectValue<R>(
    callback: (objectValue: Extract<Value, ObjectValue<any>>) => R,
  ): ValueMapper<R | Exclude<Value, ObjectValue<any>>> {
    if (this.#value instanceof ObjectValue) {
      // @ts-expect-error
      this.#value = callback(this.#value);
    }
    return this as any;
  }

  /**
   * Map against the array-based value of the token.
   * @param callback
   */
  mapArrayValue<R>(
    callback: (arrayValue: Extract<Value, ArrayValue<any>>) => R,
  ): ValueMapper<R | Exclude<Value, ArrayValue<any>>> {
    if (this.#value instanceof ArrayValue) {
      // @ts-expect-error
      this.#value = callback(this.#value);
    }
    return this as any;
  }

  /**
   * Unwrap the current value.
   * To be called at the end of the chain.
   */
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
