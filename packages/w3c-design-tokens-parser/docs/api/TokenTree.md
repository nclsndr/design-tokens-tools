# `TokenTree`

## Properties

### `summary`

Get a glimpse of the token tree state.

```typescript
get summary(): {
    tokens: number;
    groups: number;
    references: number;
    validationErrors: number;
};
```

## Methods

### `getErrors`

Get parsing and validation errors.

```typescript
declare function getErrors(): ValidationError[];
```

### `getAllTokens`

Get all tokens in the tree.

```typescript
declare function getAllTokens(): Token<TokenTypeName>[];
```

### `getAllTokensByType`

Get all tokens of a specific type.

```typescript
declare function getAllTokensByType(type: TokenTypeName): Token<TokenTypeName>[];
```

### `getToken`

Get a token by its path.

```typescript
declare function getToken(path: JSON.ValuePath): import("@swan-io/boxed").Option<Token<TokenTypeName>>;
```

### `getTokenOfType`

Get a token of a specific type by its path.

```typescript
declare function getTokenOfType<T extends TokenTypeName>(type: T, path: JSON.ValuePath): import("@swan-io/boxed").Option<Token<T>>;
```

### `mapTokensByType`

Map over all tokens of a specific type.

```typescript
declare function mapTokensByType<T extends TokenTypeName, R>(type: T, callback: (token: Token<T>) => R): R[];
```

### `getAllGroups`

Get all groups in the tree.

```typescript
declare function getAllGroups(): Group[];
```

### `getGroup`

Get a group by its path.

```typescript
declare function getGroup(path: JSON.ValuePath): import("@swan-io/boxed").Option<Group>;
```

