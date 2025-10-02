export type UserRole = "STUDENT" | "EVALUATOR" | "COORDINATOR";

export type ArticleStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "APPROVED_WITH_CORRECTIONS";

export type EvaluationType = "DIRECT" | "PAIR" | "PANEL";

export type EventStatus = "ACTIVE" | "INACTIVE" | "CLOSED";

export * from "./auth";
export * from "./api";
export * from "./form";
export * from "./dashboard";
export * from "./file";
export * from "./notification";
export * from "./route";
export * from "./error";
export * from "./search";
