import { describe, it, expect } from 'vitest';
import { DesignTokenTree } from '../src/definitions/tokenTypes';

import { parseDesignTokens } from '../src/parseDesignTokens';

describe('parseDesignTokens', () => {
  it.only('should parse token tree with top level aliases', () => {
    const tree: DesignTokenTree = {
      base: {
        blue: {
          $type: 'color',
          $value: '#0d3181',
        },
        blue2: {
          $type: 'color',
          $value: '{base.blue}',
        },
        number: {
          $type: 'number',
          $value: 42,
        },
        // red: {
        //   $type: 'color',
        //   $value: '#ff0000',
        // },
      },
      color: {
        $type: 'color',
        primary: {
          $value: '{base.blue2}',
        },
      },

      // border: {
      //   solid: {
      //     $value: '{color.primary}',
      //   },
      //   dashed: {
      //     $value: '{color.border.solid}',
      //   },
      // },
    };

    const tokenTree = parseDesignTokens(tree);

    // TODO @Nico: NO CONSOLE
    console.log('tokenTree:', JSON.stringify(tokenTree, null, 2));

    // TODO @Nico: NO CONSOLE
    // console.log('getErrors', tokenTreeAPI.getErrors());
    // console.log(
    //   'getAllTokens',
    //   tokenTreeAPI.getAllTokens().map((token) => token.summary),
    // );
  });
  it.todo('should parse two tokens referencing a third one', () => {
    const tree: DesignTokenTree = {
      base: {
        blue: {
          $type: 'color',
          $value: '#0d3181',
        },
      },
      semantic: {
        primary: {
          $type: 'color',
          $value: '{base.blue}',
        },
        color: {
          $type: 'color',
          $value: '{base.blue}',
        },
      },
    };

    const treeState = parseDesignTokens(tree);
  });
  it.todo('should parse token tree with nested aliases', () => {
    const tree: DesignTokenTree = {
      base: {
        color: {
          $type: 'color',
          blue: {
            $value: '#0d3181',
          },
          primary: {
            $type: 'color',
            $value: '{base.color.blue}',
            // $value: '{base.sizing.basis}',
          },

          // secondary: {
          //   $value: '{base.color.primary}',
          // },
        },

        sizing: {
          $type: 'number',
          basis: {
            $type: 'number',
            $value: 16,
          },
        },

        // spacing: {
        //   $type: 'dimension',
        //   '0_25': {
        //     $value: '1px',
        //   },
        // },
      },

      solidBorder: {
        $type: 'border',
        $value: {
          color: '{base.color.primary}',
          // color: '#0d3181',
          style: 'solid',
          // width: '{base.spacing.0_25}',
          width: '{base.color.primary}',
        },
      },

      // otherBorder: {
      //   $value: '{solidBorder}',
      // },
    };

    const treeState = parseDesignTokens(tree);

    // TODO @Nico: NO CONSOLE
    console.log('treeState.getAllTokens():', treeState.getAllTokens());
    console.log('treeState.getErrors():', treeState.getErrors());
  });
  it.todo('should parse token tree with errors', () => {
    const tree: DesignTokenTree = {
      invalid: {
        // @ts-expect-error
        $type: 'unknown',
        // @ts-expect-error
        $value: 'invalid',
      },
      // @ts-expect-error
      color: {
        $type: 'color',
        $value: 'invalid color',
      },
      group: {
        // @ts-expect-error
        $type: 'group',
        inner: {
          $value: 'a string',
        },
      },
    };

    const treeState = parseDesignTokens(tree);
  });
});
