import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/shell/app-shell";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "دارونَو | تجربه داروخانه دیجیتال",
  description: "رابط سریع و امن برای خدمات دارویی دارونَو.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa-IR" dir="rtl" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground", vazir.variable)}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
