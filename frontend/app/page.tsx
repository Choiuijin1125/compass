"use client";

import ChatContainer from "@/components/chat-container";
import { FirebaseUserContext } from "@/lib/firebase-user";
import { MessageData } from "@/lib/message";
import { preparePrompt } from "@/lib/prepare-prompt";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useMemo, useState } from "react";

const MainPage: React.FC = () => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const router = useRouter();
  const user = useContext(FirebaseUserContext);
  const uid = user.currentUser?.uid;

  const sendMessage = async (userMsg: string) => {
    if (!uid) return;

    // Create a new thread and add the initial message to it
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

    // Redirect to the new thread page
    router.push(`/threads/${threadDoc.id}`);
  };

  const noOpDelete = async (messageId: string) => {
    return;
  };

  return (
    <>
      <ChatContainer
        messages={messages}
        onMessageSubmit={sendMessage}
        onMessageDelete={noOpDelete}
      />
    </>
  );
};

export default MainPage;
