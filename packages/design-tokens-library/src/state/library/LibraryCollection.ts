import { Json as JSONTypes } from 'design-tokens-format-module';
import { TreeState } from '../tree/TreeState.js';

export type LibraryCollectionMode = {
  name: string;
  jsonTree: JSONTypes.Object;
  treeState: TreeState;
};

export type LibraryCollection = {
  name: string;
  modes: Map<string, LibraryCollectionMode>;
};
