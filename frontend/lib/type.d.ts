declare module "react-syntax-highlighter"
declare module "react-syntax-highlighter/*"
declare module "uuid"
declare module "tailwindcss"
declare module "dompurify"

type FileType = "FOLDER" | "FILE"

interface FileData {
  basename: string;
  file_id: string;
  file_type: FileType;
  path: string;
  children: FileData[];
}

type RootFile = "core_memory_files" | "recall_memory_files";

interface FirebaseUser {
  isLoading?: boolean;
  isSignedIn?: boolean;
  currentUser?: User | null;
  signInWithGoogle?: () => Promise<UserCredential>;
  signOut?: () => Promise<void>;
}