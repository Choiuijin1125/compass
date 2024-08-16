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
  checkItems: any
  setCheckItems: React.Dispatch<React.SetStateAction<any[]>>
}

const FileTree: React.FC<FileExplorerProps> = ({
  userId,
  rootFile,
  checkItems,
  setCheckItems
}) => {
  const [tree, setTree] = useState<FileData | null>(null);
  // const [checkItems, setCheckItems] = useState<string[]>([]);
  // console.log(rootFile, "선택", checkItems);


  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const firestore = getFirestore();
  const filesCollection = useMemo(
    () =>
      userId ? collection(firestore, `users/${userId}/${rootFile}`) : null,
    [firestore, userId, rootFile]
    // eslint-disable-next-line react-hooks/exhaustive-deps
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


  {/* 체크기능 */}
  const handleCheck = (
    checked: boolean, 
    item: any, 
    checkItems: any[], 
    setCheckItems: (value: React.SetStateAction<any[]>) => void,
  ) => {
      // 단일선택
      if (checked) {
        // 단일 선택 시 체크된 아이템을 배열에 추가
        setCheckItems(prev => [...prev, item])
      } else {
        // 단일 선택 해제 시 체크된 아이템을 제외한 배열 (필터)
        setCheckItems(checkItems.filter((el) => el.file_id !== item.file_id))
      }
    }
  

  /* 체크박스 값 반환 함수 */
  const checkVal = (file_id: string, checkItems: any) => {
    return checkItems.findIndex((x: any) => x.file_id === file_id) !== -1 ? true : false
  }

  {/*체크 불가능*/}
  const checkBan = (file_type: FileType, checkItems: any[], file_id: string) => {
    if(checkItems.find((x: any) => x.file_type === file_type)) {
      if(checkItems.find((x: any) => x.file_id === file_id)) return false
      return true
    } else return false
  }


  return (
    <div style={{ paddingLeft }} className="my-2">
      <div className="flex items-center space-x-2 min-w-fit">
        <Checkbox
          id={rowData.file_id}
          checked={checkVal(rowData.file_id, checkItems)}
          onCheckedChange={(e: any) =>
            handleCheck(e, rowData, checkItems, setCheckItems)
          }
          disabled={checkBan(rowData.file_type, checkItems, rowData.file_id)}
        />
        <label
          htmlFor={rowData.file_id}
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

export default FileTree;
