import React, { useContext, useState, useMemo, useEffect } from "react";
import { FirebaseUserContext } from "@/lib/firebase-user";
import styles from "./FilePickerModal.module.css";
import FilePicker from "./FilePicker";
import { useFetchFolders } from "./useFetchFolders";
import { useFetchFiles } from "./useFetchFiles";
import { FcFolder, FcFile } from "react-icons/fc";
import { IoClose } from "react-icons/io5";
import { LoadingSpinner } from "../ui/loading-spinner";

type RootFile = "core_memory_files" | "recall_memory_files";

interface Props {
  setIsFilePicker: React.Dispatch<React.SetStateAction<boolean>>;
  rootFile: RootFile;
}

const FilePickerModal = ({ setIsFilePicker, rootFile }: Props) => {
  const [toggleLoading, setToggleLoading] = React.useState(false) // 로딩 중 감시
  const user = useContext(FirebaseUserContext);
  const [userId, setUserId] = React.useState("");
  const [path, setPath] = React.useState<string>(rootFile);
  const [parentFolder, setParentFolder] = React.useState("");
  // console.log("path", path);

  React.useEffect(() => {
    if (user.currentUser?.uid) {
      setUserId(user.currentUser?.uid);
    }
  }, [user.currentUser?.uid]);

  React.useEffect(() => {
    if (!path) return;

    const pathSegments = path.split("/");
    const targetValue = pathSegments[pathSegments.length - 1];
    if (targetValue) setParentFolder(targetValue);
  }, [path]);

  const goFolder = (targetName: string, path: string) => {
    const pathSegments = path.split("/");
    const targetIndex = pathSegments.indexOf(targetName);

    if (targetIndex !== -1) {
      const newPath = pathSegments.slice(0, targetIndex + 1).join("/");
      setPath(newPath);
    }
  };

  const { folderList, getFolders } = useFetchFolders(userId, path);
  const { fileList, getFiles, setFileList } = useFetchFiles(userId, path);

  useEffect(() => {
    setToggleLoading(true)
    // 폴더 리스트가 변경될 때 파일 리스트를 비움
    setFileList([]);
    
    // 새로운 폴더에 맞는 파일 리스트를 가져옴
    getFiles().then((res) => setToggleLoading(false)).catch((err) => setToggleLoading(false))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderList]);

  const [timer, setTimer] = React.useState()

  const debounce = (callback: () => void, duration: number) => {
    let debounceTimer: any
    clearTimeout(timer)
    debounceTimer = setTimeout(() => callback(), duration)
    setTimer(debounceTimer)
    // console.log("타이머",timer)
  }


  return (
    <div className={styles.modal_wrapper}>
      <div className={styles.modal_body}>
        <div
          className={`
          modal-body bg-white p-6 rounded-[8px] w-[800px] h-[750px] overflow-y-auto
          `}
        >
          <div className="modal-header relative mb-4">
            <div
              className="absolute right-0 top-0 cursor-pointer"
              onClick={() => setIsFilePicker(false)}
            >
              <IoClose size={20}/>
            </div>
            <p className="text-[1.4rem] font-semibold">
              {rootFile === "core_memory_files" && "Core Memory"}
              {rootFile === "recall_memory_files" && "Recall Memory"}
              &nbsp;Picker
            </p>
            <div>
              {path &&
                path?.split("/").map((x, index) => (
                  <span key={index}>
                    {index !== 0 && <span className="mr-1">/</span>}
                    <span
                      onClick={() => goFolder(x, path)}
                      className="mr-1 cursor-pointer hover:text-[#0083ED]"
                    >
                      {index === 0 ? "Home" : x}
                    </span>
                  </span>
                ))}
            </div>
          </div>
          <FilePicker
            path={path} // 예시값: "로그인 정보/빈 폴더 3"
            parent_path={parentFolder} // 예시값: "로그인 정보"
            getFiles={getFiles}
            getFolders={getFolders}
            rootFile={rootFile}
          />
          {toggleLoading ? (
          <div className="w-[100%] h-[50%] flex justify-center items-center">
            <LoadingSpinner/>
          </div>
          ) : (
          <>
            <div className="folder-list-container flex flex-wrap gap-4 my-4">
              {folderList &&
                folderList?.map((folder: any, index: number) => (
                  <div key={index} className="max-w-[180px]">
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        debounce(() => setPath(path + "/" + folder.name) , 300)
                      }}
                    >
                      <FcFolder size={100} />
                    </div>
                    <p className="break-words font-semibold">{folder.name}</p>
                  </div>
                ))}
            </div>
            <div className="file-list-container flex flex-wrap gap-4">
              {fileList &&
                fileList?.map((file: any, index: number) => (
                  <div key={index} className="max-w-[180px]">
                    <FcFile size={100} />
                    <p className="break-words font-semibold">{file.name}</p>
                  </div>
                ))}
            </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePickerModal;
