import React from "react";
import MarkdownContainer from "@/components/markdown-container";
import useAutoFocus from "@/app/hooks/use-auto-focus";
import { MessageData } from "@/lib/message";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import tidotStyles from "./tidot.module.css";
import "./common/scrollStyle.css"
import { FirebaseUserContext } from "@/lib/firebase-user";
import { CollectionReference, addDoc, collection, getFirestore, onSnapshot, orderBy, query } from "firebase/firestore";
import QuestionCard from "./common/QuestionCard";
import CodeContainer from "./code-container";

export interface ChatContainerProps {
  messages: MessageData[];
  onMessageSubmit: (userMsg: string) => Promise<void>;
  onMessageDelete: (messageId: string) => Promise<void>;
}

const QuestionContainer: React.FC<ChatContainerProps> = ({
  messages,
  onMessageSubmit,
  onMessageDelete,
}) => {
  "use client";

  {/* 문제 영역 */}
  const user = React.useContext(FirebaseUserContext);
  const uid = user.currentUser?.uid;

  const [questionList, setQuestionList] = React.useState<any[]>([]);
  // console.log("questionList",questionList)
  const [questionListLoading, setQuestionListLoading] = React.useState(false);

  const questionCollection = React.useMemo(
    () =>
      collection(
        getFirestore(),
        `questions`
      ) as CollectionReference<any>,
    []
  );  

  React.useEffect(() => {
    if (!uid) return;
    setQuestionListLoading(true)
    const unsubscribe = onSnapshot(
      query(questionCollection), //, orderBy("createTime", "asc")
      (snapshot) => {
        const questions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data() // 각 문서의 필드 데이터를 가져와서 객체에 포함
        }));
        setQuestionListLoading(false)
        setQuestionList(questions);
      }
    );
    return unsubscribe;
  }, [uid, questionCollection]);  

  const getRandomElements = (arr: any[], count: number) => {
    const shuffled = arr.sort(() => 0.5 - Math.random()); // 배열을 무작위로 섞음
    return shuffled.slice(0, count); // 섞인 배열에서 앞의 10개 요소를 선택
}

const randomQuestions = React.useMemo(() => getRandomElements(questionList, 10), [questionList])

  {/* 대화 영역 */}

  const [userMessage, setUserMessage] = React.useState("");
  const userMessageAutoFocus = useAutoFocus();

  const prevMessagesCountRef = React.useRef(messages.length);

  const endOfChatRef = React.useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (endOfChatRef.current) {
      endOfChatRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  React.useEffect(() => {
    // Do not auto-scroll if removing a message.
    if (prevMessagesCountRef.current <= messages.length) {
      scrollToBottom();
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages]);

  const handleUserMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userMessage.trim() === "") {
      return;
    }
    onMessageSubmit(userMessage);
    setUserMessage("");
  };

  // 새로운 대화 후 스크롤 위치
  const contentAreaRef = React.useRef<any>()

  React.useEffect(() => {
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollTo({
        top: contentAreaRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])


  return (
    <div className="flex flex-col h-[96vh] w-screen">
      <div>
        {!questionListLoading && 
        questionList?.length !== 0 &&
          <QuestionCard questionList={randomQuestions}/>
        }
      </div>
      <main
        className={`
          flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100
          scroll_conatiner
        `}
        ref={contentAreaRef}
      >
        {/* 대화 목록 */}
        {messages.map((message, i) => {
          const { prompt, response, createTime, status } = message;
          return (
            <div key={i} className="flex items-end">
              <div className="flex flex-col space-y-2 w-full pb-2">
                <div className="flex group items-end mr-4 px-4 py-2 rounded-lg  bg-gray-200 text-gray-800 rounded-bl-none">
                  <div className="flex-1">
                    {prompt}
                    {message.id && (
                      <button
                        type="button"
                        className="ml-2 font-bold text-xl text-red-600 opacity-60 group-hover:opacity-100"
                        aria-label="Delete message"
                        title="Delete message"
                        onClick={() => onMessageDelete(message.id || "")}
                      >
                        x
                      </button>
                    )}
                  </div>
                  {createTime && (
                    <div className="text-gray-400 text-xs ml-4">
                      {createTime.toDate().toLocaleString()}
                    </div>
                  )}
                </div>

                {!status?.state && (
                  <div className="text-gray-900 text-xs ml-4">Sending...</div>
                )}

                {status?.state === "PROCESSING" && (
                  <div className="ml-4 px-4 py-2 rounded-lg inline-block rounded-br-none text-gray-900 bg-gradient-to-r from-blue-100 to-purple-100 text-xs">
                    <div className={tidotStyles.ticontainer}>
                      <div className={tidotStyles.tiblock}>
                        <div className={tidotStyles.tidot}></div>
                        <div className={tidotStyles.tidot}></div>
                        <div className={tidotStyles.tidot}></div>
                      </div>
                    </div>
                  </div>
                )}

                {status?.error && (
                  <div className="ml-4 px-4 py-2 rounded-lg inline-block bg-red-200 text-red-800 rounded-br-none">
                    {status.error}
                    {status?.updateTime && (
                      <div className="opacity-40 text-right text-xs mr-4 mt-2">
                        {status?.updateTime.toDate().toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {/* {response && (
                  <div className="ml-4 px-4 py-2 rounded-lg inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none">
                    <MarkdownContainer markdown={response} />
                    {status?.updateTime && (
                      <div className="text-gray-300 text-right text-xs mr-4 mt-2">
                        {status?.updateTime.toDate().toLocaleString()}
                      </div>
                    )}
                  </div>
                )} */}

                {response &&
                Array.isArray(response) && 
                response.map((item, index: number) => (
                  <div
                    key={index}
                    className="ml-4 px-4 py-2 rounded-lg inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none"
                  >
                    {item.parts.map((part, partIndex) => (
                      <div key={partIndex}>
                        {part.text && (
                          <div className="part-text">
                            <CodeContainer content={part.text}/>
                          </div>
                        )}
                        {part.functionCall && (
                          <div className="part-function-call">
                            <div className="ml-4 mt-2 px-4 py-2 rounded-lg text-black">
                              <div>{part.functionCall.name}</div>
                              <div>
                                <CodeContainer content={JSON.stringify(part.functionCall?.args?.query)}/>
                                <CodeContainer content={JSON.stringify(part.functionCall?.args?.optimized_query)}/>
                                <CodeContainer content={JSON.stringify(part.functionCall?.args?.core_memories)}/>
                                <CodeContainer content={JSON.stringify(part.functionCall?.args?.recall_memories)}/>
                              </div>
                            </div>
                          </div>
                        )}
                        {part.functionResponse && (
                          <div className="part-function-response">
                            <div className="ml-4 mt-2 px-4 py-2 rounded-lg bg-green-500 text-black">
                              <div>
                                Function Response:{" "}
                                {part.functionResponse.name}
                              </div>
                              <div>
                                Response:{" "}
                                <CodeContainer content={part.functionResponse.response?.result?.resonaing}/>
                                <CodeContainer content={JSON.stringify(part.functionResponse.response?.result?.optimized_query)}/>
                                <CodeContainer content={JSON.stringify(part.functionResponse.response?.result?.core_memories)}/>
                                <CodeContainer content={JSON.stringify(part.functionResponse.response?.result?.recall_memories)}/>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {status?.updateTime && (
                      <div className="text-gray-300 text-right text-xs mr-4 mt-2">
                        {status?.updateTime.toDate().toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
      <footer className="flex items-center space-x-2 p-2 border-t border-gray-200 py-4 bg-gray-100">
        <form onSubmit={handleUserMessageSubmit} className="flex-1">
          <div className="items-center">
            {messages[messages.length - 1]?.followUpPrompts
              ?.slice(0, 4)
              .map((sugestion) => (
                <button
                  key={sugestion}
                  type="button"
                  className="flex-1 mr-2 mb-2 bg-blue-100 hover:bg-blue-200 text-gray-700 px-4 py-2 rounded-md text-left"
                  onClick={() => onMessageSubmit(sugestion)}
                >
                  {sugestion}
                </button>
              ))}
          </div>
          <div className="flex items-center mt-2">
            <Input
              name="user-message"
              className="flex-1 px-4 py-2 rounded-md text-gray-700 mr-2"
              placeholder="Type a message..."
              value={userMessage}
              ref={userMessageAutoFocus}
              onChange={(e) => setUserMessage(e.target.value)}
              disabled={
                messages[messages.length-1]?.status?.state === "PROCESSING"
              }
            />
            <Button
              type="submit"
              disabled={
                userMessage.trim() === '' ||
                messages[messages.length-1]?.status?.state === "PROCESSING"
              }
            >
              Send
            </Button>
            <div ref={endOfChatRef}></div>
          </div>
        </form>
      </footer>

    </div>
  )
}

export default QuestionContainer