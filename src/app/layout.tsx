import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VTU App - Airtime, Data & Bills Payment",
  description: "Purchase airtime, data bundles, pay electricity bills, subscribe to cable TV, and buy education pins",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
