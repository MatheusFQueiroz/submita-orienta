"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { UserRole } from "@/types";
import { ROUTES, canAccess } from "@/lib/utils";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiresAuth?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requiredRoles = [],
  requiresAuth = true,
  fallback,
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  // ✅ FIX: Usar ref para evitar redirecionamentos múltiplos
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !hasRedirectedRef.current) {
      // Se requer autenticação mas não está autenticado
      if (requiresAuth && !isAuthenticated) {
        hasRedirectedRef.current = true;
        router.push(ROUTES.LOGIN);
        return;
      }

      // Se tem roles específicos mas usuário não tem acesso
      if (requiredRoles.length > 0 && !canAccess(user, requiredRoles)) {
        hasRedirectedRef.current = true;
        router.push(ROUTES.DASHBOARD);
        return;
      }

      // Se é primeira senha, bloqueia acesso
      if (
        user?.isFirstLogin &&
        window.location.pathname !== ROUTES.RESET_PASSWORD
      ) {
        hasRedirectedRef.current = true;
        router.push(ROUTES.RESET_PASSWORD);
        return;
      }
    }
  }, [user, isLoading, isAuthenticated, requiresAuth, requiredRoles, router]);

  // ✅ FIX: Reset do flag quando usuário muda
  useEffect(() => {
    hasRedirectedRef.current = false;
  }, [user?.id]);

  // Carregando
  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      )
    );
  }

  // Não autenticado e precisa de autenticação
  if (requiresAuth && !isAuthenticated) {
    return fallback || null;
  }

  // Não tem permissão para acessar
  if (requiredRoles.length > 0 && !canAccess(user, requiredRoles)) {
    return fallback || null;
  }

  // Primeira senha - bloqueia tudo exceto redefinir senha
  if (
    user?.isFirstLogin &&
    window.location.pathname !== ROUTES.RESET_PASSWORD
  ) {
    return fallback || null;
  }

  return <>{children}</>;
}
