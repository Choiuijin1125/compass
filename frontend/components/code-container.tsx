import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import markdownStlyes from "./markdown.module.css";
interface Props {
  content: any;
}

const CodeContainer = ({ content }: Props) => {
  return (
    <>
      <MarkdownWithHighlighting content={content} />
    </>
  );
};

export default CodeContainer;

export const MarkdownWithHighlighting = ({ content }: any) => {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={a11yDark}
              language={match[1]}
              PreTag="div"
              className={markdownStlyes.codeBlock} // 추가된 부분
              {...props}
            >
              {/* {String(children).replace(/\n$/, "")} */}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
