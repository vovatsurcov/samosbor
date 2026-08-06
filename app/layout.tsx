import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Самосбор: Смена 556",
  description: "Пошаговая браузерная RPG в бесконечной Гигахрущёвке.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
