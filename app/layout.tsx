import type { Metadata } from "next";
import { fontClassNames } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Café Céramique",
  description: "Peinture sur céramique — réservez votre session",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fontClassNames} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
