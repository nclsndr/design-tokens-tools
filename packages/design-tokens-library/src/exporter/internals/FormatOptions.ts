import { Case } from './toCase.js';

export type TokenNameFormatOptions = {
  toCase?: Case;
  joinWith?: string;
  template?: string;
};
export type TokenValueFormatOptions = {
  resolveAtDepth?: number | 'infinity';
};
export type FormatOptions = {
  token?: {
    name?: TokenNameFormatOptions;
    value?: TokenValueFormatOptions;
  };
};
