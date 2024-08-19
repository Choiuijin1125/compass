"use client";
// lib/firebase.ts
import {
  CollectionReference,
  DocumentData,
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useContext, useEffect, useMemo, useState } from "react";
import { FirebaseUserContext } from "../firebase-user";

export const createThread = async (uid: string, userMsg: string) => {
  const firestore = getFirestore();
  const threadsCollection = collection(firestore, `users/${uid}/threads`);

  const threadDoc = await addDoc(threadsCollection, {
    createTime: new Date(),
  });

  const messagesCollection = collection(
    firestore,
    `users/${uid}/threads/${threadDoc.id}/messages`
  );

  await addDoc(messagesCollection, {
    prompt: userMsg,
    createTime: new Date(),
  });

  return threadDoc.id;
};

export const useThreads = () => {
  const user = useContext(FirebaseUserContext);
  const uid = user.currentUser?.uid;
  const [threads, setThreads] = useState<{ id: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const ThreadCollection = useMemo(
    () =>
      uid
        ? (collection(
            getFirestore(),
            `users/${uid}/threads/`
          ) as CollectionReference<DocumentData>)
        : null,
    [uid]
  );

  useEffect(() => {
    if (!uid || !ThreadCollection) return;

    setLoading(true);
    const unsubscribe = onSnapshot(
      query(ThreadCollection, orderBy("createTime", "asc")),
      (snapshot) => {
        const threads = snapshot.docs.map((doc) => ({
          id: doc.id,
        }));
        setThreads(threads);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid, ThreadCollection]);

  console.log(threads, "firestore threads");

  return { threads, loading };
};