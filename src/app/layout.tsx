import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adriano Web",
  description: "Une nouvelle expérience de jeu arrive bientôt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

