import { Option } from 'effect';
import {
  AliasValue,
  DesignToken,
  type Json,
  TokenTypeName,
} from 'design-tokens-format-module';
import { indentLines, JSONPath } from '@nclsndr/design-tokens-utils';
import { PickTokenTypeAliasingCompatibilityEntry } from '@nclsndr/w3c-design-tokens-parser';

import { Reference } from './Reference.js';
import { TokenState } from './TokenState.js';

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
      : Value extends Json.Primitive
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

/**
 * Represents the object based token values
 */
export class ObjectValue<
  Value extends { [k: PropertyKey]: any } = { [k: PropertyKey]: any },
> extends BaseValue {
  #value: Value;

  constructor(value: Value, valuePath: JSONPath, tokenState: TokenState) {
    super(valuePath, tokenState);
    this.#value = value;
  }

  /**
   * Map against the value of a key within the object value.
   * @param key
   * @param callback
   */
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

  /**
   * Map the entire object value then unwrap the value.
   * @param callback
   */
  flatMap<R>(callback: (objectValue: Value) => R): R {
    return callback(this.#value);
  }

  /**
   * Unwrap the current value.
   */
  unwrap() {
    return this.#value;
  }

  /**
   * Debug the content of the object value
   */
  override toString() {
    const content = Object.entries(this.#value)
      .map(([key, value]) => {
        return `${key}: ${value}`;
      })
      .join(',\n');
    return `ObjectValue: {
${indentLines(2, content)}
}`;
  }
}

/**
 * Represents the array based token values
 */
export class ArrayValue<
  Value extends Array<any> = Array<any>,
> extends BaseValue {
  #value: Value;

  constructor(value: Value, valuePath: JSONPath, tokenState: TokenState) {
    super(valuePath, tokenState);
    this.#value = value;
  }

  /**
   * Map against the value of an index within the array value.
   * @param callback
   */
  mapItems<R>(
    callback: (arrayValue: Value[number], index: number) => R,
  ): ArrayValue<Array<R>> {
    // @ts-expect-error
    this.#value = this.#value.map(callback);
    return this as any;
  }

  /**
   * Map the entire array value then unwrap the value.
   * @param callback
   */
  flatMap<R>(callback: (arrayValue: Value) => R): R {
    return callback(this.#value);
  }

  /**
   * Unwrap the current value.
   * To be called at the end of the mapping chain.
   */
  unwrap() {
    return this.#value;
  }

  /**
   * Debug the content of the array value
   * @internal
   */
  override toString() {
    const content = this.#value
      .map((item, index) => {
        return `${index}: ${item.toString()}`;
      })
      .join(',\n');
    return `ArrayValue: [
${indentLines(2, content)}
]`;
  }
}

/**
 * Represents the scalar token values
 */
export class ScalarValue<
  Value extends Json.Primitive = Json.Primitive,
> extends BaseValue {
  #value: Value;

  constructor(value: Value, valuePath: JSONPath, tokenState: TokenState<any>) {
    super(valuePath, tokenState);
    this.#value = value;
  }

  /**
   * Get the raw scalar value
   */
  get raw(): Value {
    return this.#value;
  }

  /**
   * Debug the content of the scalar value
   * @internal
   */
  override toString() {
    return `Scalar: ${this.#value}`;
  }
}

/**
 * Represents the reference to another token value
 */
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

  /**
   * Get the coordinates of the referencing token
   */
  get from() {
    return {
      treePath: this.#reference.fromTreePath,
      valuePath: this.#reference.fromValuePath,
    };
  }

  /**
   * Get the coordinates of the referenced token
   */
  get to() {
    return {
      treePath: this.#reference.toTreePath,
    };
  }

  /**
   * Whether the reference is fully linked across all its dependencies
   */
  get isFullyLinked() {
    return this.#reference.isFullyLinked;
  }

  /**
   * Whether the reference is linked at least to the next level
   */
  get isShallowlyLinked() {
    return this.#reference.isShallowlyLinked;
  }

  /**
   * Get the targeted type of the referenced token
   */
  get toType() {
    return this.#reference.toType;
  }

  /**
   * Get the Option for the referenced token
   */
  getToken<T extends Type>(): Option.Option<TokenState<T>> {
    // @ts-expect-error - narrowing mismatch
    return this._tokenState.treeState.tokenStates.getOneById(
      this.#reference.toId,
    );
  }

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
  mapShallowlyLinkedToken<T extends Type, R>(
    callback: (resolvedToken: TokenState<T>) => R,
  ): AliasReference<Type, R | Value> {
    if (this.#reference.isShallowlyLinked) {
      Option.match(
        this._tokenState.treeState.tokenStates.getOneById(this.#reference.toId),
        {
          onSome: (tokenState) => {
            // @ts-expect-error
            this.#value = callback(tokenState);
          },
          onNone: () => {},
        },
      );
    }
    return this as any;
  }

  /**
   * Map against the deeply linked value of the alias reference.
   * @param callback
   */
  mapDeeplyLinkedToken<T extends Type, R>(
    callback: (resolvedToken: TokenState<T>) => R,
  ): AliasReference<Type, R | Value> {
    if (this.#reference.isFullyLinked) {
      Option.match(
        this._tokenState.treeState.tokenStates.getOneById(this.#reference.toId),
        {
          onSome: (tokenState) => {
            // @ts-expect-error
            this.#value = callback(tokenState);
          },
          onNone: () => {},
        },
      );
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
   * To be called at the end of the mapping chain.
   */
  unwrap() {
    return this.#value;
  }

  /**
   * Debug the content of the alias reference
   * @internal
   */
  override toString() {
    const isShallowlyLinked = this.#reference.isShallowlyLinked;
    const isFullyLinked = this.#reference.isFullyLinked;

    const status = isFullyLinked
      ? '[Linked]'
      : isShallowlyLinked
        ? '[Shallowly linked]'
        : '[Unlinked]';

    const valuePath =
      this.#reference.fromValuePath.length > 0
        ? ` at "${this.#reference.fromValuePath.string}"`
        : ' ';

    return `AliasReference ${status} "${this.#reference.fromTreePath.string}"${valuePath} -> "${this.#reference.toTreePath.string}"`;
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return this.toString();
  }
}

/**
 * Utility to map against the value of a token
 */
export class ValueMapper<Value> {
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
   * To be called at the end of the mapping chain.
   */
  unwrap() {
    return this.#value;
  }

  /**
   * Debug the content of the value mapper
   * @internal
   */
  toString() {
    let content: string = 'INVALID CONTENT';

    if (this.#value instanceof ScalarValue) {
      content = this.#value.toString();
    } else if (this.#value instanceof AliasReference) {
      content = this.#value.toString();
    } else if (this.#value instanceof ObjectValue) {
      content = this.#value.toString();
    } else if (this.#value instanceof ArrayValue) {
      content = this.#value.toString();
    }

    return `ValueMapper for "${this.#tokenState.stringPath}" {
${indentLines(2, content)}
}`;
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return this.toString();
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
