import { Timestamp } from "firebase/firestore";

interface FunctionCall {
  name: string;
  args: Record<string, any>; // args는 보통 키-값 쌍으로 이루어진 객체이므로 Record 타입을 사용
}

interface FunctionResponseResult {
  optimized_query?: string;
  [key: string]: any; // 다른 키-값 쌍도 허용
}

interface FunctionResponse {
  name: string;
  response: {
    result: FunctionResponseResult;
  };
}

interface Part {
  text?: string;
  functionCall?: FunctionCall;
  functionResponse?: FunctionResponse;
}

interface ResponseItem {
  parts: Part[];
  role: "model" | "user";
}

export interface FirestoreMessageData {
  id?: string;
  prompt: string;
  response?: ResponseItem[];

  template_path?: string;
  save_path_id?: string;

  /** Document creation time. */
  createTime?: Timestamp;

  status?: {
    state: "COMPLETED" | "PROCESSING" | "ERROR";
    /** Generation start time. */
    startTime: Timestamp;
    /** Generation completion time. */
    completeTime?: Timestamp;
    /** Last status change time (populated on each status change, including errors). */
    updateTime: Timestamp;
    error?: string;
  };
}