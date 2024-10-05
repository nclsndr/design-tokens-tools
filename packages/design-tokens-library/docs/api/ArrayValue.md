# `ArrayValue`

## Methods

### `mapItems`

Map against the value of an index within the array value.

```typescript
declare function mapItems<R>(callback: (arrayValue: Value[number], index: number) => R): ArrayValue<Array<R>>;
```

### `flatMap`

Map the entire array value then unwrap the value.

```typescript
declare function flatMap<R>(callback: (arrayValue: Value) => R): R;
```

### `unwrap`

Unwrap the current value. To be called at the end of the mapping chain.

```typescript
declare function unwrap(): Value;
```
