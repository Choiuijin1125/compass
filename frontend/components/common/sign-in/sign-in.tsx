"use client";

import React, { useContext, useState } from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FirebaseUserContext } from "@/lib/firebase-user";

export function SignIn() {
  const user = useContext(FirebaseUserContext);

  return (
    <HoverBorderGradient
      // containerClassName="rounded-full"
      as="button"
      className="bg-black text-white flex justify-center items-center gap-2 w-[350px] h-10"
      onClick={user.signInWithGoogle}
    >
      {user?.isLoading ? (
        <LoadingSpinner className="w-6 h-6" />
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-brand-google"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="#ffffff"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M20.945 11a9 9 0 1 1 -3.284 -5.997l-2.655 2.392a5.5 5.5 0 1 0 2.119 6.605h-4.125v-3h7.945z" />
          </svg>
          Continue with Google
        </>
      )}
    </HoverBorderGradient>
  );
}
