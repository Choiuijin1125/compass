/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import SignInContainer from "@/components/signin-container";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import "@/lib/firebase.config";
import {
  GoogleAuthProvider,
  User,
  UserCredential,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from "react";


export interface FirebaseUser {
  isLoading?: boolean;
  isSignedIn?: boolean;
  currentUser?: User | null;
  signInWithGoogle?: () => Promise<UserCredential>;
  signOut?: () => Promise<void>;
}

export const FirebaseUserContext = React.createContext<FirebaseUser>({
  isLoading: true,
});

export interface FirebaseUserProviderProps {
  children: React.ReactNode;
}

/** Firebase Auth user provider */
const FirebaseUserProvider: React.FC<FirebaseUserProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<FirebaseUser>({ isLoading: true });
  const auth = getAuth();
  const pathname = usePathname()
  const isDocsPath = pathname.startsWith("/docs");


  useEffect(() => {
    const signInWithGoogle = () =>
      signInWithPopup(auth, new GoogleAuthProvider());
    const signOut = () => auth.signOut();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // console.log("Firebase auth current user changed", currentUser);
      setUser({
        currentUser,
        isLoading: false,
        isSignedIn: !!currentUser,
        signInWithGoogle,
        signOut,
      });
    });
    return unsubscribe;
  }, [auth]);

  return (
    <FirebaseUserContext.Provider value={user}>
      {user.isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner/>
        </div>
      ) : isDocsPath || user.isSignedIn ? (
        children
      ) : (
        <SignInContainer />
      )}
    </FirebaseUserContext.Provider>
  );
};

export default FirebaseUserProvider;
