// Design tokens
export { mergeJSONTrees } from './designTokens/mergeJSONTrees.js';
export {
  matchTypeAgainstMapping,
  type TokenTypesMapping,
  type MatchTokenTypeAgainstMappingResult,
} from './designTokens/tokenTypesMapping.js';

// Error
export { ValidationError } from './error/validationError.js';

// Fixtures
export * as rawTokenFixtures from './fixtures/tokens.js';

// Generic
export { arrayEndsWith } from './generic/arrayEndsWith.js';
export { clamp } from './generic/clamp.js';
export { indentLines } from './generic/indentLines.js';
export { makeUniqueId } from './generic/makeUniqueId.js';

// JSON
export { deepSetJSONValue } from './json/deepSetJSONValue.js';
export { getJSONValue } from './json/getJSONValue.js';
export { JSONPath } from './json/JSONPath.js';
export { traverseJSONValue } from './json/traverseJSONValue.js';
