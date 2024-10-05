# `AliasReference`

## Properties

### `from`

Get the coordinates of the referencing token.

```typescript
get from(): {
    treePath: JSONPath;
    valuePath: JSONPath;
};
```

### `to`

Get the coordinates of the referenced token.

```typescript
get to(): {
    treePath: JSONPath;
};
```

### `isFullyLinked`

Whether the reference is fully linked across all its dependencies.

```typescript
get isFullyLinked(): boolean;
```

### `isShallowlyLinked`

Whether the reference is linked at least to the next level.

```typescript
get isShallowlyLinked(): boolean;
```

### `toType`

Get the targeted type of the referenced token.

```typescript
get toType(): TokenTypeName | undefined;
```

## Methods

### `getToken`

Get the referenced token.

```typescript
declare function getToken<T extends Type>(): Token<T> | undefined;
```

### `map`

Map against the value of the alias reference.

```typescript
declare function map<R>(callback: (value: Value) => R): AliasReference<Type, R>;
```

### `mapShallowlyLinkedToken`

Map against the shallowly linked value of the alias reference.

```typescript
declare function mapShallowlyLinkedToken<T extends Type, R>(callback: (resolvedToken: Token<T>) => R): AliasReference<Type, R | Value>;
```

### `mapDeeplyLinkedToken`

Map against the deeply linked value of the alias reference.

```typescript
declare function mapDeeplyLinkedToken<T extends Type, R>(callback: (resolvedToken: Token<T>) => R): AliasReference<Type, R | Value>;
```

### `mapShallowlyUnlinkedReference`

Map against the shallowly unlinked value of the alias reference.

```typescript
declare function mapShallowlyUnlinkedReference<R>(callback: (unresolvableReference: AliasReference<Type, Value>) => R): AliasReference<Type, R | Value>;
```

### `mapDeeplyUnlinkedReference`

Map against the deeply unlinked value of the alias reference.

```typescript
declare function mapDeeplyUnlinkedReference<R>(callback: (unresolvableReference: AliasReference<Type, Value>) => R): AliasReference<Type, R | Value>;
```

### `unwrap`

Unwrap the current value. To be called at the end of the mapping chain.

```typescript
declare function unwrap(): Value;
```

