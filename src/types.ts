
export interface Question {
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface CaseData {
  description: string;
  questions: Question[] | string[];
  answers?: string[];
}
