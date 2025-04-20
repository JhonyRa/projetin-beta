'use client'

import { Button } from "@/components/ui/button"
import { FcGoogle } from 'react-icons/fc'
import { useRouter } from 'next/navigation'

export function GoogleSignInButton() {
  const router = useRouter()

  const handleGoogleSignIn = () => {
    // Mock Google sign-in - in a real app, this would initiate OAuth flow
    console.log('Google sign-in attempted')
    // Simulate successful login
    router.push('/dashboard')
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
    >
      <FcGoogle className="mr-2 h-5 w-5" />
      Sign in with Google
    </Button>
  )
}

