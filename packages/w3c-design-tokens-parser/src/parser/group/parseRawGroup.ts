import { Result } from '@swan-io/boxed';

import { parseTreeNodeExtensions } from '../tree/parseTreeNodeExtensions.js';
import { ValidationError } from '../../utils/validationError.js';
import { AnalyzedGroup } from './AnalyzedGroup.js';
import { AnalyzerContext } from '../utils/AnalyzerContext.js';
import { parseTreeNode } from '../tree/parseTreeNode.js';
import { parseTreeNodeDescription } from '../tree/parseTreeNodeDescription.js';
import { parseTokenTypeName } from '../../definitions/parseTokenTypeName.js';

export function parseRawGroup(
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
        nodeId: ctx.nodeId,
        path: ctx.path,
        nodeKey: '$type',
      }).tapError((e) => validationErrors.push(...e)),
      parseTreeNodeDescription($description, {
        varName: `${ctx.varName}.$description`,
        nodeId: ctx.nodeId,
        path: ctx.path,
        nodeKey: '$description',
      }).tapError((e) => validationErrors.push(...e)),
      parseTreeNodeExtensions($extensions, {
        varName: `${ctx.varName}.$extensions`,
        nodeId: ctx.nodeId,
        path: ctx.path,
        nodeKey: '$extensions',
      }).tapError((e) => validationErrors.push(...e)),
    ])
      .flatMap(([type, description, extensions]) => {
        return Result.Ok({
          id: ctx.nodeId,
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
