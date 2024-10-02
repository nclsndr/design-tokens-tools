import { describe, it, expect } from 'vitest';
import { Effect, Exit } from 'effect';

import { parseJSONTokenTree } from '../../../src/parser/parseJSONTokenTree';

import { recursivelyResolveAnalyzedToken } from '../../../src/parser/token/recursivelyResolveAnalyzedToken';

describe('recursivelyResolveAnalyzedToken', () => {
  it('should list a top level linked reference', () => {
    const tokenTree = {
      aColor: {
        $type: 'color',
        $value: '#ff0000',
      },
      bColor: {
        $type: 'color',
        $value: '{aColor}',
      },
    };

    const [analyzedTokens, tokenErrors] = Exit.match(
      Effect.runSyncExit(parseJSONTokenTree(tokenTree)),
      {
        onSuccess: ({ analyzedTokens, tokenErrors }) => [
          analyzedTokens,
          tokenErrors,
        ],
        onFailure: (error) => {
          throw error;
        },
      },
    );

    expect(analyzedTokens).toHaveLength(2);
    expect(analyzedTokens[1].path).toStrictEqual(['bColor']);

    const steps = recursivelyResolveAnalyzedToken(
      analyzedTokens ?? [],
      analyzedTokens[1],
    );

    expect(
      steps.map((t) => ({
        ...t,
        fromTreePath: t.fromTreePath.array,
        fromValuePath: t.fromValuePath.array,
        toTreePath: t.toTreePath.array,
      })),
    ).toStrictEqual([
      {
        status: 'linked',
        fromTreePath: ['bColor'],
        fromValuePath: [],
        targetType: 'color',
        toTreePath: ['aColor'],
      },
    ]);
  });
  it('should list a top level unlinked reference', () => {
    const tokenTree = {
      semantic: {
        primary: {
          $type: 'color',
          $value: '{base.blue}',
        },
      },
    };

    const [analyzedTokens, tokenErrors] = Exit.match(
      Effect.runSyncExit(parseJSONTokenTree(tokenTree)),
      {
        onSuccess: ({ analyzedTokens, tokenErrors }) => [
          analyzedTokens,
          tokenErrors,
        ],
        onFailure: (error) => {
          throw error;
        },
      },
    );

    expect(analyzedTokens).toHaveLength(1);
    expect(analyzedTokens[0].path).toStrictEqual(['semantic', 'primary']);

    const steps = recursivelyResolveAnalyzedToken(
      analyzedTokens ?? [],
      analyzedTokens[0],
    );

    expect(
      steps.map((t) => ({
        ...t,
        fromTreePath: t.fromTreePath.array,
        fromValuePath: t.fromValuePath.array,
        toTreePath: t.toTreePath.array,
      })),
    ).toStrictEqual([
      {
        status: 'unlinked',
        fromTreePath: ['semantic', 'primary'],
        fromValuePath: [],
        toTreePath: ['base', 'blue'],
      },
    ]);
  });
  it('should list a deep top level linked reference', () => {
    const tokenTree = {
      base: {
        blue: {
          $type: 'color',
          $value: '#ff0000',
        },
      },
      semantic: {
        primary: {
          $value: '{base.blue}',
        },
        solid: {
          $value: '{semantic.primary}',
        },
        accent: {
          $value: '{semantic.solid}',
        },
      },
    };

    const [analyzedTokens, tokenErrors] = Exit.match(
      Effect.runSyncExit(parseJSONTokenTree(tokenTree)),
      {
        onSuccess: ({ analyzedTokens, tokenErrors }) => [
          analyzedTokens,
          tokenErrors,
        ],
        onFailure: (error) => {
          throw error;
        },
      },
    );

    expect(analyzedTokens).toHaveLength(4);
    expect((analyzedTokens ?? [])[3].path).toStrictEqual([
      'semantic',
      'accent',
    ]);

    const steps = recursivelyResolveAnalyzedToken(
      analyzedTokens ?? [],
      (analyzedTokens ?? [])[3],
    );

    expect(
      steps.map((t) => ({
        ...t,
        fromTreePath: t.fromTreePath.array,
        fromValuePath: t.fromValuePath.array,
        toTreePath: t.toTreePath.array,
      })),
    ).toStrictEqual([
      {
        status: 'linked',
        fromTreePath: ['semantic', 'accent'],
        fromValuePath: [],
        toTreePath: ['semantic', 'solid'],
        targetType: 'color',
      },
      {
        status: 'linked',
        fromTreePath: ['semantic', 'solid'],
        fromValuePath: [],
        toTreePath: ['semantic', 'primary'],
        targetType: 'color',
      },
      {
        status: 'linked',
        fromTreePath: ['semantic', 'primary'],
        fromValuePath: [],
        toTreePath: ['base', 'blue'],
        targetType: 'color',
      },
    ]);
  });
  it('should list a deep top level unlinked reference', () => {
    const tokenTree = {
      semantic: {
        primary: {
          $type: 'color',
          $value: '{base.blue}',
        },
        solid: {
          $type: 'color',
          $value: '{semantic.primary}',
        },
      },
    };

    const [analyzedTokens, tokenErrors] = Exit.match(
      Effect.runSyncExit(parseJSONTokenTree(tokenTree)),
      {
        onSuccess: ({ analyzedTokens, tokenErrors }) => [
          analyzedTokens,
          tokenErrors,
        ],
        onFailure: (error) => {
          throw error;
        },
      },
    );

    expect(analyzedTokens).toHaveLength(2);
    expect(analyzedTokens[1].path).toStrictEqual(['semantic', 'solid']);

    const steps = recursivelyResolveAnalyzedToken(
      analyzedTokens ?? [],
      analyzedTokens[1],
    );

    expect(
      steps.map((t) => ({
        ...t,
        fromTreePath: t.fromTreePath.array,
        fromValuePath: t.fromValuePath.array,
        toTreePath: t.toTreePath.array,
      })),
    ).toStrictEqual([
      {
        status: 'linked',
        fromTreePath: ['semantic', 'solid'],
        fromValuePath: [],
        targetType: 'color',
        toTreePath: ['semantic', 'primary'],
      },
      {
        status: 'unlinked',
        fromTreePath: ['semantic', 'primary'],
        fromValuePath: [],
        toTreePath: ['base', 'blue'],
      },
    ]);
  });
  it('should list nested linked references', () => {
    const tokenTree = {
      color: {
        $type: 'color',
        blue: {
          $value: '#ff0000',
        },
        blueAliased: {
          $value: '{color.blue}',
        },
        primary: {
          $value: '{color.blueAliased}',
        },
      },
      spacing: {
        $type: 'dimension',
        '0_25': {
          $value: '1px',
        },
        border: {
          $value: '{spacing.0_25}',
        },
      },
      border: {
        solid: {
          $type: 'border',
          $value: {
            color: '{color.primary}',
            style: 'solid',
            width: '{spacing.border}',
          },
        },
      },
    };

    const [analyzedTokens, tokenErrors] = Exit.match(
      Effect.runSyncExit(parseJSONTokenTree(tokenTree)),
      {
        onSuccess: ({ analyzedTokens, tokenErrors }) => [
          analyzedTokens,
          tokenErrors,
        ],
        onFailure: (error) => {
          throw error;
        },
      },
    );

    expect(analyzedTokens).toHaveLength(6);

    const analyzedToken = analyzedTokens[5];
    if (!analyzedToken) throw new Error('Token not found');

    expect(analyzedToken.path).toStrictEqual(['border', 'solid']);

    const steps = recursivelyResolveAnalyzedToken(
      analyzedTokens ?? [],
      analyzedToken,
    );

    expect(
      steps.map((t) => ({
        ...t,
        fromTreePath: t.fromTreePath.array,
        fromValuePath: t.fromValuePath.array,
        toTreePath: t.toTreePath.array,
      })),
    ).toStrictEqual([
      {
        status: 'linked',
        fromTreePath: ['border', 'solid'],
        fromValuePath: ['color'],
        toTreePath: ['color', 'primary'],
        targetType: 'color',
      },
      {
        status: 'linked',
        fromTreePath: ['color', 'primary'],
        fromValuePath: [],
        toTreePath: ['color', 'blueAliased'],
        targetType: 'color',
      },
      {
        status: 'linked',
        fromTreePath: ['color', 'blueAliased'],
        fromValuePath: [],
        toTreePath: ['color', 'blue'],
        targetType: 'color',
      },
      {
        status: 'linked',
        fromTreePath: ['border', 'solid'],
        fromValuePath: ['width'],
        toTreePath: ['spacing', 'border'],
        targetType: 'dimension',
      },
      {
        status: 'linked',
        fromTreePath: ['spacing', 'border'],
        fromValuePath: [],
        toTreePath: ['spacing', '0_25'],
        targetType: 'dimension',
      },
    ]);
  });
});
