import { describe, it, expect } from 'vitest';
import { JSONTokenTree } from 'design-tokens-format-module';

import { parseDesignTokens } from '../src/parseDesignTokens.js';

describe('parseDesignTokens', () => {
  it.only('should parse token tree with top level aliases', () => {
    const tree: JSONTokenTree = {
      base: {
        blue: {
          $type: 'color',
          $value: '#0d3181',
        },
        blue2: {
          $type: 'color',
          $value: '{base.blue}',
        },
        blue3: {
          $type: 'color',
          $value: '{base.blue2}',
        },
        blue4: {
          $type: 'color',
          $value: '{base.blue3}',
        },
        blue5: {
          $type: 'color',
          $value: '{base.blue4}',
        },
        // number: {
        //   $type: 'number',
        //   $value: 42,
        // },
        // red: {
        //   $type: 'color',
        //   $value: '#ff0000',
        // },
        unresolvableColor: {
          $type: 'color',
          $value: '{base.unknown}',
        },
        unresolvableColorAliased: {
          $type: 'color',
          $value: '{base.unresolvableColor}',
        },
      },
      // color: {
      //   $type: 'color',
      //   primary: {
      //     $value: '{base.blue2}',
      //   },
      // },
      baseDimension: {
        $type: 'dimension',
        $value: '4px',
      },
      aliasedDimension: {
        $type: 'dimension',
        $value: '{baseDimension}',
      },

      borders: {
        aBorder: {
          $type: 'border',
          $value: {
            color: '{base.blue2}',
            style: {
              dashArray: ['2px', '{aliasedDimension}'],
              lineCap: 'round',
            },
            // style: 'solid',
            width: '1px',
          },
        },
        aliasedBorder: {
          $type: 'border',
          $value: '{borders.aBorder}',
        },
        // aliasOfAliasBorder: {
        //   $type: 'border',
        //   $value: '{borders.aliasedBorder}',
        // },
      },

      aGradient: {
        $type: 'gradient',
        $value: [
          {
            color: '{base.blue}',
            position: 0,
          },
          {
            color: '#ff0000',
            position: 1,
          },
        ],
      },
    };

    const tokenTree = parseDesignTokens(tree);

    tokenTree.mapTokensByType('color', (token) => {
      // TODO @Nico: NO CONSOLE
      console.log('token.path:', token.path);

      const res = token
        .getValueMapper({
          resolveAtDepth: 1,
        })
        .mapScalarValue((r) => {
          return r.raw;
        })
        .mapAliasReference((a) => {
          const rr = a
            .mapDeeplyLinkedToken((t) => {
              return null;
            })
            .mapShallowlyLinkedValue((ref) => {
              return true;
            })
            .map((value) => {
              if (typeof value === 'string') {
                return [value];
              }
              return value;
            })
            .unwrap();
          return rr;
        })
        .unwrap();
      // TODO @Nico: NO CONSOLE
      console.log('res:', res);

      const mappedValue = token
        .getValueMapper()
        .mapAliasReference((ref) => {
          const maybeToken = ref.getToken();
          if (maybeToken) {
            return maybeToken
              .getValueMapper({ resolveAtDepth: 10 })
              .mapAliasReference((ref) => {
                return JSON.stringify(ref.to.treePath.array);
              })
              .mapScalarValue((r) => {
                return r.raw;
              })
              .unwrap();
          }

          return maybeToken;
          // const resolved = ref.resolve();
          // resolved.mapScalarValue((r) => {
          //   return r.raw;
          // });
        })
        .mapScalarValue((r) => {
          return r.raw;
        })
        .unwrap();

      console.log('mappedValue:', mappedValue);
    });

    tokenTree.mapTokensByType('border', (token) => {
      // TODO @Nico: NO CONSOLE
      console.log('token.path:', token.path);

      const res = token
        .getValueMapper({
          resolveAtDepth: 2,
        })
        .unwrap();

      const mapped = token
        .getValueMapper({
          resolveAtDepth: 5,
        })
        .mapAliasReference((a) => `{${a.to.treePath.string}}`)
        .mapObjectValue((objectValue) => {
          return objectValue
            .mapKey('color', (c) => {
              return c
                .mapScalarValue((r) => {
                  return r.raw;
                })
                .mapAliasReference((a) => `{${a.to.treePath.string}}`)
                .unwrap();
            })
            .mapKey('width', (w) => {
              return w
                .mapScalarValue((r) => {
                  return r.raw;
                })
                .mapAliasReference((a) => `{${a.to.treePath.string}}`)
                .unwrap();
            })
            .mapKey('style', (s) => {
              return s
                .mapScalarValue((r) => {
                  return r.raw;
                })
                .mapAliasReference((a) => `{${a.to.treePath.string}}`)
                .mapObjectValue((o) => {
                  return o
                    .mapKey('dashArray', (da) => {
                      return da
                        .mapArrayValue((arr) => {
                          return arr
                            .mapItems((v, i) => {
                              return v
                                .mapScalarValue((s) => s.raw)
                                .mapAliasReference(
                                  (a) => `{${a.to.treePath.string}}`,
                                )
                                .unwrap();
                            })
                            .unwrap();
                        })
                        .unwrap();
                    })
                    .mapKey('lineCap', (lc) => {
                      return lc
                        .mapScalarValue((r) => {
                          return r.raw;
                        })
                        .unwrap();
                    })
                    .unwrap();
                })
                .unwrap();
            })
            .unwrap();
        })
        .unwrap();

      // TODO @Nico: NO CONSOLE
      console.log('mapped:', mapped);

      // console.log('mappedValue:', mappedValue);
    });

    tokenTree.mapTokensByType('gradient', (token) => {
      const mappedValue = token
        .getValueMapper()
        .mapArrayValue((stops) => {
          return stops
            .mapItems((stop, index) => {
              return stop
                .mapObjectValue((stopValue) => {
                  return stopValue
                    .mapKey('color', (color) => {
                      return color
                        .mapScalarValue((r) => {
                          return r.raw;
                        })
                        .mapAliasReference((a) => {
                          return JSON.stringify(a.from);
                        })
                        .unwrap();
                    })
                    .mapKey('position', (position) => {
                      return position
                        .mapScalarValue((r) => {
                          return r.raw;
                        })
                        .unwrap();
                    })
                    .unwrap();
                })
                .unwrap();
            })
            .unwrap();
        })
        .unwrap();
    });

    // console.log('tokenTree:', JSON.stringify(tokenTree, null, 2));
    // console.log('getErrors', tokenTreeAPI.getErrors());
    // console.log(
    //   'getAllTokens',
    //   tokenTreeAPI.getAllTokens().map((token) => token.summary),
    // );
  });
  it.todo('should parse two tokens referencing a third one', () => {
    const tree: JSONTokenTree = {
      base: {
        blue: {
          $type: 'color',
          $value: '#0d3181',
        },
      },
      semantic: {
        primary: {
          $type: 'color',
          $value: '{base.blue}',
        },
        color: {
          $type: 'color',
          $value: '{base.blue}',
        },
      },
    };

    const treeState = parseDesignTokens(tree);
  });
  it.todo('should parse token tree with nested aliases', () => {
    const tree: JSONTokenTree = {
      base: {
        color: {
          $type: 'color',
          blue: {
            $value: '#0d3181',
          },
          primary: {
            $type: 'color',
            $value: '{base.color.blue}',
            // $value: '{base.sizing.basis}',
          },

          // secondary: {
          //   $value: '{base.color.primary}',
          // },
        },

        sizing: {
          $type: 'number',
          basis: {
            $type: 'number',
            $value: 16,
          },
        },

        // spacing: {
        //   $type: 'dimension',
        //   '0_25': {
        //     $value: '1px',
        //   },
        // },
      },

      solidBorder: {
        $type: 'border',
        $value: {
          color: '{base.color.primary}',
          // color: '#0d3181',
          style: 'solid',
          // width: '{base.spacing.0_25}',
          width: '{base.color.primary}',
        },
      },

      // otherBorder: {
      //   $value: '{solidBorder}',
      // },
    };

    const treeState = parseDesignTokens(tree);

    // TODO @Nico: NO CONSOLE
    console.log('treeState.getAllTokens():', treeState.getAllTokens());
    console.log('treeState.getErrors():', treeState.getErrors());
  });
  it.todo('should parse token tree with errors', () => {
    const tree: JSONTokenTree = {
      invalid: {
        // @ts-expect-error
        $type: 'unknown',
        // @ts-expect-error
        $value: 'invalid',
      },
      // @ts-expect-error
      color: {
        $type: 'color',
        $value: 'invalid color',
      },
      group: {
        // @ts-expect-error
        $type: 'group',
        inner: {
          $value: 'a string',
        },
      },
    };

    const treeState = parseDesignTokens(tree);
  });
});
