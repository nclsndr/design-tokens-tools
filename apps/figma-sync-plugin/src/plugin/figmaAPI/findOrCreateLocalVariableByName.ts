import { VariableCollection } from '@figma/plugin-typings/plugin-api-standalone';

export async function findOrCreateLocalVariableByName(params: {
  name: string;
  resolvedType: VariableResolvedDataType;
  collection: VariableCollection;
  valuesByMode?: Record<string, VariableValue>;
}): Promise<Variable> {
  const maybeVariable = await figma.variables
    .getLocalVariablesAsync()
    .then((variables) =>
      variables.find(
        (variable) =>
          variable.name === params.name &&
          variable.variableCollectionId === params.collection.id
      )
    );

  let variable: Variable;
  if (maybeVariable) {
    variable = maybeVariable;
  } else {
    variable = figma.variables.createVariable(
      params.name,
      params.collection,
      params.resolvedType
    );
  }

  if (params.valuesByMode) {
    for (const [modeId, value] of Object.entries(params.valuesByMode)) {
      variable.setValueForMode(modeId, value);
    }
  }

  return variable;
}
