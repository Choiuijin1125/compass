import React, { useState, useCallback } from "react";
import { useFetchTreeData } from "@/hooks/use-file-fetch";
import { useFirestoreUpdates } from "@/hooks/use-file-upload";
import { fileUpload } from "@/lib/firebase/files";
import { FileExplorerProps, FileData } from "@/types/file";
import RecursiveComp from "./file-picker/recursive-comp";

const FileExplorer: React.FC<FileExplorerProps> = ({
  userId,
  rootFile,
  threadId,
  pathName,
}) => {
  const [checkItems, setCheckItems] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState(""); // 폴더 이름 상태

  const { tree, expanded } = useFetchTreeData(userId, rootFile);
  const {updateCheckItems} = useFirestoreUpdates(
    userId,
    threadId,
    rootFile,
    pathName,
    checkItems,
    setCheckItems
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[], currentPath: string) => {
      if (!userId) return;
      const pathParts = currentPath.split("/");
      const parentPath = pathParts[pathParts.length - 2];

      acceptedFiles.forEach((file) => {
        fileUpload(
          file,
          () => {}, // handle progress if needed
          parentPath,
          "FILE",
          currentPath,
          userId,
          rootFile
        );
      });

      alert("Files uploaded successfully!");
    },
    [userId, rootFile]
  );

  // 폴더 생성 함수
  const createFolder = async () => {
    // Logic for creating a new folder
  };

  return (
    <div>
      {/* 기존 File Explorer UI */}
      {tree ? (
        <RecursiveComp
          userId={userId}
          rootFile={rootFile}
          rowData={tree}
          paddingLeft={0}
          checkItems={checkItems}
          setCheckItems={setCheckItems}
          onDrop={onDrop}
          updateCheckItems={updateCheckItems}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default FileExplorer;
