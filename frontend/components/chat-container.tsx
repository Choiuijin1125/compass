/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import MarkdownContainer from "@/components/markdown-container";
import useAutoFocus from "@/app/hooks/use-auto-focus";
import { MessageData } from "@/lib/message";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import tidotStyles from "./tidot.module.css";
import markdownStlyes from "./markdown.module.css";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./common/scrollStyle.css";
import CodeContainer from "./code-container";

interface Status {
  updateTime?: {
    toDate: () => Date;
  };
}

export interface ChatContainerProps {
  messages: MessageData[];
  onMessageSubmit: (userMsg: string) => Promise<void>;
  onMessageDelete: (messageId: string) => Promise<void>;
}

/**
 * Chat container.
 *
 * The `messages` are taking up central space.
 * Using markdown for rendering.
 *
 * On the botton there are up to 4 buttons showing suggested topics.
 * Buttons captions are sourced from a last `suggestedResponses` value.
 *
 * Then there is a text field with a send submit button for user input.
 *
 * After updating the messages list, the screen will auto-scroll to the bottom.
 *
 * Each few lines of code have a comment explaining what they do.
 *
 * Using Tailwind for all styling.
 *
 * @param props.onMessageSubmit Called upon submitting a message prompt.
 * @param props.messages
 */
const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  onMessageSubmit,
  onMessageDelete,
}) => {
  "use client";

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
  const contentAreaRef = React.useRef<any>();

  React.useEffect(() => {
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollTo({
        top: contentAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[96vh] w-full">
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
          // console.log("response",response)
          return (
            <div key={i} className="flex items-end justify-center">
              <div className="flex flex-col space-y-2 w-full pb-2">
                <div className="  bg-gray-200 text-gray-800 rounded-bl-none">
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
                  <div className="  rounded-br-none text-gray-900 bg-gradient-to-r from-blue-100 to-purple-100 text-xs">
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
                  <div className=" bg-red-200 text-red-800 rounded-br-none">
                    {status.error}
                    {status?.updateTime && (
                      <div className="opacity-40 text-right text-xs mr-4 mt-2">
                        {status?.updateTime.toDate().toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {response &&
                  Array.isArray(response) &&
                  response.map((item, index: number) => (
                    <div
                      key={index}
                      className="ml-4 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-br-none"
                    >
                      {item.parts.map((part, partIndex) => (
                        <div key={partIndex}>
                          {part.text && (
                            <div className="part-text ">
                              <CodeContainer content={part.text} />
                            </div>
                          )}
                          {part.functionCall && (
                            <div className="part-function-call">
                              <div className="bg-[#daf9f02c] text-white">
                                <div>
                                  Function Call: {part.functionCall.name}
                                </div>
                              </div>
                            </div>
                          )}
                          {part.functionResponse && (
                            <div className="part-function-response">
                              <div className="flex bg-[#daf9f04e] text-white">
                                <div>
                                  Response:{" "}
                                  {
                                    part.functionResponse.response?.result
                                      ?.resonaing
                                  }
                                  {/* <CodeContainer
                                    content={
                                      part.functionResponse.response?.result
                                        ?.resonaing
                                    }
                                  /> */}
                                  <CodeContainer
                                    content={JSON.stringify(
                                      part.functionResponse.response?.result
                                        ?.optimized_query
                                    )}
                                  />
                                  {part.functionResponse.name ===
                                    "memory_reference" && (
                                    <>
                                      <div>Core Memories:</div>
                                      {part.functionResponse.response?.result?.core_memories.map(
                                        (memory, index) => (
                                          <CodeContainer
                                            key={index}
                                            content={memory}
                                          />
                                        )
                                      )}
                                      <div>Recall Memories:</div>

                                      {JSON.stringify(
                                        part.functionResponse?.response?.result
                                          ?.recall_memories
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {status?.updateTime && (
                        <div className="text-white text-right text-xs mr-4 mt-2">
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
                messages[messages.length - 1]?.status?.state === "PROCESSING"
              }
            />
            <Button
              type="submit"
              disabled={
                userMessage.trim() === "" ||
                messages[messages.length - 1]?.status?.state === "PROCESSING"
              }
            >
              Send
            </Button>
            <div ref={endOfChatRef}></div>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default ChatContainer;
