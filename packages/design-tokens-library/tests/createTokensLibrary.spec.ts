import { describe, expect, it } from 'vitest';
import { createTokensLibrary } from '../src/createTokensLibrary';
import { JSONTokenTree } from 'design-tokens-format-module';
import { toCSSVariables } from '../src/exporter/cssVariables/toCSSVariables';

describe('createTokensLibrary', () => {
  it('should make a library out of sources', () => {
    const light: JSONTokenTree = {
      Color: {
        $type: 'color',
        White: {
          $value: '#FFFFFF',
        },
        Accent: {
          500: {
            $value: '#1D93DC',
          },
        },
      },
    };
    const lightExtended: JSONTokenTree = {
      Color: {
        $type: 'color',
        Accent: {
          600: {
            $value: '#0C81CA',
          },
        },
        primary: {
          $value: '{Color.Accent.500}',
        },
      },
    };
    const dark: JSONTokenTree = {
      Color: {
        $type: 'color',
        White: {
          $value: '#000000',
        },
        Accent: {
          500: {
            $value: '#52B5F3',
          },
        },
        primary: {
          $value: '{Color.Accent.500}',
        },
      },
    };
    const darkExtended: JSONTokenTree = {
      Color: {
        $type: 'color',
        Accent: {
          600: {
            $value: '#3CA7E2',
          },
        },
      },
    };
    const common: JSONTokenTree = {
      Semantic: {
        $type: 'color',
        Foreground: {
          $value: '{Color.Accent.500}',
        },
        Emphasis: {
          $value: '{Color.Accent.600}',
        },
      },
      'Font Family': {
        $type: 'fontFamily',
        body: {
          $value: 'Helvetica',
        },
      },
      Border: {
        $type: 'border',
        Base: {
          $value: {
            width: '1px',
            style: 'solid',
            color: '{Color.Accent.500}',
          },
        },
      },
      Transition: {
        $type: 'transition',
        Base: {
          $value: {
            duration: '200ms',
            delay: '0ms',
            timingFunction: [0.4, 0, 0.2, 1],
          },
        },
      },
      Shadow: {
        $type: 'shadow',
        Base: {
          $value: {
            color: '{Color.Accent.500}',
            offsetX: '0px',
            offsetY: '4px',
            blur: '8px',
            spread: '2px',
          },
        },
      },
    };

    const library = createTokensLibrary({
      tokenTrees: [
        { name: 'light', jsonTree: light },
        { name: 'light-extended', jsonTree: lightExtended },
        { name: 'dark', jsonTree: dark },
        { name: 'dark-extended', jsonTree: darkExtended },
        { name: 'semantic', jsonTree: common },
      ],
      collections: [
        {
          name: 'Color scheme',
          modes: [
            {
              name: 'light',
              tokenTrees: [{ name: 'light' }, { name: 'light-extended' }],
            },
            {
              name: 'dark',
              tokenTrees: [{ name: 'dark' }, { name: 'dark-extended' }],
            },
          ],
        },
      ],
    });

    const output = library.export(
      toCSSVariables({
        format: {
          token: {
            name: {
              template:
                '{{#parent.first}}{{parent.first}}-{{/parent.first}}{{name}}',
              toCase: 'kebabCase',
            },
          },
        },
        files: [
          {
            name: 'themed-Colors.css',
            format: { token: { value: { resolveAtDepth: 'infinity' } } },
            content: [
              {
                scope: ':root',
                with: [
                  {
                    type: 'collection',
                    name: 'Color scheme',
                    mode: 'light',
                  },
                ],
              },
              {
                scope: ':root[data-theme="dark"]',
                with: [
                  {
                    type: 'collection',
                    name: 'Color scheme',
                    mode: 'dark',
                  },
                ],
              },
            ],
          },
          {
            name: 'semantic.css',
            format: {
              token: { name: { template: undefined, toCase: 'constantCase' } },
            },
            content: [
              {
                scope: ':root',
                with: [{ type: 'tokenTree', name: 'semantic' }],
              },
            ],
          },
        ],
      }),
    );

    expect(output).toStrictEqual([
      {
        type: 'file',
        path: 'themed-Colors.css',
        content:
          ':root {\n--color-white: #FFFFFF;\n--accent-500: #1D93DC;\n--accent-600: #0C81CA;\n--color-primary: #1D93DC;\n}\n:root[data-theme="dark"] {\n--color-white: #000000;\n--accent-500: #52B5F3;\n--accent-600: #3CA7E2;\n--color-primary: #52B5F3;\n}',
      },
      {
        type: 'file',
        path: 'semantic.css',
        content:
          ':root {\n--SEMANTIC_FOREGROUND: var(--accent-500);\n--SEMANTIC_EMPHASIS: var(--accent-600);\n--FONT_FAMILY_BODY: Helvetica;\n--BORDER_BASE: 1px solid var(--accent-500);\n--TRANSITION_BASE: all 200ms 0ms cubic-bezier(0.4, 0, 0.2, 1);\n--SHADOW_BASE: 0px 4px 8px 2px var(--accent-500);\n}',
      },
    ]);
  });
});
