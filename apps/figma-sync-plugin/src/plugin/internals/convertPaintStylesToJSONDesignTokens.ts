import { Registry } from '@plugin/internals/registry';
import { makeDesignTokenAliasValue } from '@plugin/internals/makeDesignTokenAliasValue';
import { DesignToken } from 'design-tokens-format-module';
import { isFigmaVariableAlias } from '@plugin/internals/isFigmaVariableAlias';

export function convertPaintStylesToJSONDesignTokens(
  paintStyles: Array<PaintStyle>,
  ctx: {
    localVariablesRegistry: Registry<'id', Variable>;
    localCollectionsRegistry: Registry<'id', VariableCollection>;
  }
) {
  return paintStyles.reduce<
    Array<{
      path: Array<string>;
      jsonToken: DesignToken;
    }>
  >((acc, paintStyle) => {
    for (const [index, paint] of paintStyle.paints.entries()) {
      let $value: any;

      switch (paint.type) {
        case 'SOLID': {
          break;
        }
        case 'GRADIENT_LINEAR': {
          break;
        }
        // TODO @Nico: manage unsupported paint types
      }

      const boundVariable = paintStyle.boundVariables?.paints?.[index];
      if (isFigmaVariableAlias(boundVariable)) {
        const resolvedVariable = ctx.localVariablesRegistry.getOne(
          boundVariable.id
        );
        if (!resolvedVariable) {
          throw new Error(
            `DESIGN ERROR :: Variable with id ${boundVariable.id} not found from alias resolution in local variables`
          );
        }

        $value = makeDesignTokenAliasValue(resolvedVariable.name);
      }
      // TODO @Nico: continue implementation
    }

    return acc;
  }, []);
}
