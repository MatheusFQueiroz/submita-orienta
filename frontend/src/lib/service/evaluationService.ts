import { api } from "@/lib/api";
import { Evaluation } from "@/types";

interface CreateEvaluationRequest {
  grade: number;
  evaluationDescription: string;
  articleId: string;
  responses: {
    questionId: string;
    answer: string;
  }[];
}

export const evaluationService = {
  // Listar avaliações do usuário
  async getMyEvaluations(params?: { status?: string }): Promise<Evaluation[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);

    return api.get<Evaluation[]>(`/evaluations?${searchParams.toString()}`);
  },

  // Buscar avaliação específica
  async getEvaluationById(id: string): Promise<Evaluation> {
    return api.get<Evaluation>(`/evaluations/${id}`);
  },

  // Buscar minha avaliação de um artigo específico
  async getMyEvaluationForArticle(articleId: string): Promise<Evaluation> {
    return api.get<Evaluation>(
      `/evaluations/article/${articleId}/my-evaluation`
    );
  },

  // Finalizar avaliação
  async submitEvaluation(data: CreateEvaluationRequest): Promise<Evaluation> {
    return api.post<Evaluation>("/evaluations", data);
  },

  // Atualizar avaliação
  async updateEvaluation(
    id: string,
    data: Partial<CreateEvaluationRequest>
  ): Promise<Evaluation> {
    return api.put<Evaluation>(`/evaluations/${id}`, data);
  },

  // Salvar rascunho de avaliação
  async saveDraftEvaluation(
    data: Partial<CreateEvaluationRequest>
  ): Promise<Evaluation> {
    return api.post<Evaluation>("/evaluations/draft", data);
  },

  // Atualizar rascunho de avaliação
  async updateDraftEvaluation(
    id: string,
    data: Partial<CreateEvaluationRequest>
  ): Promise<Evaluation> {
    return api.put<Evaluation>(`/evaluations/${id}/draft`, data);
  },

  // Limpar checklist da avaliação
  async clearEvaluationChecklist(id: string): Promise<void> {
    return api.delete(`/evaluations/${id}/clear-checklist`);
  },
};
