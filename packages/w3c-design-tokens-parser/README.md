# W3C Design Tokens Parser

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
      }
    }
  }
};

const tokenTree = parseDesignTokens()
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
})

// Get groups
tokenTree.getAllGroups()
tokenTree.getGroup(['color']);
```

Once we grabbed some tokens, we can use the `Token` methods to move further.

```typescript
import { colorToken } from './tokens';

const colorTokens = tokenTree.getAllTokensByType('color');

const cssColorTokens = tokenTree.mapTokensByType('color', (colorToken) => {
  console.log(colorToken.summary);

  return {
    key: colorToken.name,
    value: colorToken
      .getValueMapper()
      .mapScalarValue((scalarValue) => scalarValue.raw)
      .mapAliasReference(
        (aliasReference) =>
          `var(--${aliasReference.to.treePath.array.join('-')})`,
      )
      .unwrap(),
  };
});
```

The `token
.getValueMapper()` method provides an API to generalize the approach to the token values where most of them can be aliased at any point in the tree.


In order to cut down the complexity of aliases one would have to resolve, the `token
.getValueMapper()` methods takes a `resolveAtDepth` option, which can bring back the raw value of the token at a certain depth, as far as the referenced token exists.

```typescript
const cssColorTokens = tokenTree.mapTokensByType('color', (colorToken) => {
  return {
    key: colorToken.name,
    value: colorToken
      .getValueMapper({
        resolveAtDepth: Infinity
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
