"use client";
import { Button } from "@/components/ui/button";
import "./scrollStyle.css";
import React from "react";
import FilePickerModal from "../filePicker/FilePickerModal";
import { FirebaseUserContext } from "@/lib/firebase-user";
import FileExplorer from "../filePicker/FileExplorer";
import DialogModal from "./DialogModal";

type RootFile = "core_memory_files" | "recall_memory_files";

interface Props {
  threadId?: string;
  pathName: string;
}

const Memory = ({ threadId, pathName }: Props) => {
  const user = React.useContext(FirebaseUserContext);

  {
    /* 파일 피커 모달 */
  }
  const [isFilePicker, setIsFilePicker] = React.useState(false);
  const [rootFile, setRootFile] = React.useState<RootFile>("core_memory_files");

  {
    /* 대화내용 저장 */
  }
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
              userId={user.currentUser?.uid}
              rootFile={"core_memory_files"}
              threadId={threadId}
              pathName={pathName}
            />
          </div>
          <p className="font-bold">Recall Memories</p>
          <div className="tree-container">
            <FileExplorer
              userId={user.currentUser?.uid}
              rootFile={"recall_memory_files"}
              threadId={threadId}
              pathName={pathName}
            />
          </div>
        </div>
      </div>
      <div className="picker-area p-6">
        <Button
          className="flex items-center justify-center gap-2 w-full mt-4 text-center"
          onClick={() => {
            setRootFile("core_memory_files");
            setIsFilePicker(true);
          }}
        >
          Core File Picker
        </Button>
        <Button
          className="flex items-center justify-center gap-2 w-full mt-4 text-center"
          onClick={() => {
            setRootFile("recall_memory_files");
            setIsFilePicker(true);
          }}
        >
          Recall File Picker
        </Button>
        {isFilePicker && (
          <FilePickerModal
            rootFile={rootFile}
            setIsFilePicker={setIsFilePicker}
          />
        )}
        <Button
          className="flex items-center justify-center gap-2 w-full mt-4 text-center"
          onClick={() => setIsSaveConversationsOpen(true)}
          disabled={!threadId}
        >
          Save Conversations
        </Button>
        {isSaveConversationsOpen && 
        <DialogModal 
          userId={user.currentUser?.uid} 
          setIsOpen={setIsSaveConversationsOpen} 
          threadId={threadId}
        />
        }
      </div>
    </div>
  );
};

export default Memory;
