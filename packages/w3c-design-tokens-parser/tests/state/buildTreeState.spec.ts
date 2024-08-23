import { describe, it, expect } from 'vitest';
import { Border, Color, JSONTokenTree } from 'design-tokens-format-module';

import { buildTreeState } from '../../src/state/buildTreeState';

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

  it('should build a treeState of raw values', () => {
    const tokenTree: JSONTokenTree = {
      borderToken,
      colorToken,
    };

    const treeState = buildTreeState(tokenTree);

    const tokenResults = treeState.tokenStates.nodes.map((t) => ({
      stringPath: t.stringPath,
      type: t.type,
      rawValues: t.rawValueParts.nodes.map((v) => ({
        stringPath: v.path.string,
        value: v.value,
      })),
    }));

    expect(tokenResults).toStrictEqual([
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
      },
      {
        stringPath: 'colorToken',
        type: 'color',
        rawValues: [
          {
            stringPath: '',
            value: '#a82222',
          },
        ],
      },
    ]);
  });
  it('should build a treeState of raw values and resolvable aliases', () => {
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
    };

    const treeState = buildTreeState(tokenTree);

    const tokenResults = treeState.tokenStates.nodes.map((t) => ({
      stringPath: t.stringPath,
      type: t.type,
      rawValues: t.rawValueParts.nodes.map((v) => ({
        stringPath: v.path.string,
        value: v.value,
      })),
      references: t.references.nodes.map((r) => ({
        fromValuePath: r.fromValuePath.string,
        fromTreePath: r.fromTreePath.string,
        toTreePath: r.toTreePath.string,
        isFullyResolved: r.isFullyResolved,
        resolutionTraces: r.resolutionTraces.map((trace) => {
          const state = {
            status: trace.status,
            fromTreePath: trace.fromTreePath.string,
            fromValuePath: trace.fromValuePath.string,
            toTreePath: trace.toTreePath.string,
          };

          if (trace.status === 'resolved') {
            return {
              ...state,
              targetType: trace.targetType,
            };
          }
          return state;
        }),
      })),
    }));

    expect(tokenResults).toStrictEqual([
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
            fromTreePath: 'primary',
            toTreePath: 'colorToken',
            isFullyResolved: true,
            resolutionTraces: [
              {
                status: 'resolved',
                fromTreePath: 'primary',
                fromValuePath: '',
                toTreePath: 'colorToken',
                targetType: 'color',
              },
            ],
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
            fromTreePath: 'secondary',
            toTreePath: 'primary',
            isFullyResolved: true,
            resolutionTraces: [
              {
                status: 'resolved',
                fromTreePath: 'secondary',
                fromValuePath: '',
                toTreePath: 'primary',
                targetType: 'color',
              },
              {
                status: 'resolved',
                fromTreePath: 'primary',
                fromValuePath: '',
                toTreePath: 'colorToken',
                targetType: 'color',
              },
            ],
          },
        ],
      },
    ]);
  });
  it('should build a treeState of raw values and unresolvable aliases', () => {
    const tokenTree: JSONTokenTree = {
      colorToken,
      secondary: {
        $type: 'color',
        $value: '{primary}',
      },
    };

    const treeState = buildTreeState(tokenTree);

    const tokenResults = treeState.tokenStates.nodes.map((t) => ({
      stringPath: t.stringPath,
      type: t.type,
      rawValues: t.rawValueParts.nodes.map((v) => ({
        stringPath: v.path.string,
        value: v.value,
      })),
      references: t.references.nodes.map((r) => ({
        fromValuePath: r.fromValuePath.string,
        fromTreePath: r.fromTreePath.string,
        toTreePath: r.toTreePath.string,
        isFullyResolved: r.isFullyResolved,
        resolutionTraces: r.resolutionTraces.map((trace) => {
          const state = {
            status: trace.status,
            fromTreePath: trace.fromTreePath.string,
            fromValuePath: trace.fromValuePath.string,
            toTreePath: trace.toTreePath.string,
          };

          if (trace.status === 'resolved') {
            return {
              ...state,
              targetType: trace.targetType,
            };
          }
          return state;
        }),
      })),
    }));

    expect(tokenResults).toStrictEqual([
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
        stringPath: 'secondary',
        type: 'color',
        rawValues: [],
        references: [
          {
            fromValuePath: '',
            fromTreePath: 'secondary',
            toTreePath: 'primary',
            isFullyResolved: false,
            resolutionTraces: [
              {
                status: 'unresolvable',
                fromTreePath: '',
                fromValuePath: '',
                toTreePath: 'primary',
              },
            ],
          },
        ],
      },
    ]);
  });
});
