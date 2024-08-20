import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useDropzone } from "react-dropzone";
import { RecursiveCompProps, FileData } from "@/types/file";
import { v4 as uuidv4 } from "uuid"; // UUID 생성용 패키지
import { addFolder } from "@/lib/firebase/files"; // addFolder 함수 임포트
import { FolderPlus, FileUp, Folder, File } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define the CSS styles used in the dropzone
const styles = {
  dropzone: {
    border: "2px dashed #cccccc",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    margin: "10px 0",
  },
  activeDropzone: {
    backgroundColor: "#e0e7ff", // Background color when dragging
  },
  inactiveDropzone: {
    backgroundColor: "transparent", // Background color before/after dragging
  },
};

const RecursiveComp: React.FC<RecursiveCompProps> = ({
  rowData,
  paddingLeft,
  checkItems,
  setCheckItems,
  onDrop,
  userId, // userId prop 추가
  rootFile, // rootFile prop 추가
  updateCheckItems,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [newFolderName, setNewFolderName] = useState(""); // 폴더 이름 상태
  console.log(newFolderName, "newFolderName");
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles, rowData.path),
  });

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    const newFolderId = uuidv4(); // 고유 ID 생성
    await addFolder(
      newFolderName,
      newFolderId,
      "FOLDER",
      rowData.path,
      rowData.path.split("/")[2], // parent_path는 현재 폴더의 경로를 사용
      userId,
      rootFile
    );

    setNewFolderName(""); // 폴더 이름 입력창 초기화
  };

  useEffect(() => {
    if(updateCheckItems) updateCheckItems()
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkItems])

  return (
    <div style={{ paddingLeft }} className="my-2">
      <div className="flex items-center space-x-2 min-w-fit">
        <Checkbox
          checked={isChecked(rowData.file_id)}
          onCheckedChange={(e: any) =>
            handleCheck(e, rowData, checkItems, setCheckItems)
          }
        />
        <label
          className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 min-w-fit"
          title={rowData.basename}
        >
          <span className="mr-1 flex items-center">
            {rowData.file_type === "FOLDER" ? <Folder /> : ""}
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

        {rowData.file_type === "FOLDER" && (
          <div className="flex items-center">
            <Dialog>
              <DialogTrigger>
                <FolderPlus />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create new folder</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </DialogDescription>
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="New folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                    <Button onClick={createFolder}>Create</Button>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <button {...getRootProps()}>
              <FileUp />
              <input {...getInputProps()} />
            </button>
          </div>
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
            onDrop={onDrop}
            userId={userId} // userId prop 전달
            rootFile={rootFile} // rootFile prop 전달
            updateCheckItems={updateCheckItems}
          />
        ))}
    </div>
  );
};

export default RecursiveComp;
