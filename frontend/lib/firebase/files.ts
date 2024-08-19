import { db, storage } from "@/lib/firebase.config";
import { collection, doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import mime from "mime-types";
import { v4 } from "uuid";

type RootFile = "core_memory_files" | "recall_memory_files";

export const addFiles = async (
  basename: string,
  file_id: string,
  file_type: "FOLDER" | "FILE",
  parent_path: string,
  path: string,
  downloadURL: string,
  userId: string,
  rootFile: RootFile,
  state: "COMPLETED" | "PROCESSING" | "ERROR" = "PROCESSING" // 기본값 설정
) => {
  const mimeType = mime.lookup(basename) || "application/octet-stream"; // 기본 MIME 타입 설정
  const userDocRef = doc(db, "users", userId);
  const filesCollection = collection(userDocRef, rootFile);
  try {
    const fileDocRef = doc(filesCollection, file_id);
    console.log(parent_path, path);
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
  } catch (err) {
    console.log(err);
  }
};

export const fileUpload = (
  file: any,
  setProgress: Function,
  parent_path: string,
  file_type: "FOLDER" | "FILE",
  path: string,
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
          userId,
          rootFile
        );
      });
    }
  );
};