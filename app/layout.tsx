import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lumgelogistics.netlify.app"),
  title: "Luminex Edge Logistics | Your Product. Your Budget. Our Responsibility.",
  description: "Product sourcing and dependable logistics across Lagos and Ogun.",
  verification: {
    google: "h1WRio6yTpoILQ13WdeTRcooQmPCy0dgxU4BOrJwhLs",
  },
  other: {
    monetag: "c7287c9a482192a2492b060f4592e57c",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
