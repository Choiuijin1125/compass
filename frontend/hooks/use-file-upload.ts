import { useEffect, useRef } from "react";
import { doc, getFirestore, updateDoc, onSnapshot } from "firebase/firestore";
import { RootFile } from "@/types/file";

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, threadId, rootFile]);


  // useEffect(() => {
  //   if (!userId || !threadId || !rootFile) return;
  //   const current = pathName.split("/")[1];
  //   const db = getFirestore();
  //   const threadDocRef = doc(db, "users", userId, "threads", threadId);

  //   const updateCheckItems = async () => {
  //     try {
  //       await updateDoc(threadDocRef, {
  //         [rootFile]: checkItems.length > 0 ? checkItems : [],
  //       });
  //     } catch (error) {
  //       console.error("Error updating document:", error);
  //     }
  //   };

  //   updateCheckItems();

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [checkItems]);

  

  const updateCheckItems = async () => {
    if (!userId || !threadId || !rootFile) return;
    const db = getFirestore();
    const threadDocRef = doc(db, "users", userId, "threads", threadId);
    try {
      await updateDoc(threadDocRef, {
        [rootFile]: checkItems.length > 0 ? checkItems : [],
      });
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return {
    updateCheckItems
  }
};
