import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DemoProvider } from "@/lib/demoState";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StoreCred AI | Remote Underwriting for Informal Retail",
  description: "Estimate kirana store cashflow using visual evidence, geo intelligence, and explainable underwriting logic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <DemoProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </DemoProvider>
      </body>
    </html>
  );
}
