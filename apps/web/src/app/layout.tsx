import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth-context";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
// Inter has no Arabic glyphs; this covers Arabic script specifically and is
// only pulled in as a fallback via the [dir="rtl"] rule in globals.css.
const notoSansArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic" });

export const metadata: Metadata = {
  title: "MBN Health — Clinic Management Platform",
  description: "Enterprise SaaS platform for clinics and healthcare providers.",
};

// Deliberately NOT reading the locale cookie here via next/headers: doing so
// would force every page in the app onto dynamic (per-request) rendering,
// losing static generation/CDN caching for content pages like the marketing
// site and legal pages. Instead the server always renders the English/LTR
// shell, and LocaleProvider swaps to the saved cookie's language client-side
// on mount (a brief flash for returning AR/FR visitors, traded for keeping
// those pages statically generated).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={cn(inter.variable, notoSansArabic.variable, "font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LocaleProvider>
            <QueryProvider>
              <AuthProvider>
                {children}
                <Toaster richColors position="top-right" />
              </AuthProvider>
            </QueryProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
