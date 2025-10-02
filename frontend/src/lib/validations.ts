import { z } from "zod";

// ===== SCHEMAS EXISTENTES (mantidos) =====

// Schema de login
export const loginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Schema de registro
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .max(50, "Senha deve ter no máximo 50 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    isFromBpk: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Schema de registro para API (sem confirmPassword)
export const registerApiSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(50, "Senha deve ter no máximo 50 caracteres"),
  isFromBpk: z.boolean().default(false),
});

// Schema de mudança de senha
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z
      .string()
      .min(6, "Nova senha deve ter pelo menos 6 caracteres")
      .max(50, "Nova senha deve ter no máximo 50 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export const eventFormSchema = z.object({
  name: z
    .string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(1000, "Descrição deve ter no máximo 1000 caracteres"),
  eventStartDate: z.string().min(1, "Data de início do evento é obrigatória"),
  eventEndDate: z.string().min(1, "Data de fim do evento é obrigatória"),
  submissionStartDate: z
    .string()
    .min(1, "Data de início das submissões é obrigatória"),
  submissionEndDate: z
    .string()
    .min(1, "Data de fim das submissões é obrigatória"),
  evaluationType: z.enum(["DIRECT", "PAIR", "PANEL"]),
  banner: z.string().optional(),
});

// Schema de evento
export const eventSchema = z.object({
  name: z
    .string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(1000, "Descrição deve ter no máximo 1000 caracteres"),
  eventStartDate: z.union([z.string(), z.date()]).transform((val) => {
    return typeof val === "string" ? new Date(val) : val;
  }),
  eventEndDate: z.union([z.string(), z.date()]).transform((val) => {
    return typeof val === "string" ? new Date(val) : val;
  }),
  submissionStartDate: z.union([z.string(), z.date()]).transform((val) => {
    return typeof val === "string" ? new Date(val) : val;
  }),
  submissionEndDate: z.union([z.string(), z.date()]).transform((val) => {
    return typeof val === "string" ? new Date(val) : val;
  }),
  evaluationType: z.enum(["DIRECT", "PAIR", "PANEL"]),
  banner: z.string().optional(),
});

// Schema de artigo
export const articleSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(150, "Título deve ter no máximo 150 caracteres")
    .transform((val) => val.trim()),
  summary: z
    .string()
    .min(10, "Resumo deve ter pelo menos 10 caracteres")
    .max(300, "Resumo deve ter no máximo 300 caracteres")
    .transform((val) => val.trim()),
  thematicArea: z
    .string()
    .min(2, "Área temática deve ter pelo menos 2 caracteres")
    .max(150, "Área temática deve ter no máximo 150 caracteres")
    .transform((val) => val.trim()),
  keywords: z
    .array(z.string().min(1, "Palavra-chave não pode estar vazia"))
    .min(1, "Pelo menos uma palavra-chave é obrigatória")
    .max(10, "Máximo de 10 palavras-chave permitidas"),
  relatedAuthors: z
    .array(z.string().min(1, "Nome do autor não pode estar vazio"))
    .max(20, "Máximo de 20 autores relacionados"),
  eventId: z.string().min(1, "Evento é obrigatório"),
  pdfPath: z.string().optional(), // Será preenchido após upload
});

// Schema de avaliação
export const evaluationSchema = z.object({
  grade: z
    .number()
    .min(0, "Nota deve ser no mínimo 0")
    .max(10, "Nota deve ser no máximo 10"),
  evaluationDescription: z
    .string()
    .min(50, "Comentário deve ter pelo menos 50 caracteres")
    .max(2000, "Comentário deve ter no máximo 2000 caracteres"),
  responses: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    })
  ),
});

// Schema de criação de avaliador
export const createEvaluatorSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
});

// ===== SCHEMAS PARA CHECKLISTS =====

// Schema para dados básicos do checklist (Etapa 1)
export const checklistBasicSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres")
    .transform((val) => (val === undefined ? val : val?.trim())),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .transform((val) => (val === undefined ? val : val?.trim())),
});

// Schema para uma questão individual - VERSÃO COMPATÍVEL
export const questionSchema = z.object({
  description: z
    .string()
    .min(3, "Pergunta deve ter pelo menos 3 caracteres")
    .max(200, "Pergunta deve ter no máximo 200 caracteres")
    .transform((val) => val.trim()),
  type: z.enum(["YES_NO", "TEXT", "SCALE"], {
    required_error: "Tipo de pergunta é obrigatório",
    invalid_type_error: "Tipo de pergunta inválido",
  }),
  isRequired: z.boolean(),
});

// Schema para múltiplas questões (Etapa 2)
export const questionsSchema = z.object({
  questions: z
    .array(questionSchema)
    .min(1, "Pelo menos uma pergunta é obrigatória")
    .max(20, "Máximo de 20 perguntas permitidas"),
});

// Schema alternativo para formulários com possível undefined
export const questionFormSchema = z.object({
  description: z
    .string()
    .min(3, "Pergunta deve ter pelo menos 3 caracteres")
    .max(200, "Pergunta deve ter no máximo 200 caracteres")
    .transform((val) => val.trim()),
  type: z.enum(["YES_NO", "TEXT", "SCALE"], {
    required_error: "Tipo de pergunta é obrigatório",
    invalid_type_error: "Tipo de pergunta inválido",
  }),
  isRequired: z.preprocess((val) => val ?? true, z.boolean()),
});

export const questionsFormSchema = z.object({
  questions: z
    .array(questionFormSchema)
    .min(1, "Pelo menos uma pergunta é obrigatória")
    .max(20, "Máximo de 20 perguntas permitidas"),
});

// Schema completo para checklist (ambas as etapas)
export const completeChecklistSchema = z.object({
  basic: checklistBasicSchema,
  questions: z.array(questionSchema).min(1),
});

// ===== SCHEMAS PARA FILTROS E BUSCA =====

export const checklistFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  withQuestions: z.boolean().optional(),
});

// ===== TIPOS INFERIDOS DOS SCHEMAS =====

export type ChecklistBasicFormData = z.infer<typeof checklistBasicSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type QuestionsFormData = z.infer<typeof questionsSchema>;
export type QuestionFormSchemaData = z.infer<typeof questionFormSchema>;
export type QuestionsFormSchemaData = z.infer<typeof questionsFormSchema>;
export type CompleteChecklistFormData = z.infer<typeof completeChecklistSchema>;
export type ChecklistFiltersData = z.infer<typeof checklistFiltersSchema>;

// ===== VALIDADORES CUSTOMIZADOS =====

// Validar se pelo menos uma pergunta é obrigatória
export const validateAtLeastOneRequired = (
  questions: QuestionFormData[]
): boolean => {
  return questions.some((q) => q.isRequired);
};

// Validar se as descrições das perguntas são únicas
export const validateUniqueQuestions = (
  questions: QuestionFormData[]
): boolean => {
  const descriptions = questions.map((q) => q.description.toLowerCase().trim());
  return new Set(descriptions).size === descriptions.length;
};

// Validar distribuição de tipos de pergunta
export const validateQuestionDistribution = (
  questions: QuestionFormData[]
): {
  isValid: boolean;
  warnings: string[];
} => {
  const types = questions.map((q) => q.type);
  const typeCount = {
    YES_NO: types.filter((t) => t === "YES_NO").length,
    TEXT: types.filter((t) => t === "TEXT").length,
    SCALE: types.filter((t) => t === "SCALE").length,
  };

  const warnings: string[] = [];

  // Avisos para melhor balanceamento
  if (typeCount.YES_NO === 0) {
    warnings.push("Considere adicionar pelo menos uma pergunta Sim/Não");
  }

  if (typeCount.TEXT > questions.length * 0.5) {
    warnings.push(
      "Muitas perguntas de texto livre podem dificultar a avaliação"
    );
  }

  if (questions.length > 10) {
    warnings.push("Checklists muito longos podem desencorajar avaliadores");
  }

  return {
    isValid: true, // Sempre válido, apenas avisos
    warnings,
  };
};

// ===== HELPERS DE VALIDAÇÃO =====

export const getQuestionTypeOptions = () =>
  [
    { value: "YES_NO", label: "Sim/Não", description: "Resposta: Sim / Não" },
    {
      value: "TEXT",
      label: "Texto Livre",
      description: "Resposta: Campo de texto livre",
    },
    {
      value: "SCALE",
      label: "Escala (1-10)",
      description: "Resposta: Escala de 1 a 10",
    },
  ] as const;

export const validateChecklistBeforeSubmit = (
  basic: ChecklistBasicFormData,
  questions: QuestionFormData[]
): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar dados básicos
  try {
    checklistBasicSchema.parse(basic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map((e) => e.message));
    }
  }

  // Validar questões
  try {
    questionsSchema.parse({ questions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map((e) => e.message));
    }
  }

  // Validações customizadas
  if (!validateAtLeastOneRequired(questions)) {
    warnings.push("Recomenda-se ter pelo menos uma pergunta obrigatória");
  }

  if (!validateUniqueQuestions(questions)) {
    errors.push("Todas as perguntas devem ser únicas");
  }

  const distribution = validateQuestionDistribution(questions);
  warnings.push(...distribution.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// ===== TIPOS INFERIDOS DOS SCHEMAS =====

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type EventFormFields = z.infer<typeof eventFormSchema>;
export type ArticleFormData = z.infer<typeof articleSchema>;
export type EvaluationFormData = z.infer<typeof evaluationSchema>;
export type CreateEvaluatorFormData = z.infer<typeof createEvaluatorSchema>;
