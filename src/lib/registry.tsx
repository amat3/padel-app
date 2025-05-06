// registry.tsx
'use client';

import { ThemeProvider } from 'styled-components';
import theme from '../styles/theme'; // Si tienes un archivo de tema
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function StyledComponentsRegistry({ children }: Props) {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}
