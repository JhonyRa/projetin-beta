import type { Metadata } from "next";
import "../globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/toaster"
import { UserProvider } from '@/contexts/user-context'

import AppProviders from "@/providers/app-providers";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Softube",
  description: "Private online video hosting for Softo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ClerkProvider>
          <UserProvider>
            <AppProviders>
              <Header />
              <main className="flex-grow">{children}</main>
            </AppProviders>
            <Toaster />
          </UserProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
