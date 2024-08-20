import { FileData, RootFile } from "@/types/file";
import {
  collection,
  getFirestore,
  onSnapshot,
  query,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useFetchTreeData = (
  userId: string | undefined,
  rootFile: RootFile
) => {
  const [tree, setTree] = useState<FileData | null>(null);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const firestore = getFirestore();
  const filesCollection = useMemo(
    () =>
      userId ? collection(firestore, `users/${userId}/${rootFile}`) : null,
    [firestore, userId, rootFile]
  );

  const buildTree = useCallback(
    async (querySnapshot: any) => {
      const root: { [key: string]: any } = {
        [rootFile as string]: {
          children: {},
          basename: rootFile,
          file_type: "FOLDER",
          path: rootFile,
        },
      };
      const expandedState: { [key: string]: boolean } = {};

      querySnapshot.forEach((doc: any) => {
        const data = doc.data() as FileData;
        const pathParts = data.path.split("/").slice(1);
        let currentLevel = root[rootFile as string].children;

        pathParts.forEach((part, index) => {
          const currentPath = pathParts.slice(0, index + 1).join("/");
          if (!expandedState[currentPath]) {
            expandedState[currentPath] = true;
          }

          if (!currentLevel[part]) {
            currentLevel[part] = {
              basename: part,
              children: {},
              file_type: "FOLDER",
              path: currentPath,
            };
          }
          if (index === pathParts.length - 1) {
            currentLevel[part] = { ...currentLevel[part], ...data };
          } else {
            currentLevel = currentLevel[part].children;
          }
        });
      });

      const formatTree = (node: any): FileData => ({
        basename: node.basename,
        file_id: node.file_id || "",
        file_type: node.file_type,
        path: node.path,
        children: Object.values(node.children || {}).map(formatTree),
        state: node.state
      });

      const formattedTree = formatTree(root[rootFile as string]);
      setExpanded(expandedState);
      return formattedTree;
    },
    [rootFile, setExpanded]
  );

  useEffect(() => {
    if (filesCollection) {
      const q = query(filesCollection);
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        buildTree(querySnapshot).then(setTree);
      });

      return () => unsubscribe();
    }
  }, [filesCollection, buildTree]);

  return { tree, expanded };
};