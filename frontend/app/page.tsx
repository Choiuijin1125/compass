"use client";

import ChatContainer from "@/components/chat-container";
import Sidebar from "@/components/common/sidebar";
import { useThreadNavigation } from "@/hooks/use-thread-navigation";
import { FirebaseUserContext } from "@/lib/firebase-user";
import { FirestoreMessageData } from "@/types/message";
import React, { useContext, useReducer, useState } from "react";
import { memoryContext, initialState, memoryReducer } from "./memory-reducer";

const MainPage: React.FC = () => {
  const [messages, setMessages] = useState<FirestoreMessageData[]>([]);
  const user = useContext(FirebaseUserContext);
  const uid = user.currentUser?.uid;
  const [memoryState, memoryDispatch] = useReducer(memoryReducer, initialState);
  const sendMessage = useThreadNavigation(uid, memoryState);

  const noOpDelete = async (messageId: string) => {
    return;
  };

  return (
    <memoryContext.Provider value={[memoryState, memoryDispatch]}>
      <Sidebar>
        <ChatContainer
          messages={messages}
          onMessageSubmit={sendMessage}
          onMessageDelete={noOpDelete}
        />
      </Sidebar>
    </memoryContext.Provider>
  );
};

export default MainPage;
