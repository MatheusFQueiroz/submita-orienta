import { ArticleStatus, EvaluationType, EventStatus } from ".";
import { User } from "./auth";

export interface Event {
  startSubmissionDate: string | number | Date;
  id: string;
  name: string;
  banner?: string;
  description: string;
  eventStartDate: Date;
  eventEndDate: Date;
  submissionStartDate: Date;
  submissionEndDate: Date;
  evaluationType: EvaluationType;
  status: EventStatus;
  isActive: boolean;
  coordinatorId: string;
  createdAt: Date;
  updatedAt?: Date;
  // Relacionamentos
  articles?: Article[];
  evaluators?: User[];
  checklist?: Checklist;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  status: ArticleStatus;
  currentVersion: number;
  eventId: string;
  userId: string;
  keywords: string[];
  relatedAuthors: string[];
  pdfPath?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt?: Date;
  // Relacionamentos
  event?: Event;
  user?: User;
  versions?: ArticleVersion[];
  evaluations?: Evaluation[];
}

export interface ArticleVersion {
  id: string;
  version: number;
  pdfPath: string;
  fileName: string;
  articleId: string;
  createdAt: Date;
  // Relacionamentos
  article?: Article;
  evaluations?: Evaluation[];
}

export interface Evaluation {
  id: string;
  grade?: number;
  evaluationDescription?: string;
  evaluationDate?: Date;
  status: "TO_CORRECTION" | "APPROVED" | "REJECTED";
  userId: string; // Avaliador
  articleVersionId: string;
  createdAt: Date;
  updatedAt?: Date;
  // Relacionamentos
  evaluator?: User;
  articleVersion?: ArticleVersion;
  responses?: QuestionResponse[];
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  eventId?: string;
  createdAt: Date;
  updatedAt?: Date;
  // Relacionamentos
  questions?: Question[];
  event?: Event;
}

export interface Question {
  id: string;
  text: string;
  type: "BOOLEAN" | "TEXT" | "SCALE" | "MULTIPLE_CHOICE";
  isRequired: boolean;
  order: number;
  options?: string[]; // Para multiple choice
  checklistId: string;
  createdAt: Date;
  // Relacionamentos
  checklist?: Checklist;
  responses?: QuestionResponse[];
}

export interface QuestionResponse {
  id: string;
  answer: string;
  questionId: string;
  evaluationId: string;
  createdAt: Date;
  // Relacionamentos
  question?: Question;
  evaluation?: Evaluation;
}
