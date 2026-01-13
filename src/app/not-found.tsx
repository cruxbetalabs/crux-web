import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Page Not Found - Crux",
  description: "The page you're looking for doesn't exist.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000'
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-xl mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <a 
          href="/"
          className="inline-block bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
