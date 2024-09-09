import { performance } from 'node:perf_hooks';

import { parseDesignTokens } from '../dist/index.js';

import { radixColorTokens, aliasesToRadixColors } from './seed/index.js';

const start = performance.now();
const tokenTree = parseDesignTokens({
  ...radixColorTokens,
  ...aliasesToRadixColors,
});
const end = performance.now();

console.log(`Time taken to execute add function is ${end - start}ms.`);

console.log('tokenTree:', tokenTree.summary);
