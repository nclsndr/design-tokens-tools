export async function findOrCreateLocalCollectionModesByName(
  collectionId: string,
  modeNames: Array<string>
): Promise<
  Array<{
    modeId: string;
    name: string;
  }>
> {
  const maybeCollection = await figma.variables.getVariableCollectionByIdAsync(
    collectionId
  );

  if (maybeCollection === null) {
    throw new Error(`Collection with id ${collectionId} not found`);
  }

  return modeNames.map((modeName) => {
    const maybeMode = maybeCollection.modes.find(
      (mode) => mode.name === modeName
    );

    if (maybeMode) {
      return maybeMode;
    }
    return {
      name: modeName,
      modeId: maybeCollection.addMode(modeName),
    };
  });
}
