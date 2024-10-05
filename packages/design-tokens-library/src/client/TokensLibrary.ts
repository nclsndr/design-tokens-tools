import { Either, Option } from 'effect';
import { Json as JSONTypes, JSONTokenTree } from 'design-tokens-format-module';
import { mergeJSONTrees } from '@nclsndr/design-tokens-utils';

import { buildTreeState } from '../state/buildTreeState.js';
import { tokenStatesToJSON } from '../utils/tokenStatesToJSON.js';
import { checkCollectionModesCompatibility } from '../state/library/checkCollectionModesCompatibility.js';
import { Exporter } from '../exporter/internals/Exporter.js';
import { SelectTree } from '../exporter/internals/Select.js';
import { TokensLibraryState } from '../state/library/TokensLibraryState.js';

export type SourceCollection = {
  name: string;
  modes: Array<{
    name: string;
    tokenTrees: Array<SelectTree>;
  }>;
};
export type SourceTokenTree = {
  name: string;
  jsonTree: string | JSONTypes.Object;
};

export class TokensLibrary {
  readonly #state: TokensLibraryState = new TokensLibraryState();

  constructor(
    tokenTrees: Array<SourceTokenTree>,
    collections: Array<SourceCollection>,
  ) {
    for (const tree of tokenTrees) {
      this.addTokenTree(tree);
    }
    for (const collection of collections) {
      this.addCollection(collection);
    }
  }

  /**
   * Access the underlying state of the library.
   * @internal
   */
  get state() {
    return this.#state;
  }

  /**
   * Add a token tree to the library.
   * @param sourceTokenTree
   */
  addTokenTree(sourceTokenTree: SourceTokenTree) {
    const treeState = buildTreeState(sourceTokenTree.jsonTree, {
      name: sourceTokenTree.name,
      throwOnError: true,
    });

    this.#state.addTreeState(treeState);
  }

  /**
   * Add a collection to the library.
   * @param collection
   */
  addCollection(collection: SourceCollection) {
    const mergedTreesWithStates = collection.modes.map((mode) => {
      const jsonTokenTrees = mode.tokenTrees.flatMap((selectTree) =>
        Option.match(this.#state.getTreeState(selectTree.name), {
          onSome: (treeState) =>
            tokenStatesToJSON(
              treeState.selectTokenStates({
                tokenTypes: selectTree.tokenTypes,
                where: selectTree.where,
              }),
            ),
          onNone: () => {
            throw new Error(
              `Set "${selectTree.name}" does not exist in library.`,
            );
          },
        }),
      );

      const mergedJSONTree: JSONTokenTree =
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

      const treeState = buildTreeState(mergedJSONTree, {
        throwOnError: true,
      });

      return {
        name: mode.name,
        jsonTree: mergedJSONTree,
        treeState,
      };
    });

    Option.tap(
      checkCollectionModesCompatibility(mergedTreesWithStates),
      (message) => {
        throw new Error(message);
      },
    );

    this.#state.addCollection({
      name: collection.name,
      modes: new Map(mergedTreesWithStates.map((mode) => [mode.name, mode])),
    });
  }

  /**
   * Export parts of the library using the provided exporter.
   * @param exporter
   */
  export(exporter: Exporter) {
    return exporter(this.#state);
  }

  /**
   * Override console.log in Node.js environment
   * @param _depth
   * @param _opts
   */
  [Symbol.for('nodejs.util.inspect.custom')](_depth: unknown, _opts: unknown) {
    return `TokenLibrary {
  trees: [${[...this.state.treeStatesMap.entries()].map(([name]) => `"${name}"`).join(',  ')}],
  collections: [${[...this.state.collectionsMap.keys()].map((name) => `"${name}"`).join(',  ')}]
}`;
  }
}
