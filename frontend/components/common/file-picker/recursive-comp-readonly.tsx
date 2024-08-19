import { RecursiveCompReadonlyProps, FileType } from '@/types/file'
import React, { useState } from 'react'
import { Folder, File } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const RecursiveCompReadonly:React.FC<RecursiveCompReadonlyProps> = ({
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
          className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 min-w-fit"
          title={rowData.basename}
        >
          <span className="mr-1">
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
      </div>
      {isOpen &&
        rowData.file_type === "FOLDER" &&
        rowData.children?.map((child) => (
          <RecursiveCompReadonly
            key={child.file_id}
            rowData={child}
            paddingLeft={paddingLeft + 20}
            checkItems={checkItems}
            setCheckItems={setCheckItems}
          />
        ))}
    </div>
  )
}

export default RecursiveCompReadonly