"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { FILE_CONFIG } from "@/lib/constants";
import toast from "react-hot-toast";

interface UseFileUploadReturn {
  uploadProgress: number;
  isUploading: boolean;
  uploadedFile: FileUploadResponse | null;
  uploadImage: (file: File) => Promise<FileUploadResponse>;
  uploadPdf: (file: File) => Promise<FileUploadResponse>;
  reset: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileUploadResponse | null>(
    null
  );

  const validateFile = useCallback((file: File, allowedTypes: string[]) => {
    // Verifica tipo
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(
          ", "
        )}`
      );
    }

    // Verifica tamanho
    if (file.size > FILE_CONFIG.maxSize) {
      throw new Error(
        `Arquivo muito grande. Tamanho máximo: ${
          FILE_CONFIG.maxSize / 1024 / 1024
        }MB`
      );
    }
  }, []);

  const uploadImage = useCallback(
    async (file: File): Promise<FileUploadResponse> => {
      try {
        validateFile(file, FILE_CONFIG.allowedImageTypes);
        setIsUploading(true);
        setUploadProgress(0);

        const response = await api.uploadFile(
          "/files/upload/image",
          file,
          (progress) => setUploadProgress(progress)
        );

        // Mapear resposta da API para formato esperado
        const mappedResponse: FileUploadResponse = {
          success: true,
          fileId: response.data?.id || response.id,
          fileName: response.data?.fileName || response.fileName,
          pdfPath: response.data?.fileName || response.fileName,
          fileSize: response.data?.size || response.size || file.size,
          mimeType: response.data?.mimeType || response.mimeType || file.type,
          message: response.message || "Imagem enviada com sucesso!",
        };

        setUploadedFile(mappedResponse);
        toast.success("Imagem enviada com sucesso!");
        return mappedResponse;
      } catch (error: any) {
        toast.error(error.message || "Erro ao enviar imagem");
        throw error;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [validateFile]
  );

  const uploadPdf = useCallback(
    async (file: File): Promise<FileUploadResponse> => {
      try {
        validateFile(file, FILE_CONFIG.allowedPdfTypes);
        setIsUploading(true);
        setUploadProgress(0);

        const response = await api.uploadFile(
          "/files/upload/pdf",
          file,
          (progress) => setUploadProgress(progress)
        );

        // Mapear resposta da API para formato esperado
        // Baseado no exemplo da resposta da API fornecida
        const mappedResponse: FileUploadResponse = {
          success: response.success || true,
          fileId: response.data?.id || response.id,
          fileName: response.data?.fileName || response.fileName,
          pdfPath: response.data?.fileName || response.fileName, // Usar fileName como pdfPath
          fileSize: response.data?.size || response.size || file.size,
          mimeType: response.data?.mimeType || response.mimeType || file.type,
          message: response.message || "PDF enviado com sucesso!",
        };

        setUploadedFile(mappedResponse);
        toast.success("PDF enviado com sucesso!");
        return mappedResponse;
      } catch (error: any) {
        toast.error(error.message || "Erro ao enviar PDF");
        throw error;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [validateFile]
  );

  const reset = useCallback(() => {
    setUploadProgress(0);
    setIsUploading(false);
    setUploadedFile(null);
  }, []);

  return {
    uploadProgress,
    isUploading,
    uploadedFile,
    uploadImage,
    uploadPdf,
    reset,
  };
}

// Tipos atualizados para garantir compatibilidade
export interface FileUploadResponse {
  success: boolean;
  fileId: string;
  fileName: string;
  pdfPath: string; // Será usado como pdfPath na API de artigos
  fileSize: number;
  mimeType: string;
  message?: string;
}

// Exemplo de como usar o hook corrigido
export function useArticleUpload() {
  const { uploadPdf, uploadedFile, isUploading, uploadProgress } =
    useFileUpload();

  const uploadArticlePdf = async (file: File) => {
    try {
      const response = await uploadPdf(file);

      // Retorna o fileName/pdfPath que deve ser usado como pdfPath
      return {
        fileName: response.fileName,
        pdfPath: response.pdfPath,
        fileId: response.fileId,
      };
    } catch (error) {
      throw error;
    }
  };

  return {
    uploadArticlePdf,
    uploadedFile,
    isUploading,
    uploadProgress,
  };
}
