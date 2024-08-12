import { ref, listAll, getDownloadURL } from "firebase/storage";
import { useEffect, useState, useCallback } from "react";
import { storage } from "@/lib/firebase.config";

export const useFetchFiles = (userId: string, path: string) => {
  const [fileList, setFileList] = useState<any[]>([]);

  const getFiles = useCallback(
    async () => {
      if (path && userId) {
        const storageRef = ref(storage, `${userId}/${path}`);
        try {
          const result = await listAll(storageRef);
          // console.log("result",result)
          const files = await Promise.all(result.items.map(async (itemRef) => {
            // console.log("itemRef",itemRef)
            const downloadURL = await getDownloadURL(itemRef);
            return {
              name: itemRef.name,
              fullPath: itemRef.fullPath,
              downloadURL: downloadURL,
            };
          }));
          const temp = files.filter((x: any) => !x.fullPath.includes("dummy.txt"))
          setFileList(temp);
        } catch (error) {
          console.error("Error fetching files:", error);
        }
      }
    },
    [path, userId]
  )

  useEffect(() => {
    getFiles();
  }, [path, userId, getFiles]);

  return { fileList, getFiles, setFileList };
};