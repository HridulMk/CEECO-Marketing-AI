import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CEECO Marketing AI",
  description: "CEECO International marketing command centre",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
