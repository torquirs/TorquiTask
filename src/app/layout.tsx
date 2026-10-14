import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

import { TooltipProvider } from "@/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import Script from "next/script";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TorquiTask",
  description: "Modern Project and task manager for teams",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            const root = document.documentElement;
            let theme;
            try {
              const savedTheme = localStorage.getItem("theme") || "system";
              theme =
                savedTheme === "dark" ||
                (savedTheme === "system" &&
                  window.matchMedia("(prefers-color-scheme: dark)").matches)
                  ? "dark"
                  : "light";
            } catch {
              theme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
            }
            root.classList.remove("light", "dark");
            root.classList.add(theme);
            root.style.colorScheme = theme;
          })();`}
        </Script>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
              <TooltipProvider delayDuration={300}>
                 <NuqsAdapter>
                  <TRPCReactProvider>
                    {children}
                      <Toaster richColors position="top-center" closeButton/>
                  </TRPCReactProvider>
                 </NuqsAdapter>
              </TooltipProvider>
          </ThemeProvider>
        </body>
    </html>
  );
}
