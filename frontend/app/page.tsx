"use client";

import ChatContainer from "@/components/chat-container";
import Sidebar from "@/components/common/sidebar";
import { useThreadNavigation } from "@/hooks/use-thread-navigation";
import { FirebaseUserContext } from "@/lib/firebase-user";
import { FirestoreMessageData } from "@/types/message";
import React, { useContext, useState } from "react";

const MainPage: React.FC = () => {
  const [messages, setMessages] = useState<FirestoreMessageData[]>([]);
  const user = useContext(FirebaseUserContext);
  const uid = user.currentUser?.uid;
  const sendMessage = useThreadNavigation(uid);

  const noOpDelete = async (messageId: string) => {
    return;
  };

  return (
    <Sidebar>
      <ChatContainer
        messages={messages}
        onMessageSubmit={sendMessage}
        onMessageDelete={noOpDelete}
      />
    </Sidebar>
  );
};

export default MainPage;
