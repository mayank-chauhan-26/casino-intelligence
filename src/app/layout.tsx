
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casino Intel | Independent Casino Research",
  description:
    "Independent online casino research, transparent ratings, comparisons and global intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
