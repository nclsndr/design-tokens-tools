export type {
  PickTokenTypeAliasingCompatibilityEntry,
  TokenTypeAliasingCompatibilityMap,
} from './definitions/TokenTypeAliasingCompatibility.js';

export * as parser from './parser/export.js';

export type { AnalyzedGroup } from './parser/group/AnalyzedGroup.js';
export type { ResolutionType } from './parser/token/recursivelyResolveTokenType.js';
export type { AnalyzedValue } from './parser/token/AnalyzedToken.js';
export type { AnalyzerContext } from './parser/utils/AnalyzerContext.js';
export type {
  ReferenceResolutionTrace,
  LinkedReferenceResolutionTrace,
  UnlinkedReferenceResolutionTrace,
} from './parser/token/recursivelyResolveAnalyzedToken.js';

export {
  type ParsedJSONTokenTree,
  parseJSONTokenTree,
} from './parser/parseJSONTokenTree.js';
