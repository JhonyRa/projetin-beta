"use client";

import { useCallback } from "react";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const clerk = useClerk();

  const signInWithClerkHandler = useCallback(() => {
    clerk.openSignIn({
      redirectUrl: "/dashboard",
      appearance: {
        elements: {
          footer: "hidden",
        },
      },
      afterSignInUrl: "/dashboard",
      signUpUrl: "/register",
    });
  }, [clerk]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center">Entrar</h1>
        <h5 className="text-center mb-3">Para continuar em Softube</h5>
        <Button
          onClick={signInWithClerkHandler}
          className="w-full flex items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg shadow-md"
        >
          <FcGoogle className="text-xl" />
          <span>Continuar com Google</span>
        </Button>
      </div>
    </div>
  );
}
