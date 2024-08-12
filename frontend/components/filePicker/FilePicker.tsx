import React, { ChangeEvent, useContext } from "react";
import { fileUpload } from "./fileUpload";
import { folderUpload } from "./folderUpload";
import { Button } from "../ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Input } from "../ui/input";

import { FirebaseUserContext } from "@/lib/firebase-user";
type RootFile = "core_memory_files" | "recall_memory_files";

interface Props {
  path: string;
  parent_path: string;
  getFiles: () => void;
  getFolders: () => void;
  rootFile: RootFile;
}

const FilePicker = ({
  path,
  parent_path,
  getFiles,
  getFolders,
  rootFile,
}: Props) => {
  const user = useContext(FirebaseUserContext);
  const [userId, setUserId] = React.useState("");

  React.useEffect(() => {
    if (user.currentUser?.uid) {
      setUserId(user.currentUser?.uid);
    }
  }, [user.currentUser?.uid]);

  const [isFileVisible, setFileVisible] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [folderName, setFolderName] = React.useState("");

  const [toggleFileUpload, setToggleFileUpload] = React.useState(false); // 업로드 중 감시

  React.useEffect(() => {
    if (!toggleFileUpload) {
      setProgress(0);
      setFileVisible(false);
    }
  }, [toggleFileUpload]);

  const uploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    let files = event.target.files;

    if (files && files.length > 0) {
      setToggleFileUpload(true);
      Array.from(files).forEach((file) => {
        fileUpload(
          file,
          setProgress,
          parent_path,
          "FILE",
          path,
          setToggleFileUpload,
          getFiles,
          userId,
          rootFile
        );
      });
    }
  };

  return (
    <div>
      <Button onClick={() => setFileVisible(!isFileVisible)}>
        파일 업로드
      </Button>
      {isFileVisible && (
        <input
          onChange={(event) => uploadFile(event)}
          type="file"
          className="file-input w-full max-w-xs ml-4"
          multiple // 다중 파일 선택 허용
        />
      )}
      {toggleFileUpload && (
        <div className="mt-4">
          <ProgressBar value={progress} />
          {progress} %
        </div>
      )}
      <div className="mt-4 flex gap-4">
        <Input
          value={folderName}
          onChange={(event) => setFolderName(event.target.value)}
          placeholder="폴더명을 입력하세요."
        />
        <Button
          onClick={() =>
            folderUpload(
              path,
              parent_path,
              folderName,
              getFolders,
              setFolderName,
              userId,
              rootFile
            )
          }
          disabled={folderName.trim() === ""}
        >
          폴더 추가
        </Button>
      </div>
    </div>
  );
};

export default FilePicker;
