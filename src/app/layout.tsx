import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import TopBar from "@/components/TopBar";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleAnalytics } from '@next/third-parties/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SpellCheck",
  description: "A word-building chess puzzle game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&display=block" 
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicons/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta property="og:title" content="SpellCheck" />
        <meta property="og:description" content="A word-building chess puzzle game" />
        <meta property="og:image" content="https://spellcheckpuzzle.fun/social-share.png" />
        <meta property="og:url" content="https://spellcheckpuzzle.fun/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SpellCheck" />
        <meta name="twitter:description" content="A word-building chess puzzle game" />
        <meta name="twitter:image" content="https://spellcheckpuzzle.fun/social-share.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased pt-16`}>
        <TopBar />
        <GoogleAnalytics gaId="G-SFZLXFGSDV" />
        {/*
          This container ensures the page content fills the viewport below the fixed TopBar (56px tall).
          The min-h-[calc(100vh-56px)] prevents unwanted scrolling and keeps content centered.
          If you change the TopBar height, update the 56px value here to match.
        */}
        <div className="min-h-[calc(100vh-56px)] bg-gray-50 dark:bg-gray-800 flex-1 flex flex-col items-center justify-center w-full h-full">
          {children}
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
