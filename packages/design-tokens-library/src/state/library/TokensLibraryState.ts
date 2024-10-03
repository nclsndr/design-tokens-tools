import { TreeState } from '../tree/TreeState.js';
import { Option } from 'effect';
import { SelectInLibrary } from '../../exporter/internals/Select.js';
import {
  LibraryCollection,
  LibraryCollectionMode,
} from './LibraryCollection.js';

export class TokensLibraryState {
  readonly #treeStates: Map<string, TreeState> = new Map();
  readonly #collections: Map<string, LibraryCollection> = new Map();

  get treeStatesMap() {
    return this.#treeStates;
  }
  get collectionsMap() {
    return this.#collections;
  }

  addTreeState(treeState: TreeState) {
    this.#treeStates.set(treeState.treeName, treeState);
  }

  addCollection(collection: LibraryCollection) {
    this.#collections.set(collection.name, collection);
  }

  getTreeState(name: string): Option.Option<TreeState> {
    const maybeTreeState = this.#treeStates.get(name);
    if (maybeTreeState === undefined) {
      return Option.none();
    }
    return Option.some(maybeTreeState);
  }

  getCollectionMode(
    name: string,
    mode: string,
  ): Option.Option<LibraryCollectionMode> {
    const maybeCollection = this.#collections.get(name);
    if (maybeCollection === undefined) {
      return Option.none();
    }
    const maybeMode = maybeCollection.modes.get(mode);
    if (maybeMode === undefined) {
      return Option.none();
    }
    return Option.some(maybeMode);
  }

  selectTokens(selects: Array<SelectInLibrary>) {
    return selects.flatMap((select) => {
      switch (select.type) {
        case 'tokenTree': {
          return Option.match(this.getTreeState(select.name), {
            onSome: (treeState) =>
              treeState.selectTokenStates({
                tokenTypes: select.tokenTypes,
                where: select.where,
              }),
            onNone: () => [],
          });
        }
        case 'collection': {
          return Option.match(
            this.getCollectionMode(select.name, select.mode),
            {
              onSome: (mode) =>
                mode.treeState.selectTokenStates({
                  tokenTypes: select.tokenTypes,
                  where: select.where,
                }),
              onNone: () => [],
            },
          );
        }
        default: {
          throw new Error(
            `Unrecognized select type: "${(select as any).type}".`,
          );
        }
      }
    });
  }
}
