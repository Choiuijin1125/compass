"use client";

import ChatContainer from "@/components/chat-container";
import { FirebaseUserContext } from "@/lib/firebase-user";
import { FirestoreMessageData } from "@/types/message";
import {
  getMessagesCollection,
  subscribeToMessages,
  sendMessage as firebaseSendMessage,
  deleteMessage as firebaseDeleteMessage,
} from "@/lib/firebase/messages";
import { useContext, useEffect, useMemo, useState } from "react";

interface ThreadPageProps {
  params: {
    threadId: string;
  };
}
const ThreadPage = ({ params }: ThreadPageProps) => {
  const { threadId } = params;
  const [messages, setMessages] = useState<FirestoreMessageData[]>([]);
  const user = useContext(FirebaseUserContext);
  const uid = user.currentUser?.uid;

  const messagesCollection = useMemo(() => {
    if (!uid) return null;
    return getMessagesCollection(uid, threadId);
  }, [uid, threadId]);

  useEffect(() => {
    if (!uid || !messagesCollection) return;

    const unsubscribe = subscribeToMessages(messagesCollection, setMessages);
    return unsubscribe;
  }, [uid, threadId, messagesCollection]);

  const sendMessage = async (userMsg: string) => {
    if (!uid || !messagesCollection) return;

    setMessages((prev) => [...prev, { prompt: userMsg }]);
    await firebaseSendMessage(messagesCollection, userMsg);
  };

  const deleteMessage = async (messageId: string) => {
    if (!uid || !messagesCollection) return;

    await firebaseDeleteMessage(messagesCollection, messageId);
  };
  console.log(messages, "Message Object");
  return (
    <>
      <ChatContainer
        messages={messages}
        onMessageSubmit={sendMessage}
        onMessageDelete={deleteMessage}
      />
    </>
  );
};

export default ThreadPage;
