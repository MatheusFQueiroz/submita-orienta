import { EvaluationType } from ".";
import { Question } from "./api";

export interface EventFormData {
  name: string;
  description: string;
  image?: File;
  banner?: string;
  eventStartDate: Date;
  eventEndDate: Date;
  submissionStartDate: Date;
  submissionEndDate: Date;
  evaluationType: EvaluationType;
}

export interface ArticleFormData {
  title: string;
  summary: string;
  keywords: string[];
  relatedAuthors: string[];
  file?: File;
  eventId: string;
}

export interface EvaluationFormData {
  grade: number;
  evaluationDescription: string;
  responses: {
    questionId: string;
    answer: string;
  }[];
}

export interface ChecklistFormData {
  title: string;
  description?: string;
  questions: {
    text: string;
    type: Question["type"];
    isRequired: boolean;
    options?: string[];
  }[];
}
