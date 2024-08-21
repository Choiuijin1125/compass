"use client";
import * as React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import MemoryContainer from "./sidebar/memory-container";
import FileExplorer from "./file-picker-container";
import { FirebaseUserContext } from "@/lib/firebase-user";
import NavContainer from "./sidebar/nav-container";

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const user = React.useContext(FirebaseUserContext);
  const uid = user.currentUser?.uid ?? "";

  return (
    <ResizablePanelGroup 
      direction="horizontal"
      className="min-h-[200px] rounded-lg border"
    >
      <ResizablePanel defaultSize={15} className="h-[99vh]">
        <NavContainer/>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={65} className="h-[99vh]">
      <div className="flex flex-col">
        <div className="flex h-full items-center justify-center p-6">
          {children}
        </div>
      </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={20} className="h-[99vh]">
        <MemoryContainer />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Sidebar;
