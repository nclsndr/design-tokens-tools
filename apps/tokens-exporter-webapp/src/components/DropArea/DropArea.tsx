import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from '@radix-ui/react-icons';
import { Text, Code } from '@radix-ui/themes';

import css from './DropArea.module.css';

const baseStyle = {} as const;

const focusedStyle = {
  borderColor: 'var(--accent-9)',
};

const acceptStyle = {
  borderColor: 'var(--success-9)',
};

const rejectStyle = {
  borderColor: 'var(--error-9)',
};

export function DropArea({
  onDroppedFiles,
}: {
  onDroppedFiles: (files: Array<File>) => void;
}) {
  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    acceptedFiles,
  } = useDropzone({ accept: { 'application/json': [] } });

  React.useEffect(
    () => {
      if (acceptedFiles.length > 0) {
        onDroppedFiles(acceptedFiles);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [acceptedFiles],
  );

  const style = React.useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject],
  );

  return (
    <div {...getRootProps({ style, className: css.box })}>
      <input {...getInputProps()} />
      <UploadIcon width={20} height={20} />
      <Text size="3" mt="2" weight="medium" highContrast={false}>
        Drop a <Code>.json</Code> file
      </Text>
    </div>
  );
}
