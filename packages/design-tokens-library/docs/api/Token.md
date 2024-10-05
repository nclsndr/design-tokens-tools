# `Token`

## Properties

### `path`

The token path in the tree.

```typescript
get path(): JSON.ValuePath;
```

### `name`

```typescript
get name(): string | number;
```

### `stringPath`

The token string representation of the path.

```typescript
get stringPath(): string;
```

### `type`

The token type.

```typescript
get type(): TokenTypeName;
```

### `description`

The token description.

```typescript
get description(): string | undefined;
```

### `extensions`

The token extensions.

```typescript
get extensions(): Record<string, any> | undefined;
```

### `summary`

The token main data.

```typescript
get summary(): {
    path: JSON.ValuePath;
    type: TokenTypeName;
    description: string | undefined;
    extensions: Record<string, any> | undefined;
    references: Array<{
        fromTreePath: string;
        fromValuePath: string;
        toTreePath: string;
        isFullyLinked: boolean;
        isShallowlyLinked: boolean;
    }>;
    rawJSONValue: DesignToken['$value'];
};
```

## Methods

### `getValueMapper`

Get the ValueMapper utility to work with the token value.

```typescript
declare function getValueMapper<T extends TokenTypeName = Type>(options?: {
    resolveAtDepth?: number;
}): PickSwappedValueSignature<T>;
```

### `getJSONValue`

Get the JSON representation of the token value.

```typescript
declare function getJSONValue(): string | number | string[] | import("design-tokens-format-module").CubicBezier.RawValue | {
    dashArray: import("design-tokens-format-module").Dimension.Value[];
    lineCap: typeof import("design-tokens-format-module").strokeStyleLineCapValues[number];
} | import("design-tokens-format-module").Border.RawValue | import("design-tokens-format-module").Transition.RawValue | import("design-tokens-format-module").Shadow.RawValue | import("design-tokens-format-module").Gradient.RawValue | import("design-tokens-format-module").Typography.RawValue;
```

### `getJSONToken`

Get the JSON representation of the token.

```typescript
declare function getJSONToken(options?: {
    withExplicitType?: boolean;
}): DesignToken;
```

