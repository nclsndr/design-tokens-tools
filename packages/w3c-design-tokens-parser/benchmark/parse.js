import { parseDesignTokens } from '../dist/index.js';

import { radixColorTokens, aliasesToRadixColors } from './seed/index.js';

const tokenTree = parseDesignTokens({
  ...radixColorTokens,
  ...aliasesToRadixColors,
});

console.log('tokenTree:', tokenTree.summary);
