import { deepSetJSONValue } from '@nclsndr/design-tokens-utils';

import { makeHandler } from '@plugin/internals/makeHandler';
import { Registry } from '@plugin/internals/registry';
import { convertLocalVariablesToJSONDesignTokens } from '@plugin/internals/convertLocalVariablesToJSONDesignTokens';
import { convertPaintStylesToJSONDesignTokens } from '@plugin/internals/convertPaintStylesToJSONDesignTokens';

export const getVariablesAndCollectionsHandler = makeHandler(
  'GET_VARIABLES_AND_COLLECTIONS',
  async () => {
    // Load all local variables
    const localVariables = await figma.variables.getLocalVariablesAsync();
    const localCollections =
      await figma.variables.getLocalVariableCollectionsAsync();

    // Load all variables from accessible library collections
    const libraryVariableCollections =
      await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    const libraryVariables = await Promise.all(
      libraryVariableCollections.flatMap((teamCollection) =>
        figma.teamLibrary
          .getVariablesInLibraryCollectionAsync(teamCollection.key)
          .then((libraryVariables) =>
            libraryVariables.flatMap((variable) => ({
              ...variable,
              collection: teamCollection,
            }))
          )
      )
    ).then((results) => results.flat());

    // Load all local styles
    const localPaintStyles = await figma.getLocalPaintStylesAsync();
    const effectStyles = await figma.getLocalEffectStylesAsync();
    const localTextStyles = await figma.getLocalTextStylesAsync();

    // Build up registries for improved lookup in variables
    const localVariablesRegistry = new Registry({ on: 'id' }, localVariables);
    const localCollectionsRegistry = new Registry(
      { on: 'id' },
      localCollections
    );
    const libraryVariablesRegistry = new Registry(
      { on: 'key' },
      libraryVariables
    );

    // Convert local variables and collections to design tokens
    const designTokensFromVariables = convertLocalVariablesToJSONDesignTokens(
      localCollections,
      { localVariablesRegistry, libraryVariablesRegistry }
    );

    const designTokensFromPaintStyles = convertPaintStylesToJSONDesignTokens(
      localPaintStyles,
      {
        localVariablesRegistry,
        localCollectionsRegistry,
      }
    );
    // TODO @Nico: NO CONSOLE
    console.log('designTokensFromPaintStyles:', designTokensFromPaintStyles);

    return [
      {
        variables: ['dumb'],
        collections: ['Collection 1', 'Collection 2', 'Collection 3'],
      },
      undefined,
    ];
  }
);
