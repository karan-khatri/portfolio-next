import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { fontVariableClasses } from "@/lib/fonts";
import "@/app/globals.css";

export function RootDocument({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html
      lang={lang}
      className={`${fontVariableClasses} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
        {process.env.NODE_ENV === "production" ? (
          <Script async src="https://t.contentsquare.net/uxa/caec894f69b60.js" strategy="afterInteractive" />
        ) : null}
      </body>
    </html>
  );
}
