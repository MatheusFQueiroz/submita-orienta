import { api } from "@/lib/api";
import { Article } from "@/types";

interface CreateArticleRequest {
  title: string;
  summary: string;
  thematicArea: string;
  pdfPath: string;
  eventId: string;
  userId: string;
  keywords: string[];
  relatedAuthors: string[];
}

interface SubmitArticleData {
  title: string;
  summary: string;
  thematicArea: string;
  keywords: string[];
  relatedAuthors: string[];
  eventId: string;
  pdfFile?: File;
  pdfPath?: string; // Para edição
}

export const articleService = {
  // Função integrada para submeter artigo (Upload PDF + Criar Artigo)
  async submitArticleWithUpload(
    data: SubmitArticleData,
    userId: string
  ): Promise<Article> {
    try {
      let pdfPath = data.pdfPath;

      // Se tem arquivo PDF, fazer upload primeiro
      if (data.pdfFile) {
        const uploadResponse = await api.uploadFile(
          "/files/upload/pdf",
          data.pdfFile
        );
        pdfPath = uploadResponse.fileName;
      }

      if (!pdfPath) {
        throw new Error("PDF é obrigatório para submissão");
      }

      // Montar payload conforme esperado pela API
      const articleData: CreateArticleRequest = {
        title: data.title,
        summary: data.summary,
        thematicArea: data.thematicArea,
        pdfPath: pdfPath,
        eventId: data.eventId,
        userId: userId,
        keywords: data.keywords,
        relatedAuthors: data.relatedAuthors,
      };

      // Criar artigo
      const article = await api.post<Article>("/articles", articleData);

      return article;
    } catch (error: any) {
      throw new Error(error?.message || "Erro ao submeter artigo");
    }
  },

  // Listar artigos
  async getArticles(params?: {
    search?: string;
    status?: string;
    userId?: string;
  }): Promise<Article[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.userId) searchParams.append("userId", params.userId);

    return api.get<Article[]>(`/articles?${searchParams.toString()}`);
  },

  // Buscar artigo por ID
  async getArticleById(id: string): Promise<Article> {
    return api.get<Article>(`/articles/${id}`);
  },

  // Atualizar artigo
  async updateArticle(
    id: string,
    data: Partial<CreateArticleRequest>
  ): Promise<Article> {
    return api.put<Article>(`/articles/${id}`, data);
  },

  // Atualizar artigo com nova versão (para ressalvas)
  async updateArticleVersion(
    id: string,
    pdfFile: File,
  ): Promise<Article> {
    try {
      // Upload do novo PDF
      const uploadResponse = await api.uploadFile("/files/upload/pdf", pdfFile);

      // Atualizar versão do artigo
      const updateData = {
        pdfPath: uploadResponse.fileName,
      };

      return api.put<Article>(`/articles/${id}/new-version`, updateData);
    } catch (error: any) {
      throw new Error(error?.message || "Erro ao atualizar artigo");
    }
  },

  // Deletar/Retirar artigo
  async deleteArticle(id: string): Promise<void> {
    return api.delete(`/articles/${id}`);
  },

  // Download do PDF
  async downloadPDF(pdfPath: string): Promise<Blob> {
    return api.downloadFile(`/files/file/submita-pdfs?fileName=${pdfPath}`);
  },
};
