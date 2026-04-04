import { Nunito } from "next/font/google";
import FullLayout from "./layouts/Full";
import type { Metadata } from "next";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
});

export const metadata: Metadata = {
  title: "Rhythm Place",
  description: "A place to dance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/logo.png" />
      </head>
      <body className={nunito.variable}>
        <FullLayout>
          {children}
        </FullLayout>
      </body>
    </html>
  );
}
