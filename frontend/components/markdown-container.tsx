import React from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

export interface MarkdownContainerProps {
  markdown: any;
}

const MarkdownContainer: React.FC<MarkdownContainerProps> = ({ markdown }) => {
  const htmlFromMarkdown = marked.parse(markdown) as string;

  const cleanHtml = DOMPurify.sanitize(htmlFromMarkdown);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: cleanHtml,
      }}
    />
  );
};

export default MarkdownContainer;
