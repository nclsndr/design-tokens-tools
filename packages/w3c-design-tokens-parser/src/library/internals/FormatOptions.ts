import { Case } from './toCase.js';

export type TokenNameFormatOptions = {
  nameCase?: Case;
  joinWith?: string;
  template?: string;
};
export type FormatOptions = {
  token?: TokenNameFormatOptions;
};
