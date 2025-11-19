import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { AudioProvider } from "@/context/AudioContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "../styles/main.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rhythm Place",
  description: "Where Every Beat Finds You",
  openGraph: {
    title: "Rhythm Place",
    description: "Where Every Beat Finds You",
    url: "https://rhythm.place",
    siteName: "Rhythm Place",
    images: [
      {
        url: "https://rhythm.place/images/ogp.png",
        width: 256,
        height: 256,
        alt: "Rhythm Place",
      },
    ],
    locale: "en_US",
    type: "website",
  },
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
          rel="icon"
          href="/images/favicon.svg"
          type="image/svg+xml"
          sizes="all"
        />
      </head>
      <body className={`${nunito.variable} antialiased`}>
        <AudioProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
