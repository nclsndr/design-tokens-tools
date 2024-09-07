import { atom } from 'jotai';
import { splitAtom } from 'jotai/utils';

export type FileConfiguration = {
  isCardOpened: boolean;
  filename: string;
  extension: string;
  selections: Array<{
    regex: string;
    types: Array<string>;
  }>;
};

export const fileConfigurationsAtom = atom<Array<FileConfiguration>>([
  {
    isCardOpened: true,
    filename: '',
    extension: '',
    selections: [],
  },
]);

export const fileConfigurationsSplitAtom = splitAtom(fileConfigurationsAtom);
