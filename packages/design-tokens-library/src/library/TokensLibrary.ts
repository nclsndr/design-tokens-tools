import { Either, Option } from 'effect';
import { Json as JSONTypes } from 'design-tokens-format-module';
import { parser } from '@nclsndr/w3c-design-tokens-parser';
import { mergeJSONTrees } from '@nclsndr/design-tokens-utils';

import { TreeState } from '../state/TreeState.js';
import { buildTreeState } from '../state/buildTreeState.js';
import { tokenStatesToJSON } from '../utils/tokenStatesToJSON.js';
import { checkThemeModesCompatibility } from './internals/checkThemeModesCompatibility.js';
import { Exporter } from './internals/Exporter.js';
import { SelectInLibrary, SelectSet } from './internals/Select.js';

export type SourceTheme = {
  name: string;
  modes: Array<{
    name: string;
    sets: Array<SelectSet>;
  }>;
};
export type SourceTokenSet = {
  name: string;
  jsonTree: string | JSONTypes.Object;
};

type LibraryTokenSet = {
  name: string;
  jsonTree: JSONTypes.Object;
  treeState: TreeState;
};
type LibraryThemeMode = {
  name: string;
  jsonTree: JSONTypes.Object;
  treeState: TreeState;
};
type LibraryTheme = {
  name: string;
  modes: Map<string, LibraryThemeMode>;
};
export class TokensLibrary {
  readonly #sets: Map<string, LibraryTokenSet> = new Map();
  readonly #themes: Map<string, LibraryTheme> = new Map();

  constructor(tokenSets: Array<SourceTokenSet>, themes: Array<SourceTheme>) {
    for (const set of tokenSets) {
      this.addSet(set);
    }
    for (const theme of themes) {
      this.addTheme(theme);
    }
  }

  addSet(set: SourceTokenSet) {
    const jsonTree = Either.getOrThrow(
      parser.parseRawInput(set.jsonTree, {
        varName: '[root]',
        nodeId: '',
        path: [],
      }),
    );

    const treeState = buildTreeState(jsonTree);
    const errors = treeState.validationErrors;
    if (errors.size > 0) {
      throw new Error(
        `Set "${set.name}" has errors:\n  - ${errors.nodes.map((e) => e.message).join('\n  - ')}`,
      );
    }

    this.#sets.set(set.name, {
      name: set.name,
      jsonTree,
      treeState,
    });
  }

  addTheme(theme: SourceTheme) {
    const mergedTreesWithStates = theme.modes.map((mode) => {
      const jsonTokenTrees = mode.sets.flatMap((setFilter) =>
        Option.match(this.getSet(setFilter.name), {
          onSome: (set) =>
            tokenStatesToJSON(
              set.treeState.selectTokens({
                tokenTypes: setFilter.tokenTypes,
                where: setFilter.where,
              }),
            ),
          onNone: () => {
            throw new Error(
              `Set "${setFilter.name}" does not exist in library.`,
            );
          },
        }),
      );

      const mergedJSONTree =
        jsonTokenTrees.length > 1
          ? Either.match(
              mergeJSONTrees(
                // @ts-expect-error - spread ≠ [A,...B]
                ...jsonTokenTrees,
              ),
              {
                onRight: (merged) => merged,
                onLeft: (message) => {
                  throw Error(message);
                },
              },
            )
          : jsonTokenTrees[0];

      const treeState = buildTreeState(mergedJSONTree);
      const errors = treeState.validationErrors;
      if (errors.size > 0) {
        throw new Error(`Set "${theme.name}" has errors: ${errors}`);
      }

      return {
        name: mode.name,
        jsonTree: mergedJSONTree,
        treeState,
      };
    });

    Option.tap(
      checkThemeModesCompatibility(mergedTreesWithStates),
      (message) => {
        throw new Error(message);
      },
    );

    this.#themes.set(theme.name, {
      name: theme.name,
      modes: new Map(mergedTreesWithStates.map((mode) => [mode.name, mode])),
    });
  }

  getSet(name: string): Option.Option<LibraryTokenSet> {
    const maybeSet = this.#sets.get(name);
    if (maybeSet === undefined) {
      return Option.none();
    }
    return Option.some(maybeSet);
  }

  getThemeMode(name: string, mode: string): Option.Option<LibraryThemeMode> {
    const maybeTheme = this.#themes.get(name);
    if (maybeTheme === undefined) {
      return Option.none();
    }
    const maybeMode = maybeTheme.modes.get(mode);
    if (maybeMode === undefined) {
      return Option.none();
    }
    return Option.some(maybeMode);
  }

  selectTokens(selects: Array<SelectInLibrary>) {
    return selects.flatMap((select) => {
      switch (select.type) {
        case 'set': {
          return Option.match(this.getSet(select.name), {
            onSome: (set) =>
              set.treeState.selectTokens({
                tokenTypes: select.tokenTypes,
                where: select.where,
              }),
            onNone: () => [],
          });
        }
        case 'theme': {
          return Option.match(this.getThemeMode(select.name, select.mode), {
            onSome: (mode) =>
              mode.treeState.selectTokens({
                tokenTypes: select.tokenTypes,
                where: select.where,
              }),
            onNone: () => [],
          });
        }
        default: {
          throw new Error(
            `Unrecognized select type: "${(select as any).type}".`,
          );
        }
      }
    });
  }

  export(exporter: Exporter) {
    return exporter(this);
  }

  // Override console.log in Node.js environment
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `TokenLibrary {
  sets: [${[...this.#sets.entries()].map(([name]) => `"${name}"`).join(',  ')}],
  themes: [${[...this.#themes.keys()].map((name) => `"${name}"`).join(',  ')}]
}`;
  }
}
