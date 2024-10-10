import { VariableCollection } from '@figma/plugin-typings/plugin-api-standalone';

export async function findOrCreateLocalCollectionByName(
  name: string,
  params?: {
    modes?: Array<string>;
  }
): Promise<VariableCollection> {
  const maybeCollection = await figma.variables
    .getLocalVariableCollectionsAsync()
    .then((collections) =>
      collections.find((collection) => collection.name === name)
    );

  let collection: VariableCollection;
  if (maybeCollection) {
    collection = maybeCollection;
  } else {
    collection = figma.variables.createVariableCollection(name);

    for (const [index, mode] of (params?.modes || []).entries()) {
      // Collection is created with a default mode: 'Mode 1'
      if (index === 0) {
        collection.renameMode(collection.modes[0].modeId, mode);
      } else {
        collection.addMode(mode);
      }
    }
  }

  return collection;
}
