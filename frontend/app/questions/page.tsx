"use client";

import { FirebaseUserContext } from "@/lib/firebase-user";
import { MessageData } from "@/lib/message";
import { preparePrompt } from "@/lib/prepare-prompt";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useMemo, useState } from "react";

import QuestionContainer from "@/components/question-container";

const MainQuestionPage = () => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const router = useRouter();
  const user = useContext(FirebaseUserContext);
  const uid = user.currentUser?.uid;

  const sendMessage = async (userMsg: string) => {
    if (!uid) return;

    // Create a new thread and add the initial message to it
    const firestore = getFirestore();
    const questionsCollection = collection(firestore, `users/${uid}/questions`);

    const questionDoc = await addDoc(questionsCollection, {
      createTime: new Date(),
    });

    const messagesCollection = collection(firestore, `users/${uid}/questions/${questionDoc.id}/messages`);
    await addDoc(messagesCollection, {
      prompt: preparePrompt(userMsg, []),
      createTime: new Date(),
    });

    // Redirect to the new thread page
    router.push(`/questions/${questionDoc.id}`);
  };

  const noOpDelete = async (messageId: string) => {
    return;
  };


  return (
    <>
      <QuestionContainer
        messages={messages}
        onMessageSubmit={sendMessage}
        onMessageDelete={noOpDelete}
      />
    </>
  )
}

export default MainQuestionPage