import "@/components/common/scroll-style.css";
import { Button } from "@/components/ui/button";
import { FirebaseUserContext } from "@/lib/firebase-user";
import { useParams } from "next/navigation";
import React from "react";
import FileExplorer from "../file-picker-container";
import SaveConversationsModal from "./save-conversations-modal";

const MemoryContainer: React.FC<{}> = ({}) => {
  const params = useParams()
  const user = React.useContext(FirebaseUserContext);
  const uid = user.currentUser?.uid ?? "";

  const [isSaveConversationsOpen, setIsSaveConversationsOpen] = React.useState(false);

  return (
    <div className="memory-container h-[100%]  pb-6 min-w-[250px]">
      <div
        className={`
          memory-controller-area p-6 border-b-[lightGray] border-b-solid border-b-[1px]
        `}
      >
        <p className="font-bold text-[1.2rem] mb-4">Memory Controller</p>
        <div
          className={`
          min-h-[20vh]
          max-h-[40vh] overflow-y-auto
          scroll_conatiner
          `}
        >
          <p className="font-bold">Core Memories</p>
          <div className="tree-container">
            <FileExplorer
              userId={uid}
              rootFile="core_memory_files"
              pathName="threads"
              threadId={params?.threadId as string}
            />
          </div>
          <p className="font-bold">Recall Memories</p>
          <div className="tree-container">
            <FileExplorer
              userId={uid}
              rootFile="recall_memory_files"
              pathName="threads"
              threadId={params?.threadId as string}
            />
          </div>
        </div>
      </div>
      <div className="bottom-area p-6">
        <Button
          className="flex items-center justify-center gap-2 w-full mt-4 text-center"
          onClick={() => setIsSaveConversationsOpen(true)}
          disabled={!params?.threadId}
        >
          Save Conversations
        </Button>
        {isSaveConversationsOpen && 
        <SaveConversationsModal 
          userId={user.currentUser?.uid} 
          isOpen={isSaveConversationsOpen}
          setIsOpen={setIsSaveConversationsOpen} 
          threadId={params?.threadId as string}
        />
        }
      </div>
    </div>
  );
};

export default MemoryContainer;
