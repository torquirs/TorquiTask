"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      {...props}
      scriptProps={{
        ...props.scriptProps,
        // The root layout runs the bootstrap through next/script before hydration.
        type: "application/json",
      }}
    >
      {children}
    </NextThemesProvider>
  );
}