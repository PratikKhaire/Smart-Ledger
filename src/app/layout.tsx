import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Mini-Ledger | Personal Finance Tracker",
  description:
    "A lightweight full-stack finance tracker for recording income, expenses, viewing summaries, and splitting shared expenses with friends.",
  keywords: ["finance tracker", "ledger", "expense splitter", "budgeting"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
