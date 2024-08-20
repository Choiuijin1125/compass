export interface FileData {
  basename: string;
  file_id: string;
  file_type: "FOLDER" | "FILE";
  path: string;
  children: FileData[];
}

export type FileType = "FOLDER" | "FILE"

export type RootFile = "core_memory_files" | "recall_memory_files";

export interface FileExplorerProps {
  userId: string;
  rootFile: RootFile;
  threadId?: string;
  pathName: string;
}

export interface RecursiveCompProps {
  rowData: FileData;
  paddingLeft: number;
  checkItems: string[];
  setCheckItems: React.Dispatch<React.SetStateAction<string[]>>;
  onDrop: (acceptedFiles: File[], currentPath: string) => void;
  userId: string;
  rootFile: RootFile;
  updateCheckItems?: () => void;
}


export interface FileExplorerReadonlyrProps {
  userId: string | undefined;
  rootFile: RootFile;
  checkItems: any
  setCheckItems: React.Dispatch<React.SetStateAction<any[]>>
}

export interface RecursiveCompReadonlyProps {
  rowData: FileData;
  paddingLeft: number;
  checkItems: string[];
  setCheckItems: React.Dispatch<React.SetStateAction<string[]>>;
}