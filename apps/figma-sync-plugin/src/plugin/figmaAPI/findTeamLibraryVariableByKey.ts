export async function findTeamLibraryVariableByKey(
  key: string
): Promise<LibraryVariable | undefined> {
  const teamCollections =
    await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();

  for (const teamCollection of teamCollections) {
    const libraryVariables =
      await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
        teamCollection.key
      );
    const libraryVariable = libraryVariables.find(
      (variable) => variable.key === key
    );
    if (libraryVariable) {
      return libraryVariable;
    }
  }
  return undefined;
}
