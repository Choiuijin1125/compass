"use client";

import React, { useContext, useState, useMemo, useEffect } from "react";
import { FirebaseUserContext } from "@/lib/firebase-user";
import { CollectionReference, addDoc, collection, getFirestore, onSnapshot, orderBy, query } from "firebase/firestore";

import { Nav } from "./common/Nav";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import UserButton from "./common/UserButton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Props {
  threadId?: string
}

const NavLayout = ({threadId}: Props) => {
  const router = useRouter();
  const user = useContext(FirebaseUserContext);
  const uid = user.currentUser?.uid;

  const [threadList, setThreadList] = useState<any[]>([]);
  const [threadListLoading, setThreadListLoading] = useState(false);

  const ThreadCollection = useMemo(
    () =>
      collection(
        getFirestore(),
        `users/${uid}/threads/`
      ) as CollectionReference<any>,
    [uid]
  );  

  useEffect(() => {
    if (!uid) return;
    setThreadListLoading(true)
    const unsubscribe = onSnapshot(
      query(ThreadCollection, orderBy("createTime", "asc")),
      (snapshot) => {
        const threads = snapshot.docs.map((doc) => ({
          id: doc.id,
        }));
        setThreadListLoading(false)
        setThreadList(threads);
      }
    );
    return unsubscribe;
  }, [uid, ThreadCollection]);  

  const [questionThreadList, setQuestionThreadList] = useState<any[]>([]);
  const [questionThreadListLoading, setQuestionThreadListLoading] = useState(false);

  const QuestionThreadCollection = useMemo(
    () =>
      collection(
        getFirestore(),
        `users/${uid}/questions/`
      ) as CollectionReference<any>,
    [uid]
  );  

  useEffect(() => {
    if (!uid) return;
    setQuestionThreadListLoading(true)
    const unsubscribe = onSnapshot(
      query(QuestionThreadCollection, orderBy("createTime", "asc")),
      (snapshot) => {
        const threads = snapshot.docs.map((doc) => ({
          id: doc.id,
        }));
        setQuestionThreadListLoading(false)
        setQuestionThreadList(threads);
      }
    );
    return unsubscribe;
  }, [uid, QuestionThreadCollection]);  



  return (
    <div className="side-container h-[100%] flex flex-col justify-between pb-6 min-w-[250px]">
      <div className="side-top flex flex-col items-baseline p-6">
        <p className="font-bold text-2xl mb-5 text-center flex justify-center items-center gap-2">
          <Image src="/icon/mark_black.svg" alt="" width={24} height={24} />
          Compass
        </p>
        <p className="title font-bold text-xl mb-3">Threads</p>
        <Button
          className="flex items-center justify-start gap-2 w-full"
          onClick={() => router.push("/")}
        >
          <Image src="/icon/play_white.svg" alt="" width={18} height={18} />
          Create Thread
        </Button>
        {threadListLoading ? (
          <div className="w-full">
            <p className="flex gap-[2px] items-center text-[0.9rem] font-semibold mt-[14px] pl-[18px]">
              <Inbox className="mr-2 h-4 w-4" /> My libary
            </p>
            <div className="h-[45vh] w-full flex justify-center items-center">
              <LoadingSpinner />
            </div>
          </div>
        ) : (
          threadList?.length !== 0 && (
            <Nav
              isFullWidth={true}
              isCollapsed={false}
              links={[
                {
                  title: "My libary",
                  icon: Inbox,
                  variant: "ghost",
                  children: threadList.map((x: any) => {
                    return {
                      title: (
                        <div
                          className={`
                      flex justify-between w-full
                      ${threadId === x.id && "text-[#3B82F6]"}
                    `}
                        >
                          <span
                            className="cursor-pointer"
                            onClick={() => router.push(`/threads/${x.id}`)}
                          >
                            {x.id}
                          </span>
                        </div>
                      ),
                      variant: "ghost",
                    };
                  }),
                },
              ]}
            />
          )
        )}

        <p className="title font-bold text-xl my-3">Study</p>
        <Button
          className="flex items-center justify-start gap-2 w-full"
          onClick={() => router.push("/questions")}
        >
          <Image src="/icon/play_white.svg" alt="" width={18} height={18} />
          question
        </Button>
        {questionThreadListLoading ? (
          <div className="w-full">
            <p className="flex gap-[2px] items-center text-[0.9rem] font-semibold mt-[14px] pl-[18px]">
              <Inbox className="mr-2 h-4 w-4" /> My study
            </p>
            <div className="h-[45vh] w-full flex justify-center items-center">
              <LoadingSpinner />
            </div>
          </div>
        ) : (
          questionThreadList?.length !== 0 && (
            <Nav
              isFullWidth={true}
              isCollapsed={false}
              links={[
                {
                  title: "My study",
                  icon: Inbox,
                  variant: "ghost",
                  children: questionThreadList.map((x: any) => {
                    return {
                      title: (
                        <div
                          className={`
                      flex justify-between w-full
                      ${threadId === x.id && "text-[#3B82F6]"}
                    `}
                        >
                          <span
                            className="cursor-pointer"
                            onClick={() => router.push(`/questions/${x.id}`)}
                          >
                            {x.id}
                          </span>
                        </div>
                      ),
                      variant: "ghost",
                    };
                  }),
                },
              ]}
            />
          )
        )}
      </div>
      <div className="side-bottom">
        <p className="title font-bold text-xl mb-3 pl-6">Settings</p>
        <div className="cursor-pointer w-fit flex items-center gap-2 mt-4 relative pl-6">
          <UserButton />
        </div>
      </div>
    </div>
  );
};

export default NavLayout;
