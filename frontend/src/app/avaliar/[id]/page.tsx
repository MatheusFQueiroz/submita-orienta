"use client";

import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EvaluationForm } from "@/components/forms/EvaluationForm";
import { useApi } from "@/hooks/useApi";
import { Article, Question, Evaluation } from "@/types";
import { EvaluationFormData } from "@/lib/validations";
import { ROUTES, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface EvaluateArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function EvaluateArticlePage({
  params,
}: EvaluateArticlePageProps) {
  const router = useRouter();
  const [articleId, setArticleId] = React.useState<string | null>(null);
  const [paramsError, setParamsError] = React.useState<string | null>(null);

  // Resolver params assíncronos
  React.useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setArticleId(resolvedParams.id);
      } catch (error) {
        console.error("Erro ao resolver params:", error);
        setParamsError("Erro ao carregar parâmetros da página");
      }
    };

    resolveParams();
  }, [params]);

  const { data: article, loading: articleLoading } = useApi<{
    article: Article;
  }>(() => api.get(`/articles/${articleId}`), { immediate: !!articleId });

  const {
    data: questions,
    loading: questionsLoading,
    execute: refetchQuestions,
  } = useApi<Question[]>(
    () =>
      article?.article.eventId
        ? api.get(`/events/${article.article.eventId}/checklist/questions`)
        : Promise.resolve([]),
    { immediate: false }
  );

  const { data: existingEvaluation, loading: evaluationLoading } =
    useApi<Evaluation>(() => api.get(`/articles/${articleId}`), {
      immediate: !!articleId,
    });

  // Carrega perguntas quando artigo é carregado
  React.useEffect(() => {
    if (article?.article.eventId) {
      refetchQuestions();
    }
  }, [article?.article.eventId, refetchQuestions]);

  const handleSubmitEvaluation = async (data: EvaluationFormData) => {
    if (!articleId) return;

    try {
      if (existingEvaluation) {
        // Atualiza avaliação existente
        await api.put(`/evaluations/${existingEvaluation.id}`, data);
      } else {
        // Cria nova avaliação
        await api.post(`/evaluations`, {
          ...data,
          articleId,
        });
      }

      toast.success("Avaliação finalizada com sucesso!");
      router.push(ROUTES.ARTICLES);
    } catch (error: any) {
      throw new Error(error.message || "Erro ao finalizar avaliação");
    }
  };

  const handleSaveDraft = async (data: Partial<EvaluationFormData>) => {
    if (!articleId) return;

    try {
      if (existingEvaluation) {
        await api.put(`/evaluations/${existingEvaluation.id}/draft`, data);
      } else {
        await api.post(`/evaluations/draft`, {
          ...data,
          articleId,
        });
      }

      toast.success("Rascunho salvo com sucesso!");
    } catch (error: any) {
      throw new Error(error.message || "Erro ao salvar rascunho");
    }
  };

  // Show error if params failed to resolve
  if (paramsError) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Erro ao carregar página
            </h2>
            <p className="text-gray-600 mb-4">{paramsError}</p>
            <Button onClick={() => router.back()}>Voltar</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show loading while resolving params
  if (!articleId) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  if (!article) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.EVALUATOR]}>
        <PageLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Artigo não encontrado
            </h2>
            <p className="text-gray-600 mt-2">
              O artigo que você está tentando avaliar não existe ou não está
              disponível.
            </p>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  const breadcrumbs = [
    { label: "Artigos", href: "/artigos" },
    { label: "Avaliar Artigo" },
  ];

  // Converte avaliação existente para formato do formulário
  const initialData = existingEvaluation
    ? {
        grade: existingEvaluation.grade || 0,
        evaluationDescription: existingEvaluation.evaluationDescription || "",
        responses:
          existingEvaluation.responses?.map((r) => ({
            questionId: r.questionId,
            answer: r.answer,
          })) || [],
      }
    : undefined;

  return (
    <AuthGuard requiredRoles={[USER_ROLES.EVALUATOR]}>
      <PageLayout
        title={`Avaliar: ${article.article.title}`}
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-4xl mx-auto">
          <EvaluationForm
            article={article.article}
            questions={questions || []}
            onSubmit={handleSubmitEvaluation}
            onSaveDraft={handleSaveDraft}
            initialData={initialData}
          />
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
