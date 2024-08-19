import { RootFile } from "@/types/file";
import { doc, getFirestore, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect } from "react";

export const useFirestoreUpdates = (
  userId: string | undefined,
  threadId: string | undefined,
  rootFile: RootFile,
  pathName: string,
  checkItems: string[],
  setCheckItems: React.Dispatch<React.SetStateAction<string[]>>
) => {
  useEffect(() => {
    if (!threadId) {
      setCheckItems([]);
    }
  }, [threadId]);

  useEffect(() => {
    if (!userId || !threadId) return;
    const current = pathName.split("/")[1];

    const db = getFirestore();
    const threadDocRef = doc(db, "users", userId, "threads", threadId);

    const unsubscribe = onSnapshot(threadDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const threadData = docSnap.data();
        const specificField = threadData[rootFile];

        if (!specificField) {
          setCheckItems([]);
        } else {
          setCheckItems([...specificField]);
        }
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe();
  }, [userId, threadId, rootFile, pathName, setCheckItems]);

  useEffect(() => {
    if (!userId || !threadId || !rootFile) return;

    const current = pathName.split("/")[1];
    const db = getFirestore();
    const threadDocRef = doc(db, "users", userId, "threads", threadId);

    const updateCheckItems = async () => {
      try {
        await updateDoc(threadDocRef, {
          [rootFile]: checkItems.length > 0 ? checkItems : [],
        });
      } catch (error) {
        console.error("Error updating document:", error);
      }
    };

    updateCheckItems();
  }, [checkItems]);};