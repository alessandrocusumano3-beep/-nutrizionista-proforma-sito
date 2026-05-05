import type { Metadata } from "next";
import "./globals.css";
import Loader from "./Loader";

export const metadata: Metadata = {
  title: "Nutrizionista Studio",
  description: "Percorso nutrizionale professionale, sostenibile e personalizzato."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <Loader />
        <div id="cursor" />
        <div className="animate-fade-in">{children}</div>
      </body>
    </html>
  );
}
