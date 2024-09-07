import { createFileRoute } from '@tanstack/react-router';
import { AppLayout } from '../layout/AppLayout/AppLayout.tsx';
import {
  CollapsedInputPanel,
  InputPanel,
} from '../layout/InputPanel/InputPanel.tsx';
import {
  TransformPanel,
  InitTransformPanel,
} from '../layout/TransformPanel/TransformPanel.tsx';
import { useAtom } from 'jotai/index';
import { layoutAtom } from '../store/layout.ts';
import {
  CollapsedOutputPanel,
  OutputPanel,
} from '../layout/OutputPanel/OutputPanel.tsx';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [layout] = useAtom(layoutAtom);

  return (
    <AppLayout
      inputComponent={
        layout === 'init' || layout === 'input' ? (
          <InputPanel />
        ) : (
          <CollapsedInputPanel />
        )
      }
      transformComponent={
        layout === 'init' ? <InitTransformPanel /> : <TransformPanel />
      }
      outputComponent={
        layout === 'init' ? null : layout === 'transform' ||
          layout === 'output' ? (
          <OutputPanel />
        ) : (
          <CollapsedOutputPanel />
        )
      }
    />
  );
}
