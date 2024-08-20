import React, { useEffect, useMemo, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import FileExplorerReadonly from '../file-picker-readonly-container';
import "@/components/common/scroll-style.css"
import {
  getMessagesCollection,
  subscribeToMessages
} from "@/lib/firebase/messages";
import { FirestoreMessageData } from "@/types/message";
import { addDoc, Timestamp } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string | undefined;
  threadId: string | undefined;
}

const SaveConversationsModal = ({ isOpen, setIsOpen, userId, threadId }: Props) => {

  const [toggleSave, setToggleSave] = useState(false); // 저장 중 감시

  const [selectFile, setSelectFile] = useState("");
  const [selectFilePath, setSelectFilePath] = useState("");
  const [selectFolder, setSelectFolder] = useState("");
  const [selectFolderId, setSelectFolderId] = useState("");

  const [checkItem, setCheckItem] = useState<any[]>([]);

  useEffect(() => {
    const fileVector = checkItem.find((x: any) => x.file_type === "FILE");
    const folderVector = checkItem.find((x: any) => x.file_type === "FOLDER");
    if (fileVector) {
      setSelectFile(fileVector?.basename);
      setSelectFilePath(fileVector?.path);
    } else {
      setSelectFile("");
      setSelectFilePath("");
    }

    if (folderVector) {
      setSelectFolder(folderVector?.basename);
      setSelectFolderId(folderVector?.path);
    } else {
      setSelectFolder("");
      setSelectFolderId("");
    }
  }, [checkItem]);

  {/* save converstations prompts!! */}

  const [messages, setMessages] = useState<FirestoreMessageData[]>([]);

  const messagesCollection: any = useMemo(() => {
    if (!userId) return null;
    if (!threadId) return null;
    return getMessagesCollection(userId, threadId);
  }, [userId, threadId]);

  useEffect(() => {
    if (!userId || !messagesCollection) return;

    const unsubscribe = subscribeToMessages(messagesCollection, setMessages);
    return unsubscribe;
  }, [userId, threadId, messagesCollection]);

  const sendMessage = async (userMsg: string) => {
    if (!userId) return;
    setToggleSave(true);
    setMessages((prev) => [...prev, { prompt: userMsg }]);
    await addDoc(messagesCollection, {
      prompt: "Save this conversation",
      createTime: Timestamp.now(),
      template_path: selectFilePath,
      save_path_id: selectFolderId,
    }).then((res) => {
      setToggleSave(false);
      setIsOpen(false);
    });
  };



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <p className="text-[1.4rem] font-semibold mb-4">Save Conversations</p>
            <p>save your conversations with firebase storage</p>
          </DialogTitle>
          <DialogDescription>
            
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 mb-5">
          <p className="font-semibold">Templates</p>
          <Input
            className={`flex-1 cursor-default`}
            value={selectFile}
            placeholder="Please select a file"
            readOnly
          />
        </div>
        <div className="flex items-center gap-3">
          <p className="font-semibold">Save path</p>
          <Input
            className={`flex-1 cursor-default`}
            value={selectFolder}
            placeholder="Please select a folder"
            readOnly
          />
        </div>
        <div 
          className={`
            file-picker-readonly 
            h-[300px] mt-8 overflow-y-auto scroll_conatiner
          `}
        >
          <div className="tree-container">
            <FileExplorerReadonly
              userId={userId}
              rootFile={"core_memory_files"}
              checkItems={checkItem}
              setCheckItems={setCheckItem}
            />
          </div>
          <div className="tree-container">
            <FileExplorerReadonly
              userId={userId}
              rootFile={"recall_memory_files"}
              checkItems={checkItem}
              setCheckItems={setCheckItem}
            />
          </div>
        </div>
        <div className="modal-bottom flex justify-end mt-5">
          <Button
            type="submit"
            onClick={() => sendMessage("Please save this dialog")}
            disabled={!selectFile || !selectFolder}
          >
            {toggleSave ? <LoadingSpinner /> : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SaveConversationsModal