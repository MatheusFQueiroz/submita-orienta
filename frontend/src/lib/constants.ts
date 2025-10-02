export const APP_CONFIG = {
  name: "Submita",
  description: "Sistema de Submissão de Artigos - Biopark",
  version: "1.0.0",
  company: "Cliick",
  email: "matheus.cliick@gmail.com",
} as const;

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  timeout: 30000,
  retries: 3,
} as const;

export const FILE_CONFIG = {
  maxSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "10485760"), // 10MB
  allowedImageTypes: (
    process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES ||
    "image/jpeg,image/png,image/webp"
  ).split(","),
  allowedPdfTypes: (
    process.env.NEXT_PUBLIC_ALLOWED_PDF_TYPES || "application/pdf"
  ).split(","),
} as const;

export const ROUTES = {
  // Públicas
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  RESET_PASSWORD: "/redefinir-senha",

  // Autenticadas (URLs limpas)
  DASHBOARD: "/dashboard",
  EVENTS: "/eventos",
  CREATE_EVENT: "/eventos/criar",
  ARTICLES: "/artigos",
  SUBMIT_ARTICLE: "/submeter-artigo",
  USERS: "/usuarios",
  CHECKLISTS: "/checklists",
  PROFILE: "/perfil",

  // Dinâmicas
  EVENT_DETAILS: (id: string) => `/eventos/${id}`,
  EVENT_ARTICLES: (id: string) => `/eventos/${id}/artigos`,
  EVENT_EVALUATORS: (id: string) => `/eventos/${id}/avaliadores`,
  ARTICLE_DETAILS: (id: string) => `/artigos/${id}`,
  EVALUATE_ARTICLE: (id: string) => `/avaliar/${id}`,
  ARTICLE_CORRECTIONS: (id: string) => `/ressalvas/${id}`,
} as const;

export const USER_ROLES = {
  STUDENT: "STUDENT",
  EVALUATOR: "EVALUATOR",
  COORDINATOR: "COORDINATOR",
} as const;

export const ARTICLE_STATUS = {
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  APPROVED_WITH_CORRECTIONS: "APPROVED_WITH_CORRECTIONS",
} as const;

export const EVALUATION_TYPE = {
  DIRECT: "DIRECT",
  PAIR: "PAIR",
  PANEL: "PANEL",
} as const;

export const STATUS_LABELS = {
  [ARTICLE_STATUS.SUBMITTED]: "Submetido",
  [ARTICLE_STATUS.UNDER_REVIEW]: "Em Avaliação",
  [ARTICLE_STATUS.APPROVED]: "Aprovado",
  [ARTICLE_STATUS.REJECTED]: "Rejeitado",
  [ARTICLE_STATUS.APPROVED_WITH_CORRECTIONS]: "Aprovado com Correções",
} as const;

export const STATUS_COLORS = {
  [ARTICLE_STATUS.SUBMITTED]: "bg-blue-100 text-blue-800",
  [ARTICLE_STATUS.UNDER_REVIEW]: "bg-yellow-100 text-yellow-800",
  [ARTICLE_STATUS.APPROVED]: "bg-green-100 text-green-800",
  [ARTICLE_STATUS.REJECTED]: "bg-red-100 text-red-800",
  [ARTICLE_STATUS.APPROVED_WITH_CORRECTIONS]: "bg-purple-100 text-purple-800",
} as const;
