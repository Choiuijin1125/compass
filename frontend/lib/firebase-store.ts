import { db } from "./firebase.config";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import mime from "mime-types";

type RootFile = "core_memory_files" | "recall_memory_files";

export const addFiles = async (
  basename: string,
  file_id: string,
  file_type: "FOLDER" | "FILE",
  parent_path: string,
  path: string,
  downloadURL: string,
  getFiles: () => void,
  userId: string,
  rootFile: RootFile,
  state: "COMPLETED" | "PROCESSING" | "ERROR" = "PROCESSING" // 기본값 설정
) => {
  const mimeType = mime.lookup(basename) || "application/octet-stream"; // 기본 MIME 타입 설정
  const userDocRef = doc(db, "users", userId);
  const filesCollection = collection(userDocRef, rootFile);
  try {
    const fileDocRef = doc(filesCollection, file_id);
    await setDoc(fileDocRef, {
      basename: basename,
      file_id: file_id,
      isFolder: false,
      file_type: file_type,
      parent_path: parent_path,
      path: path + "/" + basename,
      downloadURL: downloadURL,
      mimeType: mimeType, // MIME 타입 포함
      state,
    }).then((res) => {
      getFiles();
    });
  } catch (err) {
    console.log("업로드 에러", err);
  }
};

export const addFolder = async (
  basename: string,
  file_id: string, // 폴더도 고유의 아이디를 가지는데 통일성을 위해 file_id로함
  file_type: "FOLDER" | "FILE",
  path: string,
  parent_path: string,
  getFolders: () => void,
  setFolderName: React.Dispatch<React.SetStateAction<string>>,
  userId: string,
  rootFile: RootFile,
  state: "COMPLETED" | "PROCESSING" | "ERROR" = "COMPLETED" // 기본값 설정
) => {
  const userDocRef = doc(db, "users", userId);
  const filesCollection = collection(userDocRef, rootFile);
  try {
    const fileDocRef = doc(filesCollection, file_id);
    await setDoc(fileDocRef, {
      basename: basename,
      file_id: file_id,
      isFolder: true,
      file_type: file_type,
      parent_path: parent_path,
      path: path + "/" + basename,
      mimeType: "folder", // MIME 타입 포함
      state,
    });
    getFolders();
    setFolderName("");
  } catch (err) {
    console.log(err);
  }
};
