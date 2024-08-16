import { Checkbox } from "@/components/ui/checkbox";
import {
  collection,
  getFirestore,
  onSnapshot,
  query,
  CollectionReference,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState, useCallback } from "react";


interface FileExplorerProps {
  userId: string | undefined;
  rootFile: RootFile;
  threadId?: string;
  pathName: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  userId,
  rootFile,
  threadId,
  pathName,
}) => {
  const [tree, setTree] = useState<FileData | null>(null);
  const [checkItems, setCheckItems] = useState<string[]>([]);
  // console.log(rootFile, "선택", checkItems);

  useEffect(() => {
    if (!threadId) {
      setCheckItems([]);
    }
  }, [threadId]);

  {
    /* 파이어베이스에서 가져오기 */
  }
  useEffect(() => {
    if (!userId) return;
    if (!threadId) return;

    const db = getFirestore();
    const threadDocRef = doc(db, "users", userId, "threads", threadId);

    // onSnapshot을 사용하여 실시간 업데이트 수신
    const unsubscribe = onSnapshot(
      threadDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          // 문서가 존재할 경우 데이터 가져오기
          const threadData = docSnap.data();
          // 특정 필드 값에 접근
          const specificField = threadData[rootFile];

          if (!specificField) {
            setCheckItems([]);
          } else {
            setCheckItems([...specificField]);
          }
        } else {
          console.log("No such document!");
        }
      },
      (error) => {
        console.log("Error getting document:", error);
      }
    );

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, threadId, rootFile]
  );

  {
    /* 파이어베이스로 변경정보 전달 */
  }
  // checkItems 상태가 변경될 때 Firestore에 업데이트
  useEffect(() => {
    if (!userId) return;
    if (!threadId) return;
    if (!rootFile) return;

    const db = getFirestore();
    const threadDocRef = doc(db, "users", userId, "threads", threadId);

    // Firestore에 checkItems 업데이트
    const updateCheckItems = async () => {
      try {
        await updateDoc(threadDocRef, {
          [rootFile]: checkItems.length > 0 ? checkItems : [], // Firestore의 필드 업데이트
        });
      } catch (error) {
        console.error("Error updating document:", error);
      }
    };

    updateCheckItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkItems]);

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
      });
  
      const formattedTree = formatTree(root[rootFile as string]);
      setExpanded(expandedState);
      return formattedTree;
    },
    [rootFile, setExpanded]  
  )
  useEffect(() => {
    if (filesCollection) {
      const q = query(filesCollection);
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        buildTree(querySnapshot).then(setTree);
      });

      return () => unsubscribe();
    }
  }, [filesCollection, buildTree]);

  return (
    <div>
      {/* <h1>File Explorer</h1> */}
      {tree ? (
        <RecursiveComp
          rowData={tree}
          paddingLeft={0}
          checkItems={checkItems}
          setCheckItems={setCheckItems}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

interface RecursiveCompProps {
  rowData: FileData;
  paddingLeft: number;
  checkItems: string[];
  setCheckItems: React.Dispatch<React.SetStateAction<string[]>>;
}

const RecursiveComp: React.FC<RecursiveCompProps> = ({
  rowData,
  paddingLeft,
  checkItems,
  setCheckItems,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const collectAllItemIds = (
    item: FileData,
    itemArray: string[] = []
  ): string[] => {
    if (!itemArray.includes(item.file_id)) {
      itemArray.push(item.file_id);
    }

    if (item.children) {
      item.children.forEach((child: FileData) => {
        collectAllItemIds(child, itemArray);
      });
    }

    return itemArray;
  };

  const handleCheck = (
    checked: boolean,
    item: FileData,
    checkItems: string[],
    setCheckItems: (value: React.SetStateAction<string[]>) => void
  ) => {
    let newCheckItems = [...checkItems];
    if (checked) {
      newCheckItems = [...newCheckItems, ...collectAllItemIds(item)];
    } else {
      const itemsToRemove = collectAllItemIds(item);
      newCheckItems = newCheckItems.filter(
        (fileId) => !itemsToRemove.includes(fileId)
      );
    }
    setCheckItems(newCheckItems);
  };

  const isChecked = (file_id: string) => checkItems.includes(file_id);

  return (
    <div style={{ paddingLeft }} className="my-2">
      <div className="flex items-center space-x-2 min-w-fit">
        <Checkbox
          // id={rowData.file_id}
          checked={isChecked(rowData.file_id)}
          onCheckedChange={(e: any) =>
            handleCheck(e, rowData, checkItems, setCheckItems)
          }
        />
        <label
          // htmlFor={rowData.file_id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 min-w-fit"
          title={rowData.basename}
        >
          <span className="mr-1">
            {rowData.file_type === "FOLDER" ? "📁" : "📄"}
          </span>
          <span className="leading-[1.5]">{rowData.basename}</span>
        </label>
        {rowData.file_type === "FOLDER" && rowData.children?.length > 0 && (
          <span
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer"
            style={{
              transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.3s ease-in-out",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 6 L8 10 L12 6 Z" fill="#A0AEC0" />
            </svg>
          </span>
        )}
      </div>
      {isOpen &&
        rowData.file_type === "FOLDER" &&
        rowData.children?.map((child) => (
          <RecursiveComp
            key={child.file_id}
            rowData={child}
            paddingLeft={paddingLeft + 20}
            checkItems={checkItems}
            setCheckItems={setCheckItems}
          />
        ))}
    </div>
  );
};

export default FileExplorer;
