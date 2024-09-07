import * as React from 'react';

import css from './BrowseFilesButton.module.css';

export function BrowseFilesButton({
  onSelectedFiles,
}: {
  onSelectedFiles: (files: Array<File>) => void;
}) {
  function capture(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      onSelectedFiles(Array.from(e.target.files));
    }
  }

  return (
    <div
      className={`rt-reset rt-BaseButton rt-r-size-3 rt-variant-solid rt-Button ${css.box}`}
    >
      <input
        type="file"
        accept="application/json"
        multiple={false}
        onChange={capture}
      />
      <span>Browse files</span>
    </div>
  );
}
