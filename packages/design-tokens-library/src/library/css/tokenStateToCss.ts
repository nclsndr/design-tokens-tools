import { Json } from 'design-tokens-format-module';

import { TokenState } from '../../state/TokenState.js';
import { formatTokenName } from '../internals/formatTokenName.js';
import { matchTokenState } from '../../state/utils/matchTokenState.js';
import {
  FormatOptions,
  TokenNameFormatOptions,
} from '../internals/FormatOptions.js';

function makeCssVariableAliasReference(
  path: Json.ValuePath,
  format: TokenNameFormatOptions | undefined,
) {
  return `var(--${formatTokenName(path, format)})`;
}

export function tokenStateToCss(
  tokenState: TokenState,
  format: FormatOptions | undefined,
) {
  const tokenName = formatTokenName(tokenState.path, format?.token);

  const value = matchTokenState(tokenState, {
    onNumber: (t) =>
      t
        .getValueMapper()
        .mapScalarValue((v) => `${v.raw}`)
        .mapAliasReference((r) =>
          makeCssVariableAliasReference(r.to.treePath.array, format?.token),
        )
        .unwrap(),
    onColor: (t) =>
      t
        .getValueMapper()
        .mapScalarValue((v) => `${v.raw}`)
        .mapAliasReference((r) =>
          makeCssVariableAliasReference(r.to.treePath.array, format?.token),
        )
        .unwrap(),
    onDimension: (t) =>
      t
        .getValueMapper()
        .mapScalarValue((v) => `${v.raw}`)
        .mapAliasReference((r) =>
          makeCssVariableAliasReference(r.to.treePath.array, format?.token),
        )
        .unwrap(),
    onFontFamily: (t) =>
      t
        .getValueMapper()
        .mapAliasReference((r) =>
          // @ts-expect-error - TODO @Nico: should not yell at this
          makeCssVariableAliasReference(r.to.treePath.array, format?.token),
        )
        .mapScalarValue((v) => `${v.raw}`)
        .mapArrayValue((v) =>
          v.flatMap((v) =>
            v.reduce(
              (acc, vm, i, xs) =>
                `${acc}${vm.mapScalarValue((s) => `"${s.raw}"`).unwrap()}${i === xs.length - 1 ? '' : ', '}`,
              '',
            ),
          ),
        )
        .unwrap(),
    onFontWeight: (t) =>
      t
        .getValueMapper()
        .mapScalarValue((v) => `${v.raw}`)
        .mapAliasReference((r) =>
          makeCssVariableAliasReference(r.to.treePath.array, format?.token),
        )
        .unwrap(),
    onDuration: (t) =>
      t
        .getValueMapper()
        .mapScalarValue((v) => `${v.raw}`)
        .mapAliasReference((r) =>
          makeCssVariableAliasReference(r.to.treePath.array, format?.token),
        )
        .unwrap(),
    onCubicBezier: (t) =>
      t
        .getValueMapper()
        .mapAliasReference((r) =>
          makeCssVariableAliasReference(r.to.treePath.array, format?.token),
        )
        .unwrap(),
    onStrokeStyle: (t) =>
      t
        .getValueMapper()
        .mapScalarValue((v) => `${v.raw}`)
        // TODO @Nico: Support dash array
        .mapObjectValue((ov) => ov.flatMap((_) => 'solid'))
        .mapAliasReference((r) =>
          makeCssVariableAliasReference(r.to.treePath.array, format?.token),
        )
        .unwrap(),
    onBorder: (t) =>
      t
        .getValueMapper()
        .mapObjectValue((ov) =>
          ov.flatMap((ob) => {
            const width = ob.width
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                makeCssVariableAliasReference(
                  r.to.treePath.array,
                  format?.token,
                ),
              )
              .unwrap();
            const style = ob.style
              .mapScalarValue((v) => `${v.raw}`)
              // TODO @Nico: Support dash array
              .mapObjectValue((ov) => ov.flatMap((_) => 'solid'))
              .mapAliasReference((r) =>
                makeCssVariableAliasReference(
                  r.to.treePath.array,
                  format?.token,
                ),
              )
              .unwrap();
            const color = ob.color
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                makeCssVariableAliasReference(
                  r.to.treePath.array,
                  format?.token,
                ),
              )
              .unwrap();

            return `${width} ${style} ${color}`;
          }),
        )
        .mapAliasReference((r) =>
          makeCssVariableAliasReference(r.to.treePath.array, format?.token),
        )
        .unwrap(),
    onTransition: (t) =>
      t
        .getValueMapper()
        .mapObjectValue((ov) =>
          ov.flatMap((ob) => {
            const duration = ob.duration
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                makeCssVariableAliasReference(
                  r.to.treePath.array,
                  format?.token,
                ),
              )
              .unwrap();
            const delay = ob.delay
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                makeCssVariableAliasReference(
                  r.to.treePath.array,
                  format?.token,
                ),
              )
              .unwrap();
            const timingFunction = ob.timingFunction
              .mapArrayValue((ar) =>
                ar.flatMap((arr) =>
                  arr
                    .map((vm) => vm.mapScalarValue((s) => s.raw).unwrap())
                    .reduce((acc, str, i, xs) => {
                      return `${acc}${str}${i === xs.length - 1 ? ')' : ', '}`;
                    }, 'cubic-bezier('),
                ),
              )
              .mapAliasReference((r) =>
                makeCssVariableAliasReference(
                  r.to.treePath.array,
                  format?.token,
                ),
              )
              .unwrap();
            return `all ${duration ? duration + ' ' : ''}${delay ? delay + ' ' : ''}${timingFunction}`;
          }),
        )
        .mapAliasReference((r) =>
          makeCssVariableAliasReference(r.to.treePath.array, format?.token),
        )
        .unwrap(),
    onShadow: (t) =>
      t
        .getValueMapper()
        .mapAliasReference((r) =>
          makeCssVariableAliasReference(r.to.treePath.array, format?.token),
        )
        .mapObjectValue((ov) =>
          ov.flatMap((ob) => {
            const color = ob.color
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                makeCssVariableAliasReference(
                  r.to.treePath.array,
                  format?.token,
                ),
              )
              .unwrap();
            const offsetX = ob.offsetX
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                makeCssVariableAliasReference(
                  r.to.treePath.array,
                  format?.token,
                ),
              )
              .unwrap();
            const offsetY = ob.offsetY
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                makeCssVariableAliasReference(
                  r.to.treePath.array,
                  format?.token,
                ),
              )
              .unwrap();
            const blur = ob.blur
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                makeCssVariableAliasReference(
                  r.to.treePath.array,
                  format?.token,
                ),
              )
              .unwrap();
            const spread = ob.spread
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                makeCssVariableAliasReference(
                  r.to.treePath.array,
                  format?.token,
                ),
              )
              .unwrap();
            const inset =
              ob.inset?.mapScalarValue((v) => v.raw).unwrap() ?? false;

            return `${inset ? 'inset ' : ''}${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
          }),
        )
        .mapArrayValue((av) =>
          av
            .flatMap((arr) =>
              arr.map((vm) =>
                vm
                  .mapObjectValue((ov) =>
                    ov.flatMap((ob) => {
                      const color = ob.color
                        .mapScalarValue((v) => `${v.raw}`)
                        .mapAliasReference((r) =>
                          makeCssVariableAliasReference(
                            r.to.treePath.array,
                            {},
                          ),
                        )
                        .unwrap();
                      const offsetX = ob.offsetX
                        .mapScalarValue((v) => `${v.raw}`)
                        .mapAliasReference((r) =>
                          makeCssVariableAliasReference(
                            r.to.treePath.array,
                            {},
                          ),
                        )
                        .unwrap();
                      const offsetY = ob.offsetY
                        .mapScalarValue((v) => `${v.raw}`)
                        .mapAliasReference((r) =>
                          makeCssVariableAliasReference(
                            r.to.treePath.array,
                            {},
                          ),
                        )
                        .unwrap();
                      const blur = ob.blur
                        .mapScalarValue((v) => `${v.raw}`)
                        .mapAliasReference((r) =>
                          makeCssVariableAliasReference(
                            r.to.treePath.array,
                            {},
                          ),
                        )
                        .unwrap();
                      const spread = ob.spread
                        .mapScalarValue((v) => `${v.raw}`)
                        .mapAliasReference((r) =>
                          makeCssVariableAliasReference(
                            r.to.treePath.array,
                            {},
                          ),
                        )
                        .unwrap();
                      const inset =
                        ob.inset?.mapScalarValue((v) => v.raw).unwrap() ??
                        false;

                      return `${inset ? 'inset ' : ''}${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
                    }),
                  )
                  .unwrap(),
              ),
            )
            .join(', '),
        )
        .unwrap(),
    onGradient: (t) =>
      t
        .getValueMapper()
        .mapAliasReference((r) =>
          makeCssVariableAliasReference(r.to.treePath.array, format?.token),
        )
        .mapArrayValue((av) =>
          av
            .mapItems((vm) =>
              vm
                .mapObjectValue((ov) =>
                  ov.flatMap((ob) => {
                    const color = ob.color
                      .mapScalarValue((sv) => sv.raw)
                      .mapAliasReference((r) =>
                        makeCssVariableAliasReference(
                          r.to.treePath.array,
                          format?.token,
                        ),
                      )
                      .unwrap();
                    const position = ob.position
                      .mapScalarValue((sv) => sv.raw)
                      .mapAliasReference((r) =>
                        makeCssVariableAliasReference(
                          r.to.treePath.array,
                          format?.token,
                        ),
                      )
                      .unwrap();

                    return `${color} ${
                      typeof position === 'number'
                        ? `${position * 100}%`
                        : position
                    }`;
                  }),
                )
                .unwrap(),
            )
            .unwrap()
            .join(', '),
        )
        .unwrap(),
    onTypography: () => '',
  });

  if (value === '') return '';

  return `--${tokenName}: ${value};`;
}
