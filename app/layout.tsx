import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luminex Edge Logistics | Your Product. Your Budget. Our Responsibility.",
  description: "Product sourcing and dependable logistics across Lagos and Ogun.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}