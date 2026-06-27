import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { LocaleProvider } from "@/components/locale-provider";
import { AuthProvider } from "@/components/auth-provider";
import { getDictionary} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Koti — Home Memory",
  description: "A permanent memory for your home",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <LocaleProvider locale={locale} dict={dict}>
            <AppShell labels={dict.nav}>{children}</AppShell>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
