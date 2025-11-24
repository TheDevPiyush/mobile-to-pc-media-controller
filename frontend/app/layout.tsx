import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const FONT_AWESOME_STYLES = [
  "https://site-assets.fontawesome.com/releases/v7.1.0/css/fontawesome.css",
  "https://site-assets.fontawesome.com/releases/v7.1.0/css/solid.css",
  "https://site-assets.fontawesome.com/releases/v7.1.0/css/regular.css",
  "https://site-assets.fontawesome.com/releases/v7.1.0/css/light.css",
  "https://site-assets.fontawesome.com/releases/v7.1.0/css/brands.css",
];

export const metadata: Metadata = {
  title: "PC Media Remote",
  description: "Securely control your PC playback from any browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#050607" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="PC Media Remote" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Media Remote" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {FONT_AWESOME_STYLES.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
