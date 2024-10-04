# W3C Design Tokens Parser

<img src="https://github.com/nclsndr/design-tokens-tools/blob/main/packages/w3c-design-tokens-parser/docs/_assets/tokens-parser.jpg?raw=true" width="400" />

This package provides a TypeScript implementation of the parser for the [W3C Design Tokens Format Module](https://tr.designtokens.org/format) specification. It also includes several methods to work with the tokens and their values.

## Installation

### Using npm

```bash
$ npm install @nclsndr/w3c-design-tokens-parser
```

### Using yarn

```bash
$ yarn add @nclsndr/w3c-design-tokens-parser
```

### Using pnpm

```bash
$ pnpm add @nclsndr/w3c-design-tokens-parser
```

## Usage

### Parse an initial token tree

We start from a JSON parsed JavaScript object that represents a design token tree.

```typescript
import { parseDesignTokens } from '@nclsndr/w3c-design-tokens-parser';

const tokens = {
  color: {
    $type: 'color',
    blue: {
      100: {
        $value: '#0d3181',
      },
    },
  },
};

const tokenTree = parseDesignTokens(tokens);
```

The `TokenTree` exposes various methods to either get the parse errors, the tokens, or work with the values of the tokens.

```typescript
// Get errors
tokenTree.getErrors();

// Get a given token
tokenTree.getToken(['color', 'blue', 100]);
// with a type guard to help out the TS compiler
tokenTree.getTokenOfType('color', ['color', 'blue', 100]);

// Get tokens
tokenTree.getAllTokens();
tokenTree.getAllTokensByType('color');
// With a callback style
tokenTree.mapTokensByType('color', (token) => {
  // ...
});

// Get groups
tokenTree.getAllGroups();
tokenTree.getGroup(['color']);
```

Once we grabbed some tokens, we can use the `Token` methods to move further.

The most basic operation is to get the JSON value of a token. Let's take the following:

```typescript
const tokens: JSONTokenTree = {
  color: {
    $type: 'color',
    blue: {
      $value: '#0000FF',
    },
    accent: {
      $value: '{color.blue}',
    },
    borderActive: {
      $value: '{color.accent}',
    },
  },
  border: {
    $type: 'border',
    active: {
      $value: {
        width: '1px',
        style: 'solid',
        color: '{color.borderActive}',
      },
    },
  },
};
const tokenTree = parseDesignTokens(tokens);

const fullyResolvedColorValues = tokenTree.mapTokensByType('color', (token) => {
  console.log(token.summary);

  return token.getJSONValue({
    resolveToDepth: Infinity,
    // resolveToDepth allows to resolve the token value to a certain depth.
    // resolveToDepth: -1 is equivalent to resolveToDepth: Infinity
  });
});
console.log(fullyResolvedColorValues); // [ '#0000FF', '#0000FF', '#0000FF' ]

const partiallyResolvedColorValues = tokenTree.mapTokensByType(
  'color',
  (token) => {
    return token.getJSONValue({
      resolveToDepth: 1, // resolving aliases up to 1 level
    });
  },
);
console.log(partiallyResolvedColorValues); // [ '#0000FF', '#0000FF', '{color.blue}' ]
```

Whenever we want to work with the value of a token, we need to consider all the potential forms the value might take.
The `token
.getValueMapper()` method provides an API to generalize the approach to the token values where most of them can be aliased at any point in the tree.

With a color, we might have a raw value or an alias reference.

```typescript
const colorValues = tokenTree.mapTokensByType('color', (colorToken) => {
  return colorToken
    .getValueMapper()
    .mapScalarValue((scalarValue) => scalarValue.raw)
    .mapAliasReference(
      (aliasReference) =>
        `var(--${aliasReference.to.treePath.array.join('-')})`,
    )
    .unwrap();
});
console.log(colorValues); // [ '#0000FF', 'var(--color-blue)', 'var(--color-accent)' ]
```

With a border, we might have an alias reference or an object, which might contain an alias reference for each of its properties.

```typescript
const borderValues = tokenTree.mapTokensByType('border', (token) => {
  return token
    .getValueMapper()
    .mapAliasReference((ref) => `var(--${ref.to.treePath.join('-')})`)
    .mapObjectValue((obj) =>
      obj.flatMap((value) => {
        const width = value.width
          .mapAliasReference((ref) => `var(--${ref.to.treePath.join('-')}`)
          .mapScalarValue((value) => value.raw)
          .unwrap();
        const style = value.style
          .mapAliasReference((ref) => `var(--${ref.to.treePath.join('-')}`)
          .mapScalarValue((value) => value.raw)
          .unwrap();
        const color = value.color
          .mapAliasReference((ref) => `var(--${ref.to.treePath.join('-')}`)
          .mapScalarValue((value) => value.raw)
          .unwrap();

        return [width, style, color].join(' ');
      }),
    )
    .unwrap();
});

console.log(borderValues); // [ '1px solid var(--color-borderActive' ]
```

In order to cut down the complexity of aliases one would have to resolve, the `token
.getValueMapper()` methods takes a `resolveAtDepth` option, which can bring back the raw value of the token at a certain depth, as far as the referenced token exists.

```typescript
const cssColorTokens = tokenTree.mapTokensByType('color', (colorToken) => {
  return {
    key: colorToken.name,
    value: colorToken
      .getValueMapper({
        resolveAtDepth: Infinity,
      })
      .mapScalarValue((scalarValue) => scalarValue.raw)
      .mapAliasReference(
        (aliasReference) =>
          `var(--${aliasReference.to.treePath.array.join('-')})`,
      )
      .unwrap(),
  };
});
```

## API

- [TokenTree](docs/api/TokenTree.md)
  - [Token](docs/api/Token.md)
    - [ValueMapper](docs/api/ValueMapper.md)
      - [ScalarValue](docs/api/ScalarValue.md)
      - [AliasReference](docs/api/AliasReference.md)
      - [ObjectValue](docs/api/ObjectValue.md)
      - [ArrayValue](docs/api/ArrayValue.md)
