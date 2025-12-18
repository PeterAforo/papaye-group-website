import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Papaye Fast Food | Ghana's Total Food Care Company",
  description: "Papaye Fast Foods - Ghana's pioneer fast food restaurant since 1991. Serving quality broasted chicken, grilled fish, burgers and more across 10+ locations in Accra.",
  keywords: "Papaye, Ghana fast food, broasted chicken, grilled chicken, Ghanaian restaurant, Accra food, Spintex, Osu",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Papaye Fast Food | Ghana's Total Food Care Company",
    description: "Ghana's pioneer fast food restaurant since 1991. Quality food, fast service, great taste.",
    type: "website",
    locale: "en_GH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${notoSans.variable} font-body antialiased`}
      >
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
