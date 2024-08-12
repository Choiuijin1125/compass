import { ref, listAll } from "firebase/storage";
import { useEffect, useState, useCallback } from "react";
import { storage } from "@/lib/firebase.config";

export const useFetchFolders = (userId: string, path: string) => {
  const [folderList, setFolderList] = useState<any[]>([]);
  
  const getFolders = useCallback(
    async () => {
      if (path && userId) {
        const storageRef = ref(storage, `${userId}/${path}`);
        
        try {
          const result = await listAll(storageRef);
          const folders = result.prefixes.map((folderRef) => ({
            name: folderRef.name,
            fullPath: folderRef.fullPath,
          }));
          setFolderList(folders);
        } catch (error) {
          console.error("Error fetching folders:", error);
        }
      }
    },
    [path, userId]
  )

  useEffect(() => {
    getFolders();
  }, [path, userId, getFolders]);

  return { folderList, getFolders };
};