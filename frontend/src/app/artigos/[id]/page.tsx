"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PDFViewer } from "@/components/common/PDFViewer";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  FileText,
  Download,
  Star,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useAuthContext } from "@/providers/AuthProvider";
import { Article, Evaluation } from "@/types";
import { ROUTES, formatDate, formatUserRole, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface ArticleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { id } = React.use(params);
  const { user } = useAuthContext();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const {
    data: article,
    loading: articleLoading,
  } = useApi<{ article: Article }>(() => api.get(`/articles/${id}`), {
    immediate: true,
  });

  const { data: evaluations, loading: evaluationsLoading } = useApi<
    Evaluation[]
  >(() => api.get(`/articles/${id}`), { immediate: true });

  const fileUrl =
    process.env.NEXT_PUBLIC_API_MINIO +
    "/submita-pdfs/" +
    article?.article.versions?.[0]?.pdfPath;

  // const isAuthor = user?.id === article?.article.userId;
  const isEvaluator = user?.role === USER_ROLES.EVALUATOR;

  const handleWithdrawArticle = async () => {
    try {
      await api.delete(`/articles/${id}`);
      toast.success("Artigo retirado com sucesso!");
      window.location.href = ROUTES.ARTICLES;
    } catch (error: any) {
      toast.error(error.message || "Erro ao retirar artigo");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await api.downloadFile(
        `/files/file/submita-pdfs?fileName=${article?.article.pdfPath}`
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${article?.article.title || "artigo"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Erro ao baixar arquivo");
      console.log("Error downloading PDF:", error);
    }
  };

  if (articleLoading) {
    return (
      <AuthGuard>
        <PageLayout>
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando artigo..." />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (!article) {
    return (
      <AuthGuard>
        <PageLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Artigo não encontrado
            </h2>
            <p className="text-gray-600 mt-2">
              O artigo que você está procurando não existe ou foi removido.
            </p>
            <Button asChild className="mt-4 btn-gradient-accent">
              <Link href={ROUTES.ARTICLES}>Voltar para artigos</Link>
            </Button>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  const breadcrumbs = [
    { label: "Artigos", href: "/artigos" },
    { label: article.article.title },
  ];

  // const canEdit = isAuthor && article.article.status === "SUBMITTED";
  // const canWithdraw =
  //   isAuthor && ["SUBMITTED", "UNDER_REVIEW"].includes(article.article.status);
  const canEvaluate = isEvaluator && article.article.status === "UNDER_REVIEW";

  return (
    <AuthGuard>
      <PageLayout
        title={article.article.title}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex space-x-2">
            {article?.article.pdfPath && (
              <Button variant="outline" className="btn-event-accent" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}

            {canEvaluate && (
              <Button asChild>
                <Link href={ROUTES.EVALUATE_ARTICLE(article.article.id)}>
                  <Star className="mr-2 h-4 w-4" />
                  Avaliar
                </Link>
              </Button>
            )}

            {/* {canWithdraw && (
              <Button
                variant="destructive"
                onClick={() => setWithdrawDialogOpen(true)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Retirar
              </Button>
            )} */}
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna do PDF - 2/3 da largura */}
          <Card className="lg:col-span-2">
            <CardContent>
              {article.article.versions![0].pdfPath ? (
                <PDFViewer
                  fileUrl={fileUrl}
                  fileName={fileUrl}
                  className="min-h-[800px]"
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>Nenhum documento disponível</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coluna da direita - 1/3 da largura */}
          <div className="space-y-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="text-xs">
                  <FileText className="mr-1 h-3 w-3" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="evaluations" className="text-xs">
                  <Star className="mr-1 h-3 w-3" />
                  Avaliações
                </TabsTrigger>
              </TabsList>

              {/* Tab Visão Geral */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Informações Gerais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Informações Gerais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <StatusBadge status={article.article.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Versão:</span>
                      <Badge variant="outline">
                        {article.article.currentVersion}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Data:</span>
                      <span className="text-sm text-gray-600">
                        {formatDate(article.article.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Resumo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {article.article.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Evento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">
                        {article.article.event?.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {article.article.event?.description}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>
                          Submissões:{" "}
                          {formatDate(
                            article.article.event?.submissionStartDate
                          )}{" "}
                          -{" "}
                          {formatDate(article.article.event?.submissionEndDate)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {article.article.event?.evaluationType === "DIRECT"
                          ? "Avaliação Direta"
                          : article.article.event?.evaluationType === "PAIR"
                          ? "Avaliação por Pares"
                          : "Painel"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Ações Rápidas */}
                {/* <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                      <Button
                      disabled={!article.article.pdfPath || !canEdit}
                        variant="outline"
                        onClick={handleDownloadPDF}
                        className="w-full"
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>

                      <Button
                      disabled={!canEdit}
                        variant="outline"
                        asChild
                        className="w-full"
                        size="sm"
                      >
                        <Link href={ROUTES.ARTICLE_DETAILS(article.article.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Artigo
                        </Link>
                      </Button>

                      <Button variant="outline" disabled={!canEvaluate} asChild className="w-full" size="sm">
                        <Link
                          href={ROUTES.EVALUATE_ARTICLE(article.article.id)}
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Avaliar Artigo
                        </Link>
                      </Button>

                      <Button
                      disabled={!canWithdraw}
                        variant="outline"
                        onClick={() => setWithdrawDialogOpen(true)}
                        className="w-full"
                        size="sm"
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Retirar Artigo
                      </Button>
                  </CardContent>
                </Card> */}
              </TabsContent>

              {/* Tab Checklist */}
              <TabsContent value="checklist" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Checklist de Revisão
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-sm font-medium">
                            Formatação ABNT
                          </span>
                        </div>
                        <span className="text-xs text-green-600">Completo</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-sm font-medium">
                            Resumo dentro do limite
                          </span>
                        </div>
                        <span className="text-xs text-green-600">Completo</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">!</span>
                          </div>
                          <span className="text-sm font-medium">
                            Palavras-chave
                          </span>
                        </div>
                        <span className="text-xs text-orange-600">Atenção</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-xs">○</span>
                          </div>
                          <span className="text-sm font-medium">
                            Verificação plágio
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">Pendente</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-xs">○</span>
                          </div>
                          <span className="text-sm font-medium">
                            Aprovação final
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">Pendente</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comentários do Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Palavras-chave:</strong> Revisar se as
                          palavras-chave estão adequadas ao tema do artigo.
                        </p>
                      </div>
                      <textarea
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        rows={3}
                        placeholder="Adicionar observação sobre o checklist..."
                      />
                      <Button size="sm" className="w-full">
                        Adicionar Observação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Avaliações */}
              <TabsContent value="evaluations" className="space-y-4 mt-4">
                {/* Componente de Avaliação para Avaliadores */}
                {canEvaluate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Minha Avaliação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Nota (0-10):
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            className="w-20 px-3 py-2 border rounded-md text-center"
                            placeholder="0.0"
                          />
                          <span className="text-sm text-gray-500">/ 10</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Comentários:
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          rows={4}
                          placeholder="Adicione seus comentários detalhados sobre o artigo..."
                        />
                      </div>
                      <Button className="w-full" size="sm">
                        Salvar Avaliação
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Avaliações Existentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Avaliações Recebidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {evaluationsLoading ? (
                      <div className="text-center py-4">
                        <LoadingSpinner text="Carregando avaliações..." />
                      </div>
                    ) : evaluations && evaluations.length > 0 ? (
                      <div className="space-y-4">
                        {evaluations.map((evaluation) => (
                          <div
                            key={evaluation.id}
                            className="border rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-medium text-sm">
                                  {evaluation.evaluator?.name ||
                                    "Avaliador Anônimo"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatUserRole(
                                    evaluation.evaluator?.role || "EVALUATOR"
                                  )}
                                </p>
                              </div>
                              {evaluation.grade && (
                                <div className="text-right">
                                  <div className="text-xl font-bold text-primary">
                                    {evaluation.grade.toFixed(1)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    / 10
                                  </div>
                                </div>
                              )}
                            </div>

                            {evaluation.evaluationDescription && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {evaluation.evaluationDescription}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>
                                {evaluation.evaluationDate
                                  ? formatDate(evaluation.evaluationDate)
                                  : "Em andamento"}
                              </span>
                              {evaluation.status === "TO_CORRECTION" && (
                                <Badge variant="outline" className="text-xs">
                                  Pendente
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Star className="mx-auto h-12 w-12 mb-3 text-gray-300" />
                        <p className="text-sm">
                          Nenhuma avaliação recebida ainda
                        </p>
                        {article.article.status === "SUBMITTED" && (
                          <p className="text-xs mt-2">
                            O artigo está aguardando atribuição de avaliadores
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Histórico */}
              <TabsContent value="history" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Histórico de Versões
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Versão Atual */}
                      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {article.article.currentVersion}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-sm">
                                Versão {article.article.currentVersion}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                Atual
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">
                              Submetido em{" "}
                              {formatDate(article.article.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <StatusBadge status={article.article.status} />
                          {article.article.pdfPath && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadPDF}
                            >
                              <Download className="mr-1 h-3 w-3" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Versões Anteriores (exemplo) */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            1
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Versão 1.0</p>
                            <p className="text-xs text-gray-600">
                              Submetido em{" "}
                              {formatDate(
                                new Date(
                                  new Date().getTime() - 7 * 24 * 60 * 60 * 1000
                                )
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            Versão Anterior
                          </Badge>
                          <Button variant="outline" size="sm" disabled>
                            <Download className="mr-1 h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline de Eventos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Timeline de Eventos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Artigo Submetido
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(article.article.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Em Revisão</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(
                              new Date(
                                new Date().getTime() - 5 * 24 * 60 * 60 * 1000
                              )
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500">
                            Aguardando Resultado
                          </p>
                          <p className="text-xs text-gray-400">Pendente</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Dialog de Confirmação de Retirada */}
        <ConfirmDialog
          open={withdrawDialogOpen}
          onOpenChange={setWithdrawDialogOpen}
          title="Retirar Artigo"
          description="Tem certeza que deseja retirar este artigo? Esta ação não pode ser desfeita e o artigo será removido permanentemente do evento."
          confirmText="Retirar Artigo"
          cancelText="Cancelar"
          variant="destructive"
          onConfirm={handleWithdrawArticle}
        />
      </PageLayout>
    </AuthGuard>
  );
}
