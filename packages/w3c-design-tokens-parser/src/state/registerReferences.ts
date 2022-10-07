import { AnalyzedToken } from '../parser/internals/AnalyzedToken.js';
import { TreeState } from './TreeState.js';
import { findAnalyzedToken } from '../parser/internals/findAnalyzedToken.js';
import { recursivelyResolveAnalyzedToken } from '../parser/token/recursivelyResolveAnalyzedToken.js';
import { Reference } from './Reference.js';

// export function registerReferences(
//   analyzedToken: AnalyzedToken,
//   analyzedTokens: Array<AnalyzedToken>,
//   treeState: TreeState,
// ) {
//   for (const analyzedReference of analyzedToken.value.toReferences) {
//     findAnalyzedToken(analyzedTokens, analyzedReference.toTreePath).match({
//       Some: (foundAnalyzedToken) => {
//         const resolutionTraces = recursivelyResolveAnalyzedToken(
//           analyzedTokens,
//           foundAnalyzedToken,
//           analyzedReference.fromTreePath,
//           analyzedReference.fromValuePath,
//         );
//
//         const reference = new Reference(
//           analyzedToken.path,
//           analyzedReference.fromValuePath,
//           analyzedReference.toTreePath,
//           resolutionTraces,
//         );
//
//         treeState.references.register(reference);
//       },
//       None: () => {
//         const reference = new Reference(
//           analyzedToken.path,
//           analyzedReference.fromValuePath,
//           analyzedReference.toTreePath,
//           [
//             {
//               status: 'unresolvable',
//               fromTreePath: analyzedReference.fromValuePath,
//               fromValuePath: analyzedReference.fromValuePath,
//               toTreePath: analyzedReference.toTreePath,
//             },
//           ],
//         );
//
//         treeState.references.register(reference);
//       },
//     });
//   }
// }
