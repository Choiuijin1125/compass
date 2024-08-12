import React from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "./questionStyle.css"
import "./scrollStyle.css"

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface Props {
  questionList: any[]
}

const QuestionCard = ({questionList}: Props) => {
  // console.log("questionList",questionList)
  const [currentIndex, setCurrentIndex] = React.useState(0) // 현재 슬라이드 인덱스를 위한 상태 추가
  const [currentQuestionId, setCurrentQuestionId] = React.useState("")

  const extractedTexts = (s_mark: any) => {
    if (!s_mark) {
      return []; // s_mark가 null이거나 undefined이면 빈 배열을 반환
    }
    
    const matches = s_mark.match(/<p>(.*?)<\/p>/g);

    if (!matches) {
      return []; // matches가 null이면 빈 배열을 반환
    }


    const s_markArr = Array.from(s_mark.match(/<p>(.*?)<\/p>/g))
    .map((match: any) => match.replace(/<p>|<\/p>/g, ''))
    .filter(text => text.trim() !== '&nbsp;' && text.trim() !== '');
    // console.log("s_markArr",s_markArr)
    return s_markArr
  }

  const [showHelp, setShowHelp]= React.useState(false)
  const [helpQuestionId, setHelpQuestionId] = React.useState('')

  const openHelp = (id: string) => {
    setHelpQuestionId(id)
    setShowHelp(true)
  }

  {/* 정답제출 -> examLog에 기록 */}

  const [inputUserAnswer, setInputUserAnswer] = React.useState("")

  React.useEffect(() => {
    setInputUserAnswer("")
  }, [currentIndex])

  // const answer = useUserAnswerQuery({
  //   question_id: currentQuestionId,
  //   input: inputUserAnswer
  // })

  const QuestionChat = (id: string) => {
    setCurrentQuestionId(id)
    // answer.AnswerQueryRefetch().then((res) => {
    //   setCurrentQuestionId("")
    //   setInputUserAnswer("")
    // })
  }



  /**
   * r_html:위글
   * q_markdown: 문제
   * s_markdown: 선지
   * e_markdown: 해설
   * 
   */



  return (
    <div
      className={`
        question-area w-[67vw] my-0 mx-auto
        flex-1 overflow-y-auto p-4 space-y-4
        scroll_conatiner
      `}
    >
      {questionList?.length !== 0 &&
      <div className="question-carousel-container h-[45vh]">
        <Carousel setCurrentIndex={setCurrentIndex}>
          <CarouselContent>
            {questionList?.map((qestionData: any, index: number) => (
              <CarouselItem key={index}>
                <div className="question-card mt-[55px]">
                  <div className="question-box mb-4">
                    <p className="font-bold text-[2rem]">Q{index + 1}.</p>
                    <MarkdownWithHighlighting content={qestionData?.r_html} />
                    <MarkdownWithHighlighting content={qestionData?.q_markdown} />
                    {qestionData?.s_markdown && qestionData?.s_markdown !== null &&
                      extractedTexts(qestionData?.s_markdown).map((s, index) => (
                        <div key={index}>{index + 1}.{s}</div>
                      ))
                    }
                  </div>
                  <Button 
                    disabled={!qestionData?.e_markdown}
                    onClick={() => openHelp(qestionData?.id)}
                  >
                    Help
                  </Button>
                  <div className="help-area flex flex-wrap gap-4 items-center my-4">
                    {showHelp &&
                    helpQuestionId === qestionData?.id &&
                    <MarkdownWithHighlighting content={qestionData?.e_markdown} />
                    }
                  </div>
                  <div className="submit-area flex gap-4 justify-end">
                    <Input 
                      value={inputUserAnswer} 
                      onChange={(e: any) => {
                        setInputUserAnswer(e.target.value as string)
                        setCurrentQuestionId(qestionData?.id)
                      }}
                      className="w-[30%]"
                    />
                    <Button
                      disabled={inputUserAnswer.trim() === ""}
                      onClick={() => QuestionChat(qestionData?.id)}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      }
    </div>
  )
}

export default QuestionCard

export const MarkdownWithHighlighting = ({ content }: any) => {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={a11yDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};