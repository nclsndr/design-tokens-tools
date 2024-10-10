import { hexadecimalToRGB } from '@common/utils/color/hexadecimalToRGB';
import { makeHandler } from '@plugin/internals/makeHandler';
import { findOrCreateLocalCollectionByName } from '@plugin/figmaAPI/findOrCreateLocalCollectionByName';
import { findOrCreateLocalVariableByName } from '@plugin/figmaAPI/findOrCreateLocalVariableByName';

async function seedBaseCollection() {
  const collection = await findOrCreateLocalCollectionByName(
    'Base (single mode)',
    {
      modes: ['base'],
    }
  );
  const spacing1 = await findOrCreateLocalVariableByName({
    name: 'Spacing/1',
    collection: collection,
    resolvedType: 'FLOAT',
    valuesByMode: {
      [collection.modes[0].modeId]: 4,
    },
  });
  const spacing2 = await findOrCreateLocalVariableByName({
    name: 'Spacing/2',
    collection: collection,
    resolvedType: 'FLOAT',
    valuesByMode: {
      [collection.modes[0].modeId]: 8,
    },
  });

  return {
    baseCollection: collection,
    spacing1,
    spacing2,
  };
}

async function seedColorSchemeCollection() {
  const collection = await findOrCreateLocalCollectionByName(
    'Color scheme (light/dark)',
    {
      modes: ['light', 'dark'],
    }
  );

  const gray1 = await findOrCreateLocalVariableByName({
    name: 'Gray/1',
    collection: collection,
    resolvedType: 'COLOR',
    valuesByMode: {
      [collection.modes[0].modeId]: hexadecimalToRGB('#fcfcfc'),
      [collection.modes[1].modeId]: hexadecimalToRGB('#111111'),
    },
  });
  const blue11 = await findOrCreateLocalVariableByName({
    name: 'Blue/11',
    collection: collection,
    resolvedType: 'COLOR',
    valuesByMode: {
      [collection.modes[0].modeId]: hexadecimalToRGB('#0d74ce'),
      [collection.modes[1].modeId]: hexadecimalToRGB('#70b8ff'),
    },
  });

  return {
    colorSchemeCollection: collection,
    gray1,
    blue11,
  };
}

async function seedSemanticCollection(variables: {
  gray1: Variable;
  blue11: Variable;
  spacing2: Variable;
}) {
  const collection = await findOrCreateLocalCollectionByName('Semantic', {
    modes: ['base'],
  });

  await findOrCreateLocalVariableByName({
    name: 'Card/Background',
    collection: collection,
    resolvedType: 'COLOR',
    valuesByMode: {
      [collection.modes[0].modeId]: {
        type: 'VARIABLE_ALIAS',
        id: variables.gray1.id,
      },
    },
  });

  await findOrCreateLocalVariableByName({
    name: 'Card/Padding',
    collection: collection,
    resolvedType: 'FLOAT',
    valuesByMode: {
      [collection.modes[0].modeId]: {
        type: 'VARIABLE_ALIAS',
        id: variables.spacing2.id,
      },
    },
  });

  await findOrCreateLocalVariableByName({
    name: 'Text/Active',
    collection: collection,
    resolvedType: 'COLOR',
    valuesByMode: {
      [collection.modes[0].modeId]: {
        type: 'VARIABLE_ALIAS',
        id: variables.blue11.id,
      },
    },
  });
}

export const seedTestingDataHandler = makeHandler(
  'SEED_TESTING_DATA',
  async () => {
    const { spacing2 } = await seedBaseCollection();
    const { gray1, blue11 } = await seedColorSchemeCollection();

    await seedSemanticCollection({ gray1, blue11, spacing2 });

    return [null, undefined];
  }
);
