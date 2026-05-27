import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GanadoApp - Gestión Avícola",
  description: "Sistema de gestión de producción avícola para Petrocasinos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
