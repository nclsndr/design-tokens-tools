# Design Tokens Library

[![npm version](https://badge.fury.io/js/@nclsndr%2Fdesign-tokens-library.svg)](https://www.npmjs.com/package/@nclsndr/design-tokens-library)

The Design Tokens Library provides two main APIs to work with design tokens:

- The `TokensLibrary` API articulates design tokens from many sources (e.g: light/dark color values) in collections. Then, it offers a code generation feature to convert design tokens in various languages and flavours (CSS, SCSS, JSON...).
- The `TokenTree` API provides helps you parse and manipulate a single token tree with rich validation errors, query methods and a mapping API to work the value.

> [!NOTE]
> The Design Tokens Library is compliant with the [W3C Design Tokens Specification](https://tr.designtokens.org/format/).

## Installation

### Using npm

```bash
$ npm install @nclsndr/design-tokens-library
```

### Using yarn

```bash
$ yarn add @nclsndr/design-tokens-library
```

### Using pnpm

```bash
$ pnpm add @nclsndr/design-tokens-library
```

## Usage

### Generate code from many token files using the tokensLibrary

#### Starting point

Let's assume we have a few design tokens files like so:

- A `light-colors.json` file

```json
{
  "Color": {
    "$type": "color",
    "Accent": {
      "500": {
        "$value": "#1D93DC"
      }
    }
  }
}
```

- A `dark-colors.json` file

```json
{
  "Color": {
    "$type": "color",
    "Accent": {
      "500": {
        "$value": "#52B5F3"
      }
    }
  }
}
```

- A `semantic-colors.json` file

```json
{
  "Semantic": {
    "$type": "color",
    "Foreground": {
      "$value": "{Color.Accent.500}"
    }
  }
}
```

#### Create a library

We'll create a `TokensLibrary` instance by providing the JSON token trees from the files.

```typescript
import * as fs from 'node:fs';
import { createTokensLibrary } from '@nclsndr/design-tokens-library';

const lightColorsTree = fs.readFileSync('./light-colors.json', 'utf8');
const darkColorsTree = fs.readFileSync('./dark-colors.json', 'utf8');
const semanticColorsTree = fs.readFileSync('./semantic-colors.json', 'utf8');

const library = createTokensLibrary({
  tokenTrees: [
    // We register the JSON token trees we want to work with
    { name: 'light', jsonTree: lightColorsTree },
    // jsonTree can be either a string or an object (parsed JSON)
    { name: 'dark', jsonTree: darkColorsTree },
    { name: 'semantic', jsonTree: semanticColorsTree },
  ],
  collections: [
    {
      name: 'Color scheme',
      // We declare the modes of the collection
      modes: [
        {
          name: 'light',
          // We associate the token trees to the mode
          tokenTrees: [{ name: 'light' }],
        },
        {
          name: 'dark',
          tokenTrees: [{ name: 'dark' }],
        },
      ],
    },
  ],
});
```

> [!IMPORTANT]
> When declaring modes within a collection, the token trees must define the same tokens for each mode. Otherwise, the library will throw an error.
> This ensures that an alias referring to a token with modes, will always resolve to an actual value.

#### Generate CSS variables

Let's generate two CSS variables files from the `Color scheme` collection and the `Semantic` token trees: `themed-colors.css` and `semantic-colors.css`.
To help us out, we'll use the `toCSSVariables` exporter.

```typescript
import { exporter } from '@nclsndr/design-tokens-library';

const cssFiles = library.export(
  exporter.toCSSVariables({
    // We can pass format options to customize the output
    format: { token: { name: { toCase: 'kebabCase' } } },
    files: [
      {
        // Declare a file
        name: 'themed-colors.css',
        content: [
          {
            // Declare a scope for the CSS variables
            scope: ':root',
            with: [
              // Pick the tokens from the Color scheme collection
              { type: 'collection', name: 'Color scheme', mode: 'light' },
            ],
          },
          {
            scope: ':root[data-theme="dark"]',
            with: [{ type: 'collection', name: 'Color scheme', mode: 'dark' }],
          },
        ],
      },
      {
        name: 'semantic.css',
        content: [
          {
            scope: ':root',
            with: [
              // Pick the tokens from the Semantic token tree
              { type: 'tokenTree', name: 'semantic' },
            ],
          },
        ],
      },
    ],
  })
);

for (const file of cssFiles) {
  fs.writeFileSync(file.path, file.content, { encoding: 'utf-8' });
}
```

### 🎉

Here you are with two CSS files:

`themed-colors.css`

```css
:root {
  --color-accent-500: #1d93dc;
}
:root[data-theme='dark'] {
  --color-accent-500: #52b5f3;
}
```

`semantic-colors.css`

```css
:root {
  --semantic-foreground: var(--color-accent-500);
}
```

### Inspect a tokens file using the token tree API

We start from a JSON parsed JavaScript object that represents a design token tree.

```typescript
import { parseJSONTokenTree } from '@nclsndr/design-tokens-library';

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

const tokenTree = parseJSONTokenTree(tokens);
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
const tokenTree = parseJSONTokenTree(tokens);

const fullyResolvedColorValues = tokenTree.mapTokensByType('color', (token) => {
  console.log(token.summary);

  return token.getJSONValue({
    resolveAtDepth: Infinity,
    // resolveAtDepth allows to resolve the token value to a certain depth.
  });
});
console.log(fullyResolvedColorValues); // [ '#0000FF', '#0000FF', '#0000FF' ]

const partiallyResolvedColorValues = tokenTree.mapTokensByType(
  'color',
  (token) => {
    return token.getJSONValue({
      resolveAtDepth: 1, // resolving aliases up to 1 level
    });
  }
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
      (aliasReference) => `var(--${aliasReference.to.treePath.array.join('-')})`
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
      })
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
          `var(--${aliasReference.to.treePath.array.join('-')})`
      )
      .unwrap(),
  };
});
```

## API

### `createTokensLibrary`

Create a `TokensLibrary` instance from many token trees and collections.

```typescript
type SourceCollection = {
  name: string;
  modes: Array<{
    name: string;
    tokenTrees: Array<{
      name: string;
      tokenTypes?: Array<TokenTypeName>;
      where?: Array<Array<string>>; // [['color','*'], ['dimension','*']]  
    }>;
  }>;
};
type SourceTokenTree = {
  name: string;
  jsonTree: string | Json.Object;
};
declare function createTokensLibrary({ tokenTrees, collections, }: {
  tokenTrees: Array<SourceTokenTree>;
  collections?: Array<SourceCollection>;
}): TokensLibrary;
```

- [TokensLibrary](docs/api/TokensLibrary.md)

### Exporter

The `Exporter` API is accessible upon the `tokensLibrary.export(/*...*/)` method.

```typescript
type ExporterOutput = Array<{
  type: 'file';
  path: string;
  content: string;
}>

interface TokensLibrary {
  export: <ExporterOptions>(opt: ExporterOptions) => ExporterOutput
}
```

#### `toCSSVariables`

Generate CSS variables from a tokens library.

```typescript
type ToCSSVariablesOptions = {
  files: Array<{
    name: string;
    content: Array<{
      scope: string;
      with: Array<SelectInLibrary & {
        format?: FormatOptions;
      }>;
    }>;
    format?: FormatOptions;
  }>;
  format?: FormatOptions;
};

type SelectInLibrary = | {
  type: 'tokenTree';
  name: string;
  tokenTypes?: Array<TokenTypeName>;
  where?: Array<Array<string>>; // [['color','*'], ['dimension','*']]  
}
        | {
  type: 'collection';
  name: string;
  mode: string;
  tokenTypes?: Array<TokenTypeName>;
  where?: Array<Array<string>>; // [['color','*'], ['dimension','*']]  
};

type FormatOptions = {
  token?: {
    name?: {
      toCase?: Case;
      joinWith?: string;
      template?: string;
    };
    value?: {
      resolveAtDepth?: number | 'infinity';
    };
  };
};

declare function toCSSVariables(opt: ToCSSVariablesOptions): ExporterOutput;
```

### `parseJSONTokenTree`

Parse a JSON token tree into a TokenTree instance.

```typescript
export declare function parseJSONTokenTree(
  jsonTokenTree: unknown, // The JSON token tree to parse, must be string or object. 
  options?: {
    name?: string; // The name of the token tree.
    throwOnError?: boolean; // Whether to throw an error if the JSON token tree is invalid.
}): TokenTree;
```

- [TokenTree](docs/api/TokenTree.md)
  - [Token](docs/api/Token.md)
    - [ValueMapper](docs/api/ValueMapper.md)
      - [ScalarValue](docs/api/ScalarValue.md)
      - [AliasReference](docs/api/AliasReference.md)
      - [ObjectValue](docs/api/ObjectValue.md)
      - [ArrayValue](docs/api/ArrayValue.md)
