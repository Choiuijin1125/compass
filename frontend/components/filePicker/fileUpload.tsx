import { storage } from "@/lib/firebase.config";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { addFiles } from "@/lib/firebase-store";
import { v4 } from "uuid";
type RootFile = "core_memory_files" | "recall_memory_files";

export const fileUpload = (
  file: any,
  setProgress: Function,
  parent_path: string,
  file_type: "FOLDER" | "FILE",
  path: string,
  setToggleFileUpload: React.Dispatch<React.SetStateAction<boolean>>,
  getFiles: () => void,
  userId: string,
  rootFile: RootFile
) => {
  // 파일의 확장자나 MIME 타입을 추출
  const fileExtension = file.name.split(".").pop();
  const mimeType = file.type;

  // 파일 메타데이터 생성
  const metadata = {
    contentType: mimeType,
    customMetadata: {
      extension: fileExtension,
      uploadedBy: userId,
    },
  };

  const storageRef = ref(storage, `${userId}/${path}/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      setProgress(progress);
    },
    (error) => {
      alert(error);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        addFiles(
          file.name,
          v4(),
          file_type,
          parent_path,
          path,
          downloadURL,
          getFiles,
          userId,
          rootFile
        );
        setToggleFileUpload(false);
      });
    }
  );
};
