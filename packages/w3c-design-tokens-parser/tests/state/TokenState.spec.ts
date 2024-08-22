import { describe, it, expect } from 'vitest';
import { JSONTokenTree } from 'design-tokens-format-module';

import {
  borderToken,
  colorToken,
  cubicBezierToken,
  dimensionToken,
  durationToken,
  fontFamilyToken,
  gradientToken,
  numberFontWeightToken,
  numberToken,
  shadowToken,
  stringFontWeightToken,
  strokeStyleToken,
  transitionToken,
  typographyToken,
} from '../_fixtures/tokens';
import { buildTokenTree } from '../../src/state/buildTokenTree';

describe('TokenState', () => {
  describe('getJSONToken', () => {
    it('should parse a token tree of raw values of all types', () => {
      const tokens: JSONTokenTree = {
        borderToken,
        colorToken,
        cubicBezierToken,
        dimensionToken,
        durationToken,
        fontFamilyToken,
        stringFontWeightToken,
        numberFontWeightToken,
        gradientToken,
        numberToken,
        shadowToken,
        strokeStyleToken,
        transitionToken,
        typographyToken,
      };

      const treeState = buildTokenTree(tokens);

      const values = treeState.tokenStates.nodes.map((t) => t.getJSONToken());

      expect(values).toStrictEqual([
        {
          $type: 'border',
          $value: { color: '#676767', width: '1px', style: 'solid' },
        },
        { $type: 'color', $value: '#a82222' },
        { $type: 'cubicBezier', $value: [0, 1, 1, 0] },
        { $type: 'dimension', $value: '12px' },
        { $type: 'duration', $value: '1s' },
        { $type: 'fontFamily', $value: 'Arial' },
        { $type: 'fontWeight', $value: 'bold' },
        { $type: 'fontWeight', $value: 700 },
        {
          $type: 'gradient',
          $value: [
            {
              color: '#000000',
              position: 0,
            },
            {
              color: '#ffffff',
              position: 1,
            },
          ],
        },
        { $type: 'number', $value: 12 },
        {
          $type: 'shadow',
          $value: {
            color: '#000000',
            offsetX: '1px',
            offsetY: '2px',
            blur: '3px',
            spread: '4px',
          },
        },
        { $type: 'string', $value: 'hello' },
        { $type: 'strokeStyle', $value: 'solid' },
        {
          $type: 'transition',
          $value: {
            duration: '1s',
            delay: '0s',
            timingFunction: [0, 0.1, 0.7, 0.5],
          },
        },
        {
          $type: 'typography',
          $value: {
            fontFamily: 'Arial',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            lineHeight: 1.5,
          },
        },
      ]);
    });
    it('should parse a token tree of alias values', () => {
      const tokens: JSONTokenTree = {
        borderToken,
        dimensionToken,
        colorToken,
        gradientToken,
        cubicBezierToken,
        aliasedBorder: {
          $type: 'border',
          $value: '{colorToken}',
        },
        deepAliasedBorder: {
          $type: 'border',
          $value: {
            color: '{colorToken}',
            width: '{dimensionToken}',
            style: 'solid',
          },
        },
        aliasedDimension: {
          $type: 'dimension',
          $value: '{dimensionToken}',
        },
        aliasedGradient: {
          $type: 'gradient',
          $value: '{gradientToken}',
        },
        deepAliasedGradient: {
          $type: 'gradient',
          $value: [
            {
              color: '{colorToken}',
              position: 0,
            },
            {
              color: '{colorToken}',
              position: 1,
            },
          ],
        },
        aliasedCubicBezier: {
          $type: 'cubicBezier',
          $value: [0, 1, 1, 0],
        },
      };

      const treeState = buildTokenTree(tokens);

      const values = treeState.tokenStates.nodes.map((t) => t.getJSONToken());

      expect(values).toStrictEqual([
        {
          $type: 'border',
          $value: {
            color: '#676767',
            width: '1px',
            style: 'solid',
          },
        },
        {
          $type: 'dimension',
          $value: '12px',
        },
        {
          $type: 'color',
          $value: '#a82222',
        },
        {
          $type: 'gradient',
          $value: [
            {
              color: '#000000',
              position: 0,
            },
            {
              color: '#ffffff',
              position: 1,
            },
          ],
        },
        {
          $type: 'cubicBezier',
          $value: [0, 1, 1, 0],
        },
        {
          $type: 'border',
          $value: {
            color: '{colorToken}',
            width: '{dimensionToken}',
            style: 'solid',
          },
        },
        {
          $type: 'dimension',
          $value: '{dimensionToken}',
        },
        {
          $type: 'gradient',
          $value: [
            {
              color: '{colorToken}',
              position: 0,
            },
            {
              color: '{colorToken}',
              position: 1,
            },
          ],
        },
        {
          $type: 'cubicBezier',
          $value: [0, 1, 1, 0],
        },
      ]);
    });
  });
});
