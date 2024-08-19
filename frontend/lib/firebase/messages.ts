// lib/firebase-messages.ts
import { FirestoreMessageData } from "@/types/message";
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

export const getMessagesCollection = (uid: string, threadId: string) => {
  return collection(
    getFirestore(),
    `users/${uid}/threads/${threadId}/messages`
  ) as CollectionReference<FirestoreMessageData>;
};

export const subscribeToMessages = (
  messagesCollection: CollectionReference<FirestoreMessageData>,
  callback: (messages: FirestoreMessageData[]) => void
) => {
  return onSnapshot(
    query(messagesCollection, orderBy("createTime", "asc")),
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...prepareMessage(doc.data()),
      }));
      callback(messages);
    }
  );
};

export const sendMessage = async (
  messagesCollection: CollectionReference<FirestoreMessageData>,
  userMsg: string
) => {
  await addDoc(messagesCollection, {
    prompt: userMsg,
    createTime: Timestamp.now(),
  });
};

export const deleteMessage = async (
  messagesCollection: CollectionReference<FirestoreMessageData>,
  messageId: string
) => {
  await deleteDoc(doc(messagesCollection, messageId));
};

export const prepareMessage = (
  data: FirestoreMessageData
): FirestoreMessageData => {
  const processedData: FirestoreMessageData = { ...data };
  const [userPrompt] = data.prompt.split("\n---\n", 2);
  if (userPrompt) {
    processedData.prompt = userPrompt;
  }
  return processedData;
};