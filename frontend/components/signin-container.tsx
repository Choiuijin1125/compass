import { BackgroundBeams } from "@/components/ui/background-beams";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { SignIn } from "./common/sign-in/sign-in";


const SignInContainer: React.FC<{}> = ({}) => {
  // const user = useContext(FirebaseUserContext);

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
              Never Lose a Moment<br/>
              <Highlight className="text-white">
              Capture it all
              </Highlight>
            </motion.h1>
          </HeroHighlight>
          <div className="flex justify-center items-center mt-10 flex-col">
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
