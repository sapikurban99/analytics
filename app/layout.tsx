import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "Tome Ame BI Analytics Dashboard",
  description: "Premium Business Intelligence Analytics and Multi-Platform Performance Dashboard for Tome Ame.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${figtree.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-rose-500/30 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}


