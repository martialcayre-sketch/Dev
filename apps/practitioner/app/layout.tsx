import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neuronutrition - Praticien",
  description: "Application pour praticiens",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans bg-slate-950 text-slate-100 min-h-screen">{children}</body>
    </html>
  );
}
