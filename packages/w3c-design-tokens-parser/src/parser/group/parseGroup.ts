import { Result } from '@swan-io/boxed';

import { parseTreeNodeExtensions } from '../tree/parseTreeNodeExtensions.js';
import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedGroup } from '../internals/AnalyzedGroup.js';
import { AnalyzerContext } from '../internals/AnalyzerContext.js';
import { parseTreeNode } from '../tree/parseTreeNode.js';
import { parseTreeNodeDescription } from '../tree/parseTreeNodeDescription.js';
import { parseTokenTypeName } from '../../definitions/parseTokenTypeName.js';

export function parseGroup(
  value: object,
  ctx: AnalyzerContext,
): Result<AnalyzedGroup, Array<ValidationError>> {
  return parseTreeNode(value, ctx).flatMap((node) => {
    const { $type, $description, $extensions, ...rest } = node;

    const validationErrors: ValidationError[] = [];

    return Result.all([
      parseTokenTypeName($type, {
        allowUndefined: true,
        varName: `${ctx.varName}.$type`,
        path: ctx.path,
        nodeKey: '$type',
      }).tapError((e) => validationErrors.push(...e)),
      parseTreeNodeDescription($description, {
        varName: `${ctx.varName}.$description`,
        path: ctx.path,
        nodeKey: '$description',
      }).tapError((e) => validationErrors.push(...e)),
      parseTreeNodeExtensions($extensions, {
        varName: `${ctx.varName}.$extensions`,
        path: ctx.path,
        nodeKey: '$extensions',
      }).tapError((e) => validationErrors.push(...e)),
    ])
      .flatMap(([type, description, extensions]) => {
        return Result.Ok({
          path: ctx.path,
          tokenType: type,
          childrenCount: Object.keys(rest).length,
          description,
          extensions,
        });
      })
      .flatMapError((e) => {
        return Result.Error(validationErrors);
      });
  });
}
