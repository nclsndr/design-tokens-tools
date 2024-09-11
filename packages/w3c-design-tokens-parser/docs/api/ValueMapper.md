# `ValueMapper`

## Methods

### `mapScalarValue`

Map against the scalar value of the token.

```typescript
declare function mapScalarValue<R>(callback: (rawValue: Extract<Value, ScalarValue>) => R): ValueMapper<R | Exclude<Value, ScalarValue>>;
```

### `mapAliasReference`

Map against the alias reference of the token.

```typescript
declare function mapAliasReference<R>(callback: (reference: Extract<Value, AliasReference>) => R): ValueMapper<R | Exclude<Value, AliasReference>>;
```

### `mapObjectValue`

Map against the object-based value of the token.

```typescript
declare function mapObjectValue<R>(callback: (objectValue: Extract<Value, ObjectValue<any>>) => R): ValueMapper<R | Exclude<Value, ObjectValue<any>>>;
```

### `mapArrayValue`

Map against the array-based value of the token.

```typescript
declare function mapArrayValue<R>(callback: (arrayValue: Extract<Value, ArrayValue<any>>) => R): ValueMapper<R | Exclude<Value, ArrayValue<any>>>;
```

### `unwrap`

Unwrap the current value. To be called at the end of the mapping chain.

```typescript
declare function unwrap(): Value;
```
