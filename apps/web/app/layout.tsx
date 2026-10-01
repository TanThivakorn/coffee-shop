import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Daily Ritual — Your coffee, your way",
  description: "Compose your perfect drink with Daily Ritual coffee shop.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
