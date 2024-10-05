# W3C Design Tokens Parser

<img src="https://github.com/nclsndr/design-tokens-tools/blob/main/packages/w3c-design-tokens-parser/docs/_assets/tokens-parser.jpg?raw=true" width="400" />

[![npm version](https://badge.fury.io/js/@nclsndr%2Fw3c-design-tokens-parser.svg)](https://www.npmjs.com/package/@nclsndr/w3c-design-tokens-parser)

This package provides a TypeScript implementation of the parser for the [W3C Design Tokens Format Module](https://tr.designtokens.org/format) specification. It returns a structured object containing the parsed design tokens, groups and the potential errors found during the parsing and validation processes.

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


### Parse a JSON token tree

The main API of the package is the `parseJSONTokenTree` function. It takes a JSON object representing the design tokens tree and returns an [Either](https://effect-ts.github.io/effect/effect/Either.ts.html) (from [Effect](https://effect.website/)) type wrapping either, an object literal containing the parsed tokens, groups and their validation errors; either, a parse error encountered with the input.

```typescript
import { Either } from 'effect'
import { parseJSONTokenTree } from '@nclsndr/w3c-design-tokens-parser';

const designTokens = {
  color: {
    $type: 'color',
    primary: {
      $value: '#ff0000',
    },
  }
}

const parsedJSONTokenTree = parseJSONTokenTree(designTokens);

const matched = Either.match(result, {
  onRight: (r) => {
    const errors = [...r.tokenErrors, ...r.groupErrors];
    if (errors.length) {
      throw new Error(errors.map((e) => e.message).join('\n'));
    }
    return {
      tokens: r.analyzedTokens,
      groups: r.analyzedGroups,
    }
  },
  onLeft: (err) => {
    throw new Error(err.map(e => e.message).join('\n'));
  },
})
```

## API

### `parseJSONTokenTree`

```typescript
type ParsedJSONTokenTree = Either.Either<{
    tokenTree: JSONTypes.Object;
    analyzedTokens: Array<AnalyzedToken>;
    analyzedGroups: Array<AnalyzedGroup>;
    tokenErrors: Array<ValidationError>;
    groupErrors: Array<ValidationError>;
}, ValidationError[]>;
declare function parseJSONTokenTree(input: unknown): ParsedJSONTokenTree;
```
