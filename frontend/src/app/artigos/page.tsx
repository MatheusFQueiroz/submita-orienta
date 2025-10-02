"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FileText, Plus, Calendar, User, Eye, Edit } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthContext } from "@/providers/AuthProvider";
import { Article } from "@/types";
import { ROUTES, formatDate, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";

export default function ArticlesPage() {
  const { user } = useAuthContext();
  // eslint-disable-next-line
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: articles } = useApi<Article[]>(
    () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter !== "all") params.append("status", statusFilter);

      return api.get(`dashboard/student/articles`);
    },
    {
      immediate: true,
    }
  );

  const isStudent = user?.role === USER_ROLES.STUDENT;
  const isEvaluator = user?.role === USER_ROLES.EVALUATOR;

  const breadcrumbs = [{ label: "Artigos" }];

  const articleColumns = [
    {
      key: "title",
      title: "Título",
      render: (value: string, article: Article) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">
            Versão {article.currentVersion}
          </p>
        </div>
      ),
    },
    {
      key: "event",
      title: "Evento",
      render: (_: any, article: Article) => (
        <span className="text-sm">
          {article.event?.name || "Evento não encontrado"}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_: any, article: Article) => (
        <StatusBadge status={article.status} />
      ),
    },
    {
      key: "submissionDate",
      title: "Data de Submissão",
      render: (_: any, article: Article) => (
        <div className="text-sm">
          <p>{formatDate(article.createdAt)}</p>
          {article.updatedAt && article.updatedAt !== article.createdAt && (
            <p className="text-gray-500">
              Atualizado em {formatDate(article.updatedAt)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, article: Article) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.ARTICLE_DETAILS(article.id)}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

          {isEvaluator && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.EVALUATE_ARTICLE(article.id)}>Avaliar</Link>
            </Button>
          )}

          {isStudent && article.user?.id === user?.id && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.ARTICLE_DETAILS(article.id)}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AuthGuard>
      <PageLayout
        title="Artigos"
        breadcrumbs={breadcrumbs}
        actions={
          <RoleGuard allowedRoles={[USER_ROLES.STUDENT]}>
            <Button asChild className="btn-gradient-accent">
              <Link href={ROUTES.SUBMIT_ARTICLE}>
                <Plus className="mr-2 h-4 w-4" />
                Submeter Artigo
              </Link>
            </Button>
          </RoleGuard>
        }
      >
        <div className="space-y-6">
          {/* Lista de Artigos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                {isStudent
                  ? "Meus Artigos"
                  : isEvaluator
                  ? "Artigos para Avaliação"
                  : "Todos os Artigos"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={articles || []}
                columns={articleColumns}
                // loading={loading}
                // emptyMessage={
                //   isStudent
                //     ? "Você ainda não submeteu nenhum artigo"
                //     : isEvaluator
                //     ? "Nenhum artigo atribuído para avaliação"
                //     : "Nenhum artigo encontrado"
                // }
                // emptyIcon={FileText}
                // onRowClick={(article: any) =>
                //   (window.location.href = ROUTES.ARTICLE_DETAILS(article.id))
                // }
              />
            </CardContent>
          </Card>

          {/* Cards de Artigos para Mobile */}
          <div className="md:hidden space-y-4">
            {articles?.map((article) => (
              <Card
                key={article.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {article.event?.name}
                      </p>
                    </div>
                    <StatusBadge status={article.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="mr-2 h-4 w-4" />
                    {article.user?.name}
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(article.createdAt)}
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge variant="outline">
                      Versão {article.currentVersion}
                    </Badge>

                    <Button variant="outline" size="sm" asChild>
                      <Link href={ROUTES.ARTICLE_DETAILS(article.id)}>
                        Ver Detalhes
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
