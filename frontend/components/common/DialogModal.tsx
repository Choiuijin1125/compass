import React from "react";
import styles from "./dialogModal.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FileTree from "./FileTree";
import { IoClose } from "react-icons/io5";
import { LoadingSpinner } from "../ui/loading-spinner";

import {
  FirestoreMessageData,
  MessageData,
  prepareMessage,
} from "@/lib/message";

import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

interface Props {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string | undefined;
  threadId: string | undefined;
}

const DialogModal = ({ setIsOpen, userId, threadId }: Props) => {
  const [toggleSave, setToggleSave] = React.useState(false); // 저장 중 감시

  const [selectFile, setSelectFile] = React.useState("");
  const [selectFilePath, setSelectFilePath] = React.useState("");
  const [selectFolder, setSelectFolder] = React.useState("");
  const [selectFolderId, setSelectFolderId] = React.useState("");

  const [checkItem, setCheckItem] = React.useState<any[]>([]);

  React.useEffect(() => {
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

  const [messages, setMessages] = React.useState<MessageData[]>([]);

  const messagesCollection = React.useMemo(
    () =>
      collection(
        getFirestore(),
        `users/${userId}/threads/${threadId}/messages`
      ) as CollectionReference<FirestoreMessageData>,
    [userId, threadId]
  );

  React.useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(
      query(messagesCollection, orderBy("createTime", "asc")),
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...prepareMessage(doc.data()),
        }));
        setMessages(messages);
      }
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, threadId]);

  const sendMessage = async (userMsg: string) => {
    if (!userId) return;
    setToggleSave(true);
    setMessages((prev) => [...prev, { prompt: userMsg }]);
    await addDoc(messagesCollection, {
      prompt: "Save this conversation ",
      createTime: Timestamp.now(),
      template_path: selectFilePath,
      save_path_id: selectFolderId,
    }).then((res) => {
      setToggleSave(false);
      setIsOpen(false);
    });
  };

  return (
    <div className={styles.modal_wrapper}>
      <div className={styles.modal_body}>
        <div
          className={`
          modal-body bg-white p-6 rounded-[8px] w-[500px]
          `}
        >
          <div className="modal-header relative mb-4">
            <div
              className="absolute right-0 top-0 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <IoClose size={20} />
            </div>
            <p className="text-[1.4rem] font-semibold">Save Conversations</p>
            <p>save your conversations with google drive</p>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <p className="font-semibold">Templates</p>
            <Input
              className={`flex-1 cursor-default`}
              value={selectFile}
              placeholder="아래에서 파일을 선택하세요"
              readOnly
            />
          </div>
          <div className="flex items-center gap-3">
            <p className="font-semibold">Save path</p>
            <Input
              className={`flex-1 cursor-default`}
              value={selectFolder}
              placeholder="아래에서 폴더를 선택하세요"
              readOnly
            />
          </div>
          <div className="file-tree">
            <div className="tree-container">
              <FileTree
                userId={userId}
                rootFile={"core_memory_files"}
                checkItems={checkItem}
                setCheckItems={setCheckItem}
              />
            </div>
            <div className="tree-container">
              <FileTree
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
        </div>
      </div>
    </div>
  );
};

export default DialogModal;
