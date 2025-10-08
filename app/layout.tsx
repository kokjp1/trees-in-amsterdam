import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trees in Amsterdam",
  description: "Trees in Amsterdam datastory",
  icons: {
    icon: "/favicon.png", // located in /public
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* If you prefer explicit tag instead (optional duplicate):
        <link rel="icon" href="/favicon.png" sizes="any" />
        */}
      </head>
      <body>{children}</body>
    </html>
  );
}
