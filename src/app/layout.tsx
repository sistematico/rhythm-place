import { Nunito } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  preload: false,
});

export const metadata: Metadata = {
  title: "Rhythm Place",
  description: "A sua música, do seu jeito.",
  openGraph: {
    title: "Rhythm Place",
    description: "A sua música, do seu jeito.",
    url: "https://rhythm.place",
    siteName: "Rhythm Place",
    images: [
      {
        url: "https://rhythm.place/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rhythm Place",
      },
    ],
    locale: "pt-BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} bg-black text-white`}>
      <head>
        <link
          rel="icon"
          href="/images/logo.svg"
          type="image/svg+xml"
          sizes="any"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
