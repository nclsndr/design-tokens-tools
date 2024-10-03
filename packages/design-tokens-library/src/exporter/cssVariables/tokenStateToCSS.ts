import { TokenState } from '../../state/token/TokenState.js';
import { formatTokenName } from '../internals/formatTokenName.js';
import { matchTokenState } from '../../utils/matchTokenState.js';
import { FormatOptions } from '../internals/FormatOptions.js';

export function tokenStateToCSS(
  tokenState: TokenState,
  format: FormatOptions | undefined,
  ctx: {
    renderAliasValue: (stringPath: string) => string;
  },
) {
  const value = matchTokenState(tokenState, {
    onNumber: (t) =>
      t
        .getValueMapper({
          resolveAtDepth: format?.token?.value?.resolveAtDepth,
        })
        .mapScalarValue((v) => `${v.raw}`)
        .mapAliasReference((r) => ctx.renderAliasValue(r.to.treePath.string))
        .unwrap(),
    onColor: (t) =>
      t
        .getValueMapper({
          resolveAtDepth: format?.token?.value?.resolveAtDepth,
        })
        .mapScalarValue((v) => `${v.raw}`)
        .mapAliasReference((r) => ctx.renderAliasValue(r.to.treePath.string))
        .unwrap(),
    onDimension: (t) =>
      t
        .getValueMapper({
          resolveAtDepth: format?.token?.value?.resolveAtDepth,
        })
        .mapScalarValue((v) => `${v.raw}`)
        .mapAliasReference((r) => ctx.renderAliasValue(r.to.treePath.string))
        .unwrap(),
    onFontFamily: (t) =>
      t
        .getValueMapper({
          resolveAtDepth: format?.token?.value?.resolveAtDepth,
        })
        .mapAliasReference((r) =>
          ctx.renderAliasValue(
            // @ts-expect-error - TODO @Nico: should not yell at this
            r.to.treePath.string,
          ),
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
        .getValueMapper({
          resolveAtDepth: format?.token?.value?.resolveAtDepth,
        })
        .mapScalarValue((v) => `${v.raw}`)
        .mapAliasReference((r) => ctx.renderAliasValue(r.to.treePath.string))
        .unwrap(),
    onDuration: (t) =>
      t
        .getValueMapper({
          resolveAtDepth: format?.token?.value?.resolveAtDepth,
        })
        .mapScalarValue((v) => `${v.raw}`)
        .mapAliasReference((r) => ctx.renderAliasValue(r.to.treePath.string))
        .unwrap(),
    onCubicBezier: (t) =>
      t
        .getValueMapper({
          resolveAtDepth: format?.token?.value?.resolveAtDepth,
        })
        .mapAliasReference((r) => ctx.renderAliasValue(r.to.treePath.string))
        .unwrap(),
    onStrokeStyle: (t) =>
      t
        .getValueMapper({
          resolveAtDepth: format?.token?.value?.resolveAtDepth,
        })
        .mapScalarValue((v) => `${v.raw}`)
        // TODO @Nico: Support dash array
        .mapObjectValue((ov) => ov.flatMap((_) => 'solid'))
        .mapAliasReference((r) => ctx.renderAliasValue(r.to.treePath.string))
        .unwrap(),
    onBorder: (t) =>
      t
        .getValueMapper({
          resolveAtDepth: format?.token?.value?.resolveAtDepth,
        })
        .mapObjectValue((ov) =>
          ov.flatMap((ob) => {
            const width = ob.width
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                ctx.renderAliasValue(r.to.treePath.string),
              )
              .unwrap();
            const style = ob.style
              .mapScalarValue((v) => `${v.raw}`)
              // TODO @Nico: Support dash array
              .mapObjectValue((ov) => ov.flatMap((_) => 'solid'))
              .mapAliasReference((r) =>
                ctx.renderAliasValue(r.to.treePath.string),
              )
              .unwrap();
            const color = ob.color
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                ctx.renderAliasValue(r.to.treePath.string),
              )
              .unwrap();

            return `${width} ${style} ${color}`;
          }),
        )
        .mapAliasReference((r) => ctx.renderAliasValue(r.to.treePath.string))
        .unwrap(),
    onTransition: (t) =>
      t
        .getValueMapper({
          resolveAtDepth: format?.token?.value?.resolveAtDepth,
        })
        .mapObjectValue((ov) =>
          ov.flatMap((ob) => {
            const duration = ob.duration
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                ctx.renderAliasValue(r.to.treePath.string),
              )
              .unwrap();
            const delay = ob.delay
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                ctx.renderAliasValue(r.to.treePath.string),
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
                ctx.renderAliasValue(r.to.treePath.string),
              )
              .unwrap();
            return `all ${duration ? duration + ' ' : ''}${delay ? delay + ' ' : ''}${timingFunction}`;
          }),
        )
        .mapAliasReference((r) => ctx.renderAliasValue(r.to.treePath.string))
        .unwrap(),
    onShadow: (t) =>
      t
        .getValueMapper({
          resolveAtDepth: format?.token?.value?.resolveAtDepth,
        })
        .mapAliasReference((r) => ctx.renderAliasValue(r.to.treePath.string))
        .mapObjectValue((ov) =>
          ov.flatMap((ob) => {
            const color = ob.color
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                ctx.renderAliasValue(r.to.treePath.string),
              )
              .unwrap();
            const offsetX = ob.offsetX
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                ctx.renderAliasValue(r.to.treePath.string),
              )
              .unwrap();
            const offsetY = ob.offsetY
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                ctx.renderAliasValue(r.to.treePath.string),
              )
              .unwrap();
            const blur = ob.blur
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                ctx.renderAliasValue(r.to.treePath.string),
              )
              .unwrap();
            const spread = ob.spread
              .mapScalarValue((v) => `${v.raw}`)
              .mapAliasReference((r) =>
                ctx.renderAliasValue(r.to.treePath.string),
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
                          ctx.renderAliasValue(r.to.treePath.string),
                        )
                        .unwrap();
                      const offsetX = ob.offsetX
                        .mapScalarValue((v) => `${v.raw}`)
                        .mapAliasReference((r) =>
                          ctx.renderAliasValue(r.to.treePath.string),
                        )
                        .unwrap();
                      const offsetY = ob.offsetY
                        .mapScalarValue((v) => `${v.raw}`)
                        .mapAliasReference((r) =>
                          ctx.renderAliasValue(r.to.treePath.string),
                        )
                        .unwrap();
                      const blur = ob.blur
                        .mapScalarValue((v) => `${v.raw}`)
                        .mapAliasReference((r) =>
                          ctx.renderAliasValue(r.to.treePath.string),
                        )
                        .unwrap();
                      const spread = ob.spread
                        .mapScalarValue((v) => `${v.raw}`)
                        .mapAliasReference((r) =>
                          ctx.renderAliasValue(r.to.treePath.string),
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
        .getValueMapper({
          resolveAtDepth: format?.token?.value?.resolveAtDepth,
        })
        .mapAliasReference((r) => ctx.renderAliasValue(r.to.treePath.string))
        .mapArrayValue((av) =>
          av
            .mapItems((vm) =>
              vm
                .mapObjectValue((ov) =>
                  ov.flatMap((ob) => {
                    const color = ob.color
                      .mapScalarValue((sv) => sv.raw)
                      .mapAliasReference((r) =>
                        ctx.renderAliasValue(r.to.treePath.string),
                      )
                      .unwrap();
                    const position = ob.position
                      .mapScalarValue((sv) => sv.raw)
                      .mapAliasReference((r) =>
                        ctx.renderAliasValue(r.to.treePath.string),
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

  const tokenName = formatTokenName(tokenState.path, format?.token?.name);

  return `--${tokenName}: ${value};`;
}
