import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Climbing Video 3D Pose Reconstruction",
  description: "Analyze climbing videos with 3D pose reconstruction using MediaPipe",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Crux",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: '/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ]
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* iOS PWA specific meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <div id="root" className="h-full">
          {children}
        </div>
        <Script 
          src="https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.min.js"
          strategy="beforeInteractive"
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
