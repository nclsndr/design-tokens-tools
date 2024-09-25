import { describe, it, expect } from 'vitest';
import { Border, Color, JSONTokenTree } from 'design-tokens-format-module';

import { buildTreeState } from '../../src/state/buildTreeState';
import { Effect, Exit } from 'effect';

describe('buildTreeState', () => {
  const borderToken: Border.Token = {
    $type: 'border',
    $value: {
      color: '#676767',
      style: 'solid',
      width: '1px',
    },
  };
  const colorToken: Color.Token = {
    $type: 'color',
    $value: '#a82222',
  };

  it('should build a program of raw values', () => {
    const tokenTree: JSONTokenTree = {
      borderToken,
      color: {
        $type: 'color',
        blue: {
          $value: '#10109A',
        },
      },
      borderWithCustomStyle: {
        $type: 'border',
        $value: {
          color: '#676767',
          style: {
            dashArray: ['1px', '2px'],
            lineCap: 'round',
          },
          width: '1px',
        },
      },
      cubicBezier: {
        $type: 'cubicBezier',
        $value: [0.1, 0.2, 0.3, 0.4],
      },
      gradient: {
        $type: 'gradient',
        $value: [
          {
            color: '#000000',
            position: 0,
          },
          {
            color: '#FFFFFF',
            position: 1,
          },
        ],
      },
    };

    const results = buildTreeState(tokenTree).tokenStates.map((t) => ({
      stringPath: t.stringPath,
      type: t.type,
      rawValues: t.rawValueParts.nodes.map((v) => ({
        stringPath: v.path.string,
        value: v.value,
      })),
      references: t.referencesArray.map((_) => ({})),
    }));

    expect(results).toStrictEqual([
      {
        stringPath: 'borderToken',
        type: 'border',
        rawValues: [
          {
            stringPath: 'color',
            value: '#676767',
          },
          {
            stringPath: 'width',
            value: '1px',
          },
          {
            stringPath: 'style',
            value: 'solid',
          },
        ],
        references: [],
      },
      {
        stringPath: 'color.blue',
        type: 'color',
        rawValues: [
          {
            stringPath: '',
            value: '#10109A',
          },
        ],
        references: [],
      },
      {
        stringPath: 'borderWithCustomStyle',
        type: 'border',
        rawValues: [
          {
            stringPath: 'color',
            value: '#676767',
          },
          {
            stringPath: 'width',
            value: '1px',
          },
          {
            stringPath: 'style.dashArray.0',
            value: '1px',
          },
          {
            stringPath: 'style.dashArray.1',
            value: '2px',
          },
          {
            stringPath: 'style.lineCap',
            value: 'round',
          },
        ],
        references: [],
      },
      {
        stringPath: 'cubicBezier',
        type: 'cubicBezier',
        rawValues: [
          {
            stringPath: '0',
            value: 0.1,
          },
          {
            stringPath: '1',
            value: 0.2,
          },
          {
            stringPath: '2',
            value: 0.3,
          },
          {
            stringPath: '3',
            value: 0.4,
          },
        ],
        references: [],
      },
      {
        stringPath: 'gradient',
        type: 'gradient',
        rawValues: [
          {
            stringPath: '0.color',
            value: '#000000',
          },
          {
            stringPath: '0.position',
            value: 0,
          },
          {
            stringPath: '1.color',
            value: '#FFFFFF',
          },
          {
            stringPath: '1.position',
            value: 1,
          },
        ],
        references: [],
      },
    ]);
  });
  it('should build a program of raw values and resolvable aliases', () => {
    const tokenTree: JSONTokenTree = {
      colorToken,
      primary: {
        $type: 'color',
        $value: '{colorToken}',
      },
      secondary: {
        $type: 'color',
        $value: '{primary}',
      },
      border: {
        base: {
          $type: 'border',
          $value: {
            color: '{primary}',
            style: 'solid',
            width: '1px',
          },
        },
        aliased: {
          $type: 'border',
          $value: '{border.base}',
        },
      },
    };

    const results = buildTreeState(tokenTree).tokenStates.map((t) => ({
      stringPath: t.stringPath,
      type: t.type,
      rawValues: t.rawValueParts.nodes.map((v) => ({
        stringPath: v.path.string,
        value: v.value,
      })),
      references: t.referencesArray.map((r) => ({
        fromValuePath: r.fromValuePath.string,
        fromId: expect.any(String),
        toId: r.toId,
        isShallowlyResolved: r.isShallowlyLinked,
        isFullyResolved: r.isFullyLinked,
      })),
    }));

    expect(results).toStrictEqual([
      {
        stringPath: 'colorToken',
        type: 'color',
        rawValues: [
          {
            stringPath: '',
            value: '#a82222',
          },
        ],
        references: [],
      },
      {
        stringPath: 'primary',
        type: 'color',
        rawValues: [],
        references: [
          {
            fromValuePath: '',
            fromId: expect.any(String),
            toId: expect.any(String),
            isShallowlyResolved: true,
            isFullyResolved: true,
          },
        ],
      },
      {
        stringPath: 'secondary',
        type: 'color',
        rawValues: [],
        references: [
          {
            fromValuePath: '',
            fromId: expect.any(String),
            toId: expect.any(String),
            isShallowlyResolved: true,
            isFullyResolved: true,
          },
        ],
      },
      {
        stringPath: 'border.base',
        type: 'border',
        rawValues: [
          {
            stringPath: 'width',
            value: '1px',
          },
          {
            stringPath: 'style',
            value: 'solid',
          },
        ],
        references: [
          {
            fromValuePath: 'color',
            fromId: expect.any(String),
            toId: expect.any(String),
            isShallowlyResolved: true,
            isFullyResolved: true,
          },
        ],
      },
      {
        stringPath: 'border.aliased',
        type: 'border',
        rawValues: [],
        references: [
          {
            fromValuePath: '',
            fromId: expect.any(String),
            toId: expect.any(String),
            isShallowlyResolved: true,
            isFullyResolved: true,
          },
        ],
      },
    ]);
  });
  it('should build a program of raw values and unresolvable aliases', () => {
    const tokenTree: JSONTokenTree = {
      primary: {
        $type: 'color',
        $value: '{colorToken}',
      },
      secondary: {
        $type: 'color',
        $value: '{primary}',
      },
      border: {
        base: {
          $type: 'border',
          $value: {
            color: '{primary}',
            style: 'solid',
            width: '1px',
          },
        },
        aliased: {
          $type: 'border',
          $value: '{border.base}',
        },
      },
    };

    const results = buildTreeState(tokenTree).tokenStates.map((t) => ({
      stringPath: t.stringPath,
      type: t.type,
      rawValues: t.rawValueParts.nodes.map((v) => ({
        stringPath: v.path.string,
        value: v.value,
      })),
      references: t.referencesArray.map((r) => ({
        fromValuePath: r.fromValuePath.string,
        fromId: r.fromId,
        toId: r.toId,
        isShallowlyResolved: r.isShallowlyLinked,
        isFullyResolved: r.isFullyLinked,
      })),
    }));

    expect(results).toStrictEqual([
      {
        stringPath: 'primary',
        type: 'color',
        rawValues: [],
        references: [
          {
            fromValuePath: '',
            fromId: expect.any(String),
            toId: undefined,
            isShallowlyResolved: false,
            isFullyResolved: false,
          },
        ],
      },
      {
        stringPath: 'secondary',
        type: 'color',
        rawValues: [],
        references: [
          {
            fromValuePath: '',
            fromId: expect.any(String),
            toId: expect.any(String),
            isShallowlyResolved: true,
            isFullyResolved: false,
          },
        ],
      },
      {
        stringPath: 'border.base',
        type: 'border',
        rawValues: [
          {
            stringPath: 'width',
            value: '1px',
          },
          {
            stringPath: 'style',
            value: 'solid',
          },
        ],
        references: [
          {
            fromValuePath: 'color',
            fromId: expect.any(String),
            toId: expect.any(String),
            isShallowlyResolved: true,
            isFullyResolved: false,
          },
        ],
      },
      {
        stringPath: 'border.aliased',
        type: 'border',
        rawValues: [],
        references: [
          {
            fromValuePath: '',
            fromId: expect.any(String),
            toId: expect.any(String),
            isShallowlyResolved: true,
            isFullyResolved: false,
          },
        ],
      },
    ]);
  });
  it('should emit errors for invalid tokens', () => {
    const tokenTree: JSONTokenTree = {
      // @ts-expect-error
      invalidColor: {
        $type: 'color',
        $value: 'invalid',
      },
    };

    const results = buildTreeState(tokenTree).validationErrors.nodes.map(
      (e) => ({
        type: e.type,
        isCritical: e.isCritical,
        treePath: e.treePath,
        nodeKey: e.nodeKey,
        valuePath: e.valuePath,
        referenceToTreePath: e.referenceToTreePath,
        message: e.message,
      }),
    );

    expect(results).toStrictEqual([
      {
        type: 'Value',
        isCritical: false,
        treePath: ['invalidColor'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: undefined,
        message:
          'invalidColor.$value must start with "#" and have a length of 6 or 8. Got: "invalid".',
      },
    ]);
  });
  it('should emit errors for aliasing type mismatches', () => {
    const tokenTree: JSONTokenTree = {
      color: {
        $type: 'color',
        blue: {
          $value: '#10109A',
        },
      },
      dimension: {
        base: {
          $type: 'dimension',
          $value: '{color.blue}',
        },
      },
      border: {
        base: {
          $type: 'border',
          $value: '{dimension.base}',
        },
        nested: {
          $type: 'border',
          $value: {
            color: '{dimension.base}', // should be color
            width: '{dimension.base}',
            style: 'solid',
          },
        },
      },
    };

    const results = buildTreeState(tokenTree).validationErrors.nodes.map(
      (e) => ({
        type: e.type,
        isCritical: e.isCritical,
        treePath: e.treePath,
        nodeKey: e.nodeKey,
        valuePath: e.valuePath,
        referenceToTreePath: e.referenceToTreePath,
        message: e.message,
      }),
    );

    expect(results).toStrictEqual([
      {
        type: 'Type',
        isCritical: false,
        treePath: ['dimension', 'base'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['color', 'blue'],
        message:
          'Type mismatch: expected [ Token(dimension) ] - got Token(color).',
      },
      {
        type: 'Type',
        isCritical: false,
        treePath: ['border', 'base'],
        nodeKey: '$value',
        valuePath: [],
        referenceToTreePath: ['dimension', 'base'],
        message:
          'Type mismatch: expected [ Token(border) | key: "color", "style", "width" - got: undefined ] - got Token(dimension).',
      },
      {
        type: 'Type',
        isCritical: false,
        treePath: ['border', 'nested'],
        nodeKey: '$value',
        valuePath: ['color'],
        referenceToTreePath: ['dimension', 'base'],
        message:
          'Type mismatch: expected [ Token(color) ] - got Token(dimension).',
      },
    ]);
  });
});
