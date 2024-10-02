import { describe, it } from 'vitest';
import { makeTokensLibrary } from '../src/makeTokensLibrary';
import { JSONTokenTree } from 'design-tokens-format-module';
import { toCssVariables } from '../src/library/css/toCssVariables';

describe('makeTokensLibrary', () => {
  it.todo('should make a library out of sources', () => {
    const light: JSONTokenTree = {
      color: {
        $type: 'color',
        white: {
          $value: '#FFFFFF',
        },
        accent: {
          500: {
            $value: '#1D93DC',
          },
        },
      },
    };
    const lightExtended: JSONTokenTree = {
      color: {
        $type: 'color',
        accent: {
          600: {
            $value: '#0C81CA',
          },
        },
      },
    };
    const dark: JSONTokenTree = {
      color: {
        $type: 'color',
        white: {
          $value: '#000000',
        },
        accent: {
          500: {
            $value: '#52B5F3',
          },
        },
      },
    };
    const darkExtended: JSONTokenTree = {
      color: {
        $type: 'color',
        accent: {
          600: {
            $value: '#3CA7E2',
          },
        },
      },
    };
    const common: JSONTokenTree = {
      semantic: {
        $type: 'color',
        'card-background': {
          $value: '{color.accent.500}',
        },
      },
      fontFamily: {
        $type: 'fontFamily',
        primary: {
          $value: 'Helvetica',
        },
      },
      border: {
        $type: 'border',
        base: {
          $value: {
            width: '1px',
            style: 'solid',
            color: '{color.accent.500}',
          },
        },
      },
      transition: {
        $type: 'transition',
        base: {
          $value: {
            duration: '200ms',
            delay: '0ms',
            timingFunction: [0.4, 0, 0.2, 1],
          },
        },
      },
      shadow: {
        $type: 'shadow',
        base: {
          $value: {
            color: '{color.accent.500}',
            offsetX: '0px',
            offsetY: '4px',
            blur: '8px',
            spread: '2px',
          },
        },
      },
    };

    const library = makeTokensLibrary({
      sets: [
        { name: 'light', jsonTree: light },
        { name: 'light-extended', jsonTree: lightExtended },
        { name: 'dark', jsonTree: dark },
        { name: 'dark-extended', jsonTree: darkExtended },
        { name: 'semantic', jsonTree: common },
      ],
      themes: [
        {
          name: 'Color scheme',
          modes: [
            {
              name: 'light',
              sets: [{ name: 'light' }, { name: 'light-extended' }],
            },
            {
              name: 'dark',
              sets: [{ name: 'dark' }, { name: 'dark-extended' }],
            },
          ],
        },
      ],
    });

    const output = library.export(
      toCssVariables({
        format: {
          token: {
            // nameCase: 'camelCase',
            // joinWith: '',
            // template: '{{#groups}}{{.}}-{{/groups}}{{name}}',
            template:
              '{{#parent.first}}{{parent.first}}-{{/parent.first}}{{name}}',
          },
        },
        files: [
          {
            name: 'themed-colors.css',
            // format: { token: { nameCase: 'constantCase' } },
            content: [
              {
                scope: ':root',
                with: [
                  {
                    type: 'theme',
                    name: 'Color scheme',
                    mode: 'light',
                  },
                ],
              },
              {
                scope: ':root[data-theme="dark"]',
                with: [
                  {
                    type: 'theme',
                    name: 'Color scheme',
                    mode: 'dark',
                  },
                ],
              },
            ],
          },
          {
            name: 'semantic.css',
            content: [
              {
                scope: ':root',
                with: [
                  {
                    type: 'set',
                    name: 'semantic',
                  },
                ],
              },
            ],
          },
        ],
      }),
    );

    // TODO @Nico: NO CONSOLE
    console.log('output:', JSON.stringify(output, null, 2));
  });
});
