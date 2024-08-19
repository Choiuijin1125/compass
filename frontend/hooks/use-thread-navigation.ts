// hooks/useThreadNavigation.ts
import { createThread } from "@/lib/firebase/threads";
import { useRouter } from "next/navigation";

export const useThreadNavigation = (uid: string | undefined) => {
  const router = useRouter();

  const sendMessage = async (userMsg: string) => {
    if (!uid) return;

    const threadId = await createThread(uid, userMsg);
    router.push(`/threads/${threadId}`);
  };

  return sendMessage;
};