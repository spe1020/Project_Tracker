import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Manufacturing Trial Documentation",
  description:
    "Track and document manufacturing trials, parameters, materials, and costs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full print-full-width">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
