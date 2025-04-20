"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in a real app, this would call an API
    console.log("Login attempted with:", email, password);
    // Simulate successful login
    router.push("/dashboard");
  };

  const handleGoogleSignIn = () => {
    // Mock Google sign-in - in a real app, this would initiate OAuth flow
    console.log("Google sign-in attempted");
    // Simulate successful login
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mt-4">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <div className="mt-4">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <Button type="submit" className="w-full mt-4">
        Sign in
      </Button>
      <div className="mt-4 text-center">
        <span className="text-gray-500">or</span>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full mt-4"
        onClick={handleGoogleSignIn}
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        Sign in with Google
      </Button>
    </form>
  );
}
