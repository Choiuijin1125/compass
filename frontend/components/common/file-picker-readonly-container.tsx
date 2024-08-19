import React, { useState, useCallback } from "react";
import { useFetchTreeData } from "@/hooks/use-file-fetch";
import { FileExplorerReadonlyrProps } from "@/types/file";
import RecursiveCompReadonly from "./file-picker/recursive-comp-readonly";

const FileExplorerReadonly: React.FC<FileExplorerReadonlyrProps>  = ({
  userId,
  rootFile,
  checkItems,
  setCheckItems
}) => {
  const { tree, expanded } = useFetchTreeData(userId, rootFile)

  
  return (
    <div>
      {tree ? (
        <RecursiveCompReadonly
          rowData={tree}
          paddingLeft={0}
          checkItems={checkItems}
          setCheckItems={setCheckItems}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default FileExplorerReadonly