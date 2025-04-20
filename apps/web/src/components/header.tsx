"use client";

import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle, Users } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback } from "react";

export function Header() {
  const { isSignedIn, signOut } = useAuth();
  const { user, isLoaded } = useUser();
  const signOutClerkHandler = useCallback(() => {
    signOut();
  }, [signOut]);

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Image
              src="/images/logo.png"
              alt="Softube Logo"
              width={180}
              height={60}
              className="w-auto h-[40px]"
              priority
            />
          </Link>
        </div>
        <nav>
          <ul className="flex items-center space-x-4">
            {!isLoaded && (
              <li className="text-gray-600 hover:text-gray-800">carregando...</li>
            )}
            {isSignedIn && (
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center">
                      {!user?.imageUrl && (
                        <UserCircle className="mr-2 h-4 w-4" />
                      )}
                      {!!user?.imageUrl && (
                        <img
                          src={user?.imageUrl}
                          alt="User avatar"
                          className="h-8 w-8 rounded-full mr-2"
                        />
                      )}
                      {user?.primaryEmailAddress?.emailAddress}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/manage-user-roles" className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Gerenciar funções de usuários</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOutClerkHandler}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
