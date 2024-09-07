import { atom } from 'jotai';
import { Result } from '@swan-io/boxed';
import { parseDesignTokens, Client } from '@nclsndr/w3c-design-tokens-parser';

import { stringTokenTreeAtom } from './stringTokenTree.ts';

export const parsedTokenTreeAtom = atom<Result<Client.TokenTree, string>>(
  (get) => {
    const stringTokenTree = get(stringTokenTreeAtom);

    if (stringTokenTree === undefined) {
      return Result.Error('No input provided');
    }

    try {
      const parsed = JSON.parse(stringTokenTree);
      if (parsed === null || typeof parsed !== 'object') {
        return Result.Error('Invalid JSON Tokens');
      }
      return Result.Ok(parseDesignTokens(parsed));
    } catch (error) {
      return Result.Error('Invalid JSON Tokens');
    }
  },
);

export const hasTokenTreeErrorsAtom = atom((get) => {
  const parsedTokenTree = get(parsedTokenTreeAtom);
  return parsedTokenTree.isError();
});
