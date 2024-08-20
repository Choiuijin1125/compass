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
import useAutoFocus from "@/hooks/use-auto-focus";
import { FirestoreMessageData } from "@/types/message";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import "@/components/common/scroll-style.css"

export interface ChatContainerProps {
  messages: FirestoreMessageData[];
  onMessageSubmit: (userMsg: string) => Promise<void>;
  onMessageDelete: (messageId: string) => Promise<void>;
}

/**
 * Chat container.
 *
 * The `messages` are taking up central space.
 * Using markdown for rendering.
 *
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
        {messages.map((message, i) => {
          const { prompt, response, createTime, status } = message;
          return (
            <div key={i} className="flex items-end">
              <div className="flex flex-col space-y-2 w-full pb-2">
                <div className="flex group items-end mr-4 px-4 py-2 rounded-lg bg-gray-200  text-gray-800 rounded-bl-none">
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
                  <div className="px-4 py-2 rounded-lg inline-block rounded-br-none text-gray-900 bg-gradient-to-r from-blue-100 to-purple-100 text-xs ml-4">
                    Generating...
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

                {
                  response &&
                    response.map((item, index: number) => (
                      <React.Fragment key={index}>
                        {item.parts[0].text && (
                          <div className="ml-4 px-4 py-2 rounded-lg inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none">
                            {item.parts[0].text}
                          </div>
                        )}
                        {/* {item.parts[0].functionCall && (
                          <div className="ml-4 px-4 py-2 rounded-lg inline-block bg-gradient-to-r text-xs text-white rounded-br-none">
                            {item.parts[0].functionCall.name}
                          </div>
                        )} */}
                        {item.parts[0].functionResponse && (
                          <div className="ml-4 px-4 py-2 rounded-lg inline-block bg-gradient-to-r text-sm text-opacity-75 from-green-500 to-teal-400 text-white rounded-br-none">
                            <strong>
                              Function Call:{" "}
                              {item.parts[0].functionResponse.name}{" "}
                            </strong>
                            {Object.entries(
                              item.parts[0].functionResponse.response.result
                            ).map(([key, value], idx) => (
                              <div key={idx}>
                                <strong>{key}:</strong> {value}
                                <MarkdownContainer markdown={String(value)} />
                              </div>
                            ))}
                          </div>
                        )}
                      </React.Fragment>
                    ))

                  // <div className="ml-4 px-4 py-2 rounded-lg inline-block bg-gradient-to-r from-blue-500 to-purple-500 to-gray-400 text-white rounded-br-none">
                  //   <MarkdownContainer markdown={response} />
                  //   {status?.updateTime && (
                  //     <div className="text-gray-300 text-right text-xs mr-4 mt-2">
                  //       {status?.updateTime.toDate().toLocaleString()}
                  //     </div>
                  //   )}
                  // </div>
                }
              </div>
            </div>
          );
        })}
      </main>

      <footer className="flex items-center space-x-2 p-2 border-t border-gray-200 py-4 bg-gray-100">
        <form onSubmit={handleUserMessageSubmit} className="flex-1">
          <div className="flex items-center mt-2">
            <Input
              name="user-message"
              className="flex-1 px-4 py-2 rounded-md mr-2"
              placeholder="Type a message..."
              value={userMessage}
              ref={userMessageAutoFocus}
              onChange={(e) => setUserMessage(e.target.value)}
              disabled={
                messages[messages.length - 1]?.status?.state === "PROCESSING"
              }
            />
            <Button type="submit">Send</Button>
            <div ref={endOfChatRef}></div>
          </div>
        </form>
      </footer>
    </div>
  );
};
export default ChatContainer;
