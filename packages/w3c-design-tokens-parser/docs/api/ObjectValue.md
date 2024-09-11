# `ObjectValue`

## Methods

### `mapKey`

Map against the value of a key within the object value.

```typescript
declare function mapKey<K extends keyof Value, R>(key: K, callback: (keyValue: Value[K]) => R): ObjectValue<Omit<Value, K> & {
    [key in K]: R;
}>;
```

### `flatMap`

Map the entire object value then unwrap the value.

```typescript
declare function flatMap<R>(callback: (objectValue: Value) => R): R;
```

### `unwrap`

Unwrap the current value.

```typescript
declare function unwrap(): Value;
```
