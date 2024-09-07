import * as React from 'react';
import { Theme } from '@radix-ui/themes';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { useAtom } from 'jotai';

import { isDarkModeAtom } from './store/isDarkMode.ts';

import '@radix-ui/themes/styles.css';
import './App.css';

import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const [darkMode, setDarkMode] = useAtom(isDarkModeAtom);

  // Listen to the system color scheme preference
  React.useEffect(() => {
    const againstDark = window.matchMedia('(prefers-color-scheme: dark)');

    if (againstDark.matches) {
      setDarkMode(true);
    }
    function listener(event: MediaQueryListEvent) {
      if (event.matches) {
        setDarkMode(true);
      } else {
        setDarkMode(false);
      }
    }
    againstDark.addEventListener('change', listener);
    return () => {
      againstDark.removeEventListener('change', listener);
    };
  }, [setDarkMode]);

  return (
    <React.StrictMode>
      <Theme appearance={darkMode ? 'dark' : 'light'}>
        <RouterProvider router={router} />
      </Theme>
    </React.StrictMode>
  );
}
