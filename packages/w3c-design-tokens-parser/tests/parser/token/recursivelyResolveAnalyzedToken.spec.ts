import { describe, it, expect } from 'vitest';
import { recursivelyResolveAnalyzedToken } from '../../../src/parser/token/recursivelyResolveAnalyzedToken';
import { parseJSONTokenTree } from '../../../src/parser/parseJSONTokenTree';

describe('recursivelyResolveAnalyzedToken', () => {
  it('should list an empty attempt', () => {
    const tokenTree = {
      bColor: {
        $type: 'color',
        $value: '{aColor}',
      },
    };

    const analyzedResults = parseJSONTokenTree(tokenTree).match({
      Ok: (x) => x,
      Error: () => undefined,
    });

    expect(analyzedResults?.tokens[0]).toHaveLength(1);
    expect(analyzedResults?.tokens[0][0].path).toStrictEqual(['bColor']);

    const steps = recursivelyResolveAnalyzedToken(
      analyzedResults?.tokens[0] ?? [],
      analyzedResults!.tokens[0][0],
    );

    expect(steps).toStrictEqual([
      {
        status: 'unresolvable',
        fromTreePath: ['bColor'],
        fromValuePath: [],
        toTreePath: ['aColor'],
      },
    ]);
  });
  it('should list a top level resolvable reference', () => {
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

    const analyzedResults = parseJSONTokenTree(tokenTree).match({
      Ok: (x) => x,
      Error: () => undefined,
    });

    expect(analyzedResults?.tokens[0]).toHaveLength(2);
    expect((analyzedResults?.tokens[0] ?? [])[1].path).toStrictEqual([
      'bColor',
    ]);

    const steps = recursivelyResolveAnalyzedToken(
      analyzedResults?.tokens[0] ?? [],
      analyzedResults!.tokens[0][1],
    );

    expect(steps).toStrictEqual([
      {
        status: 'resolved',
        fromTreePath: ['bColor'],
        fromValuePath: [],
        targetType: 'color',
        toTreePath: ['aColor'],
      },
    ]);
  });
  it('should list a deep top level resolvable reference', () => {
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
      },
    };

    const analyzedResults = parseJSONTokenTree(tokenTree).match({
      Ok: (x) => x,
      Error: () => undefined,
    });

    expect(analyzedResults?.tokens[0]).toHaveLength(3);
    expect((analyzedResults?.tokens[0] ?? [])[2].path).toStrictEqual([
      'semantic',
      'solid',
    ]);

    const steps = recursivelyResolveAnalyzedToken(
      analyzedResults?.tokens[0] ?? [],
      (analyzedResults?.tokens[0] ?? [])[2],
    );

    expect(steps).toStrictEqual([
      {
        status: 'resolved',
        fromTreePath: ['semantic', 'solid'],
        fromValuePath: [],
        targetType: 'color',
        toTreePath: ['semantic', 'primary'],
      },
      {
        status: 'resolved',
        fromTreePath: ['semantic', 'primary'],
        fromValuePath: [],
        targetType: 'color',
        toTreePath: ['base', 'blue'],
      },
    ]);
  });
  it('should list a top level unresolvable reference', () => {
    const tokenTree = {
      semantic: {
        primary: {
          $type: 'color',
          $value: '{base.blue}',
        },
      },
    };

    const analyzedResults = parseJSONTokenTree(tokenTree).match({
      Ok: (x) => x,
      Error: () => undefined,
    });

    expect(analyzedResults?.tokens[0]).toHaveLength(1);
    expect(analyzedResults?.tokens[0][0].path).toStrictEqual([
      'semantic',
      'primary',
    ]);

    const steps = recursivelyResolveAnalyzedToken(
      analyzedResults?.tokens[0] ?? [],
      analyzedResults!.tokens[0][0],
    );

    expect(steps).toStrictEqual([
      {
        status: 'unresolvable',
        fromTreePath: ['semantic', 'primary'],
        fromValuePath: [],
        toTreePath: ['base', 'blue'],
      },
    ]);
  });
  it('should list a deep top level unresolvable reference', () => {
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

    const analyzedResults = parseJSONTokenTree(tokenTree).match({
      Ok: (x) => x,
      Error: () => undefined,
    });

    expect(analyzedResults?.tokens[0]).toHaveLength(2);
    expect(analyzedResults?.tokens[0][1].path).toStrictEqual([
      'semantic',
      'solid',
    ]);

    const steps = recursivelyResolveAnalyzedToken(
      analyzedResults?.tokens[0] ?? [],
      analyzedResults!.tokens[0][1],
    );

    expect(steps).toStrictEqual([
      {
        status: 'resolved',
        fromTreePath: ['semantic', 'solid'],
        fromValuePath: [],
        targetType: 'color',
        toTreePath: ['semantic', 'primary'],
      },
      {
        status: 'unresolvable',
        fromTreePath: ['semantic', 'primary'],
        fromValuePath: [],
        toTreePath: ['base', 'blue'],
      },
    ]);
  });
  it('should list nested resolvable references', () => {
    const tokenTree = {
      color: {
        $type: 'color',
        blue: {
          $value: '#ff0000',
        },
        primary: {
          $value: '{color.blue}',
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
        primary: {
          $value: '{border.solid}',
        },
      },
    };

    const analyzedResults = parseJSONTokenTree(tokenTree).match({
      Ok: (x) => x,
      Error: () => undefined,
    });

    expect(analyzedResults?.tokens[0]).toHaveLength(6);
    expect((analyzedResults?.tokens[0] ?? [])[5].path).toStrictEqual([
      'border',
      'primary',
    ]);

    const steps = recursivelyResolveAnalyzedToken(
      analyzedResults?.tokens[0] ?? [],
      (analyzedResults?.tokens[0] ?? [])[5],
    );

    expect(steps).toStrictEqual([
      {
        status: 'resolved',
        fromTreePath: ['border', 'primary'],
        fromValuePath: [],
        targetType: 'border',
        toTreePath: ['border', 'solid'],
      },
      {
        status: 'resolved',
        fromTreePath: ['border', 'solid'],
        fromValuePath: ['color'],
        targetType: 'color',
        toTreePath: ['color', 'primary'],
      },
      {
        status: 'resolved',
        fromTreePath: ['color', 'primary'],
        fromValuePath: [],
        targetType: 'color',
        toTreePath: ['color', 'blue'],
      },
      {
        status: 'resolved',
        fromTreePath: ['border', 'solid'],
        fromValuePath: ['width'],
        targetType: 'dimension',
        toTreePath: ['spacing', 'border'],
      },
      {
        status: 'resolved',
        fromTreePath: ['spacing', 'border'],
        fromValuePath: [],
        targetType: 'dimension',
        toTreePath: ['spacing', '0_25'],
      },
    ]);
  });
});
