"use client";

import React from "react";
import QuestionContainer from "@/components/question-container";

import { FirebaseUserContext } from "@/lib/firebase-user";
import {
  FirestoreMessageData,
  MessageData,
  prepareMessage,
} from "@/lib/message";
import { preparePrompt } from "@/lib/prepare-prompt";
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
} from "firebase/firestore";
import { useContext, useEffect, useMemo, useState } from "react";

interface ThreadPageProps {
  params: {
    threadId: string;
  };
}

const QuestionThreadPage = ({ params }: ThreadPageProps) => {
  const { threadId } = params;
  const [messages, setMessages] = useState<MessageData[]>([]);
  const user = useContext(FirebaseUserContext);
  const uid = user.currentUser?.uid;

  const messagesCollection = useMemo(
    () =>
      collection(
        getFirestore(),
        `users/${uid}/questions/${threadId}/messages`
      ) as CollectionReference<FirestoreMessageData>,
    [uid, threadId]
  );

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(
      query(messagesCollection, orderBy("createTime", "asc")),
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...prepareMessage(doc.data()),
        }));
        // console.log(
        //   "Message doc changes: ",
        //   snapshot
        //     .docChanges()
        //     .map((ch) => ({ type: ch.type, id: ch.doc.id, doc: ch.doc.data() }))
        // );
        setMessages(messages);
      }
    );
    return unsubscribe;
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, threadId]);

  const sendMessage = async (userMsg: string) => {
    if (!uid) return;

    setMessages((prev) => [...prev, { prompt: userMsg }]);
    const newMessageRef = await addDoc(messagesCollection, {
      prompt: userMsg,
    });
    // console.log("New message added with ID: ", newMessageRef.id);
  };

  const deleteMessage = async (messageId: string) => {
    if (!uid) return;

    await deleteDoc(doc(messagesCollection, messageId));
  };

  return (
    <>
      <QuestionContainer
        messages={messages}
        onMessageSubmit={sendMessage}
        onMessageDelete={deleteMessage}
      />
    </>
  );
};

export default QuestionThreadPage;
