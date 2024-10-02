import { describe, it } from 'vitest';
import {
  JSONTokenTree,
  matchIsGroup,
  matchIsToken,
} from 'design-tokens-format-module';
import {
  deepSetJSONValue,
  traverseJSONValue,
  getJSONValue,
  arrayEndsWith,
} from '@nclsndr/design-tokens-utils';

import { parseDesignTokens } from '../src';
import { TokenTree } from '../src/client/TokenTree';

describe('dope', () => {
  it('runs', () => {
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
    const common: JSONTokenTree = {
      semantic: {
        $type: 'color',
        'card-background': {
          $value: '{color.accent.500}',
        },
      },
    };

    const commonState = parseDesignTokens(common);

    function mergeWithModes<
      const Items extends Array<{
        name: string;
        tree: unknown;
      }>,
    >(
      tokenSetsWithModes: Items,
    ): {
      [K in Items[number]['name']]: TokenTree;
    } {
      if (tokenSetsWithModes.length < 2) {
        throw new Error('mergeWithModes requires at least 2 token trees.');
      }

      const tokenSetsWithStates = tokenSetsWithModes.map(({ name, tree }) => ({
        name,
        state: parseDesignTokens(tree),
      }));

      const allTokenPaths = new Set(
        tokenSetsWithStates.flatMap(({ state }) =>
          state.getAllTokens().map((t) => t.stringPath),
        ),
      );

      return tokenSetsWithStates.reduce<any>((acc, { name, state }) => {
        const errors = state.getErrors();
        if (errors.length > 0) {
          throw new Error(errors.map((e) => e.message).join('\n'));
        }

        const diff = new Set(allTokenPaths);
        for (const tokenState of state.getAllTokens()) {
          if (diff.has(tokenState.stringPath)) {
            diff.delete(tokenState.stringPath);
          }
        }

        if (diff.size > 0) {
          throw new Error(
            `Token paths not found in variant "${name}": ${Array.from(diff)
              .map((n) => `"${n}"`)
              .join(', ')}.`,
          );
        }

        acc[name] = state;
        return acc;
      }, {});
    }

    function distribute(source: TokenTree, ...targets: Array<TokenTree>) {
      return targets.map((target) => {
        const acc: JSONTokenTree = {};
        for (const gs of source.getAllGroups()) {
          if (gs.path.length === 0) continue;
          deepSetJSONValue(acc, gs.path, gs.getJSONProperties());
        }
        for (const ts of source.getAllTokens()) {
          deepSetJSONValue(acc, ts.path, ts.getJSONToken());
        }

        for (const gs of target.getAllGroups()) {
          if (gs.path.length === 0) continue;
          deepSetJSONValue(acc, gs.path, gs.getJSONProperties());
        }
        for (const ts of target.getAllTokens()) {
          deepSetJSONValue(acc, ts.path, ts.getJSONToken());
        }

        return parseDesignTokens(acc);
      });
    }

    function mergeStates(source: TokenTree, ...targets: Array<TokenTree>) {
      const acc: JSONTokenTree = source.toJSON();

      for (const target of targets) {
        for (const gs of target.getAllGroups()) {
          if (gs.path.length === 0) continue;
          const hasGroup = source.getGroup(gs.path);
          if (hasGroup) {
            throw new Error(
              `Group with path "${gs.stringPath}" already exists in source.`,
            );
          }
          deepSetJSONValue(acc, gs.path, gs.getJSONProperties());
        }
        for (const ts of target.getAllTokens()) {
          const hasToken = source.getToken(ts.path);
          if (hasToken) {
            throw new Error(
              `Token with path "${ts.stringPath}" already exists in source.`,
            );
          }
          deepSetJSONValue(acc, ts.path, ts.getJSONToken());
        }
      }

      return parseDesignTokens(acc);
    }

    function mergeTrees(
      source: JSONTokenTree,
      ...targets: Array<JSONTokenTree>
    ) {
      const acc = globalThis.structuredClone(source);

      for (const target of targets) {
        traverseJSONValue(target, (value, path) => {
          if (
            arrayEndsWith(path, '$description') ||
            arrayEndsWith(path, '$extensions')
          ) {
            return false;
          }

          if (matchIsToken(value)) {
            const hasValue = getJSONValue(acc, path);

            if (hasValue) {
              throw new Error(
                `Token with path "${path}" already exists in source.`,
              );
            }

            deepSetJSONValue(acc, path, globalThis.structuredClone(value));
            return false;
          } else if (matchIsGroup(value)) {
            const { $type, $description, $extensions } = value;

            if (path.length === 0) {
              if ($type || $description || $extensions) {
                throw new Error(
                  `Target root group cannot have $type, $description or $extensions.`,
                );
              }

              return true;
            }

            const hasValue = getJSONValue(acc, path);
            if (hasValue) {
              throw new Error(
                `Group with path "${path}" already exists in source.`,
              );
            }

            deepSetJSONValue(acc, path, { $type, $description, $extensions });
            return true;
          }
          return false;
        });
      }

      return acc;
    }

    const mergedWithModes = mergeWithModes([
      { name: 'light', tree: light },
      { name: 'dark', tree: dark },
    ]);

    const lightMerged = mergeStates(commonState, mergedWithModes.light);

    const mergedTrees = mergeTrees(common, light);

    type Select = {
      fromSet: string;
      where?: Array<Array<string>>;
    };

    type TokensLibrary = {
      sets: Array<{
        name: string;
        content: JSONTokenTree;
      }>;
      themes: Array<{
        name: string;
        modes: Array<{
          name: string;
          take: Array<{
            select: Array<Select>;
            intent: 'export' | 'reference';
          }>;
        }>;
      }>;
    };

    type CSSExporter = {
      files: Array<{
        name: string;
        body: Array<{
          scope: string;
          select: Array<Select>;
        }>;
      }>;
    };

    const library: TokensLibrary = {
      sets: [
        {
          name: 'Light',
          content: {},
        },
        {
          name: 'Dark',
          content: {},
        },
        {
          name: 'Semantic',
          content: {},
        },
      ],
      themes: [
        {
          name: 'Color scheme',
          modes: [
            {
              name: 'light',
              take: [
                {
                  select: [
                    {
                      fromSet: 'Colors',
                      where: [['*']],
                    },
                  ],
                  intent: 'export',
                },
              ],
            },
          ],
        },
      ],
    };

    const config: CSSExporter = {
      files: [
        {
          name: 'colors.css',
          body: [
            {
              scope: ':root',
              select: [
                {
                  fromSet: 'Light',
                  where: [['color', '*']],
                },
              ],
            },
            {
              scope: ':root[data-theme="dark"]',
              select: [
                {
                  fromSet: 'Dark',
                  where: [['color', '*']],
                },
              ],
            },
          ],
        },
      ],
    };
  });
});
