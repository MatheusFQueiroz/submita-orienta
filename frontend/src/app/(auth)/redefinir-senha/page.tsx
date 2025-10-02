"use client";

import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ROUTES } from "@/lib/constants";

export default function ResetPasswordPage() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Se não está carregando e não há usuário, redireciona para login
    if (!isLoading && !user) {
      router.push(ROUTES.LOGIN);
      return;
    }

    // Se usuário não precisa redefinir senha, redireciona para dashboard
    if (!isLoading && user && !user.isFirstLogin) {
      router.push(ROUTES.DASHBOARD);
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Carregando..." />
      </div>
    );
  }

  if (!user || !user.isFirstLogin) {
    return null; // Redirecionamento em andamento
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Aviso de Segurança */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Acesso Bloqueado:</strong> Para continuar usando o sistema,
            você deve redefinir sua senha temporária por uma senha pessoal e
            segura.
          </AlertDescription>
        </Alert>

        {/* Formulário de Redefinir Senha */}
        <ChangePasswordForm isFirstLogin={true} />

        {/* Informações de Segurança */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center text-sm">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center justify-center">
                <Shield className="mr-2 h-4 w-4" />
                Segurança em Primeiro Lugar
              </h3>
              <div className="space-y-1 text-blue-700 text-left">
                <p>• Esta é uma medida de segurança obrigatória</p>
                <p>• Sua senha deve ser forte e única</p>
                <p>• Não compartilhe suas credenciais</p>
                <p>• Você poderá alterar a senha novamente no perfil</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informação do Usuário */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Logado como: <strong>{user.name}</strong>
          </p>
          <p className="text-xs">
            {user.role === "EVALUATOR" ? "Avaliador" : "Coordenador"} •{" "}
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
