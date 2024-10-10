import { DesignToken } from 'design-tokens-format-module';

import { makeDesignTokenAliasValue } from '@plugin/internals/makeDesignTokenAliasValue';
import { Registry } from '@plugin/internals/registry';
import { rgbToHexadecimal } from '@common/utils/color/rgbToHexadecimal';
import { captureVariableIdFromVariableAlias } from '@plugin/internals/captureVariableIdFromVariableAlias';
import { convertFigmaVariableTypeToDesignTokenTypeOption } from '@plugin/internals/convertFigmaVariableTypeToDesignTokenType';
import { parseFigmaVariableName } from '@plugin/internals/parseFigmaVariableName';
import { parseTeamVariableAliasValue } from '@plugin/internals/parseTeamVariableAliasValue';
import { ConversionError } from '@plugin/error/ConversionError';
import { makeDesignToken } from '@plugin/internals/makeDesignTokenPath';

export function convertLocalVariablesToJSONDesignTokens(
  localCollections: Array<VariableCollection>,
  ctx: {
    localVariablesRegistry: Registry<'id', Variable>;
    libraryVariablesRegistry: Registry<
      'key',
      LibraryVariable & { collection: LibraryVariableCollection }
    >;
    formatTokenTreeName?: (
      collection: VariableCollection,
      currentMode: VariableCollection['modes'][number]
    ) => string | undefined;
  }
) {
  const formatTokenTreeName =
    ctx.formatTokenTreeName ??
    ((collection, currentMode) =>
      `${collection.name}${
        collection.modes.length > 1 ? ` - ${currentMode.name}` : ''
      }`);

  return localCollections.flatMap((collection) =>
    collection.modes.map((mode) => {
      return {
        tokenTreeName: formatTokenTreeName(collection, mode),
        ...collection.variableIds.reduce<{
          tokens: Array<{
            path: Array<string>;
            jsonToken: DesignToken;
          }>;
          errors: Array<ConversionError>;
        }>(
          (acc, id) => {
            ctx.localVariablesRegistry.getOneOption(id).match({
              Some: (variable) =>
                convertFigmaVariableTypeToDesignTokenTypeOption(
                  variable.resolvedType
                ).match({
                  Some: ($type) => {
                    captureVariableIdFromVariableAlias(
                      variable.valuesByMode[mode.modeId]
                    ).match({
                      // Alias branch
                      Some: (resolvedVariableId) => {
                        ctx.localVariablesRegistry
                          .getOneOption(resolvedVariableId)
                          .match({
                            // Local alias branch
                            Some: (resolvedVariable) => {
                              acc.tokens.push({
                                path: parseFigmaVariableName(variable.name),
                                jsonToken: makeDesignToken({
                                  type: $type,
                                  value: makeDesignTokenAliasValue(
                                    resolvedVariable.name
                                  ),
                                  description: resolvedVariable.description,
                                }),
                              });
                            },
                            // Maybe library alias branch
                            None: () => {
                              const parsedVariableAliasValue =
                                parseTeamVariableAliasValue(resolvedVariableId);

                              ctx.libraryVariablesRegistry
                                .getOneOption(parsedVariableAliasValue.key)
                                .match({
                                  // Library alias branch
                                  Some: (libraryVariable) => {
                                    acc.tokens.push({
                                      path: parseFigmaVariableName(
                                        variable.name
                                      ),
                                      jsonToken: makeDesignToken({
                                        type: $type,
                                        value: makeDesignTokenAliasValue(
                                          libraryVariable.name
                                        ),
                                      }),
                                    });
                                  },
                                  // Finally not found branch
                                  None: () => {
                                    acc.errors.push(
                                      new ConversionError({
                                        message: `Variable with id "${resolvedVariableId}" not found from alias resolution in local and library variable collections.`,
                                        variableId: id,
                                        collectionId: collection.id,
                                        collectionName: collection.name,
                                        currentModeName: mode.name,
                                        currentModeId: mode.modeId,
                                      })
                                    );
                                  },
                                });
                            },
                          });
                      },
                      // Raw value branch
                      None: () => {
                        const initialValue = variable.valuesByMode[mode.modeId];
                        let $value;
                        switch (variable.resolvedType) {
                          case 'BOOLEAN': {
                            $value = !!initialValue ? 1 : 0;
                            break;
                          }
                          case 'COLOR': {
                            $value = rgbToHexadecimal(
                              (initialValue as any).r,
                              (initialValue as any).g,
                              (initialValue as any).b
                            );
                            break;
                          }
                          case 'FLOAT': {
                            $value = initialValue;
                            break;
                          }
                        }

                        acc.tokens.push({
                          path: parseFigmaVariableName(variable.name),
                          jsonToken: makeDesignToken({
                            type: $type,
                            value: $value,
                            description: variable.description,
                          }),
                        });
                      },
                    });
                  },
                  // Figma added a new type?
                  None: () => {
                    acc.errors.push(
                      new ConversionError({
                        message: `Variable "${variable.name}" with id "${id}" has unsupported type ${variable.resolvedType}`,
                        variableId: id,
                        collectionId: collection.id,
                        collectionName: collection.name,
                        currentModeName: mode.name,
                        currentModeId: mode.modeId,
                      })
                    );
                  },
                }),
              // Should never happen at runtime
              None: () => {
                acc.errors.push(
                  new ConversionError({
                    message: `DESIGN ERROR :: Variable with id ${id} not found in local variables.`,
                    variableId: id,
                    collectionId: collection.id,
                    collectionName: collection.name,
                    currentModeName: mode.name,
                    currentModeId: mode.modeId,
                  })
                );
              },
            });

            return acc;
          },
          { tokens: [], errors: [] }
        ),
      };
    })
  );
}
