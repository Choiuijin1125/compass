"use client";

import React from 'react'
import NavLayout from "@/components/nav-layout";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { useParams, usePathname } from "next/navigation";

import Memory from "@/components/common/Memory";

interface FrameLayoutProps {
  children: React.ReactNode;
}


const FrameLayout = ({children}: FrameLayoutProps) => {
  const params = useParams()
  const pathName = usePathname()

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] rounded-lg border"
    >
      <ResizablePanel defaultSize={15} maxSize={20}>
        <NavLayout threadId={params?.threadId as string}/>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        <div className="flex flex-col">
          <div className="flex h-full items-center justify-center p-6">
            {children}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={15} maxSize={25}>
        <Memory threadId={params?.threadId as string} pathName={pathName}/>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default FrameLayout