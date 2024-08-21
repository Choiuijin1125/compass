import React, { useContext, useState, useMemo, useEffect } from "react";
import ThreadsList from "@/components/common/sidebar/thread-list";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import UserButton from "../sidebar/user-button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "../theme-toggle";
import { Badge } from "@/components/ui/badge"

const NavContainer = () => {
  const router = useRouter();


  return (
    <div className="side-container h-[100%] flex flex-col justify-between pb-6 min-w-[250px]">
      <div className="side-top max-h-[80%] flex flex-col items-baseline p-6">
        <p className="font-bold text-2xl mb-5 text-center flex justify-center items-center gap-2">
          <Image src="/icon/mark_black.svg" alt="" width={24} height={24} />
          Compass
        </p>
        <Badge 
          className="cursor-pointer self-end" 
          onClick={() => router.push("/docs")}
        >
          docs
        </Badge>
        <p className="title font-bold text-xl mb-3">Threads</p>
        <Button
          className="flex items-center justify-start gap-2 w-[216px]"
          onClick={() => router.push("/")}
        >
          <Image src="/icon/play_white.svg" alt="" width={18} height={18} />
          Create Chat
        </Button>
        <div className="fake h-5"></div>
        <ThreadsList/>
      </div>
      <div className="side-bottom pl-6 mb-10">
        <p className="title font-bold text-xl mb-3">Settings</p>
        <div className="cursor-pointer w-fit flex items-center gap-2 mt-4 relative">
          <UserButton />
        </div>
        <div className="mt-4">
          <ThemeToggle/>
        </div>
      </div>
    </div>
  )
}

export default NavContainer