"use client";
import React from "react";
import Link from "next/link";
import { useThreads } from "@/lib/firebase/threads";
import { usePathname } from "next/navigation"; // Next.js의 useRouter를 가져옵니다.
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import "@/components/common/scroll-style.css"

const ThreadsList: React.FC = () => {
  const router = useRouter();
  const { threads, loading } = useThreads();
  const currentPath = usePathname();

  if (loading) {
    return <p>Loading threads...</p>;
  }

  if (threads.length === 0) {
    return <p>No threads found.</p>;
  }

  return (
    <div className="h-[50%] overflow-y-auto scroll_conatiner flex flex-col items-start">
      {threads.map((link, index) => {
        const isActive = currentPath === `/threads/${link.id}`;

        return (
          <Button
            variant={isActive ? "default" : "ghost"}
            onClick={() => router.push(`/threads/${link.id}`)}
            className="mb-[2px]"
            key={link.id}
          >
            {link.id}
          </Button>
        )
      })}
    </div>
  );
};

export default ThreadsList;
