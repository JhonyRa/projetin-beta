"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ptBR } from "@clerk/localizations";
import { Toaster } from "@/components/ui/toaster";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

type ProvidersProps = {
  children: React.ReactNode;
};

export default function AppProviders({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY ?? ""}
      localization={ptBR}
      afterSignOutUrl="/login"
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
