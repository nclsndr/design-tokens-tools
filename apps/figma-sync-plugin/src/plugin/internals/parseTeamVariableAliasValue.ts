const prefix = 'VariableID:';
const prefixLength = prefix.length;

export function parseTeamVariableAliasValue(id: string): {
  id: string;
  key: string;
} {
  if (!id.startsWith(prefix)) {
    throw new Error(
      `DESIGN ERROR :: id "${id}" does not start with "${prefix}".`
    );
  }
  const sliced = id.slice(prefixLength);
  const split = sliced.split('/');
  if (split.length !== 2) {
    throw new Error(
      `DESIGN ERROR :: sliced id "${sliced}" does not have 2 parts. Got ${split.length}.`
    );
  }

  return {
    id: split[1],
    key: split[0],
  };
}
