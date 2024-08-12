import { storage } from "@/lib/firebase.config";
import { ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import { addFolder } from "@/lib/firebase-store";
type RootFile = "core_memory_files" | "recall_memory_files";

export const folderUpload = async (
  path: string,
  parent_path: string,
  folderName: string,
  getFolders: () => void,
  setFolderName: React.Dispatch<React.SetStateAction<string>>,
  userId: string,
  rootFile: RootFile
) => {
  // 더미 파일 생성 (빈 내용의 파일)
  const dummyFile = new Blob([""], { type: "text/plain" });
  const fileName = "dummy.txt";
  const storageRef = ref(
    storage,
    `${userId}/${path}/${folderName}/${fileName}`
  );

  try {
    // 더미 파일 업로드
    const snapshot = await uploadBytes(storageRef, dummyFile).then((res) => {
      addFolder(
        folderName,
        v4(),
        "FOLDER",
        path,
        parent_path,
        getFolders,
        setFolderName,
        userId,
        rootFile
      );
    });
    // console.log("폴더 추가 완료", snapshot);
  } catch (error) {
    console.error("폴더 추가 에러", error);
  }
};
