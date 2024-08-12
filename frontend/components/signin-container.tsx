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

import React, { useContext } from "react";
import Image from "next/image"
import { motion } from "framer-motion"
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { FirebaseUserContext } from "@/lib/firebase-user";
import { SignIn } from "./common/SignIn";

/**
 * Sign in with Google button, using Firebase Auth
 *
 * Using Tailwind for all styling.
 */
const SignInContainer: React.FC<{}> = ({}) => {
  const user = useContext(FirebaseUserContext);

  return (
    <main className="flex h-[100vh]  flex-col bg-[#18181B] text-white">
      <BackgroundBeams />
      <div className="h-10 p-10">
        <p className="flex items-center gap-2 text-[1.2rem ]">
          <Image src="/icon/mark_white.svg" alt="" width={24} height={24} />
          Compass
        </p>
      </div>
      <div className="flex-[1] flex justify-center items-center">
        <div className="content-container">
          <HeroHighlight className="text-white" containerClassName="justify-start">
            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: [20, -5, 0],
              }}
              transition={{
                duration: 2.5,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="text-[3rem] px-4 font-medium text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto "
            >
              Remember everything,<br/>
              <Highlight className="text-white">
                don&#39;t lose your memories
              </Highlight>
            </motion.h1>
          </HeroHighlight>
          <div className="flex justify-center items-center mt-10 flex-col">
            {/* <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              type="button"
              onClick={user.signInWithGoogle}
            >
              Sign in with Google
            </button> */}
            <SignIn/>
            <div className="mt-6 text-[#71717A] text-[14px] text-center">
              <p>By clicking continue, you agree to</p>
              <p>our &nbsp;
                <span className="underline cursor-pointer">Terms of Service </span> 
                &nbsp;and&nbsp;
                <span className="underline cursor-pointer">Privacy Policy.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignInContainer;
