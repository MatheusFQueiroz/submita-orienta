// src/middleware.ts - SOLUÇÃO CORRIGIDA

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Rotas que não precisam de autenticação
const publicRoutes = ["/", "/login", "/register"];

// Rotas de redefinir senha
const passwordRoutes = ["/redefinir-senha"];

// Rotas por role
const roleRoutes = {
  STUDENT: [
    "/dashboard",
    "/artigos",
    "/submeter-artigo",
    "/ressalvas",
    "/perfil",
    "/eventos",
  ],
  EVALUATOR: [
    "/dashboard",
    "/artigos",
    "/avaliar",
    "/rascunhos",
    "/historico",
    "/perfil",
  ],
  COORDINATOR: [
    "/dashboard",
    "/eventos",
    "/usuarios",
    "/checklists",
    "/atribuicoes",
    "/relatorios",
    "/perfil",
  ],
};

async function fetchUserProfile(token: string): Promise<any> {
  try {
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const response = await fetch(`${baseURL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();
    return data.data || data; // Dependendo da estrutura da resposta
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pular arquivos estáticos
  if (
    request.nextUrl.pathname.startsWith("/images/") ||
    request.nextUrl.pathname.startsWith("/icons/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Permite acesso às rotas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Verifica se tem token
  const token = request.cookies.get("submita_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verifica e decodifica o token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );
    const { payload } = await jwtVerify(token, secret);

    const tokenData = payload as any;

    // BUSCAR PROFILE COMPLETO DA API para pegar isFirstLogin
    const userProfile = await fetchUserProfile(token);

    if (!userProfile) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("submita_token");
      return response;
    }

    const user = {
      id: tokenData.userId,
      role: tokenData.role || userProfile.role,
      email: tokenData.email || userProfile.email,
      isFirstLogin: userProfile.isFirstLogin || false, // PEGAR DO PROFILE
    };

    // PRIMEIRA VERIFICAÇÃO: Se é primeira senha e NÃO está na rota de redefinir senha
    if (
      user.isFirstLogin &&
      !passwordRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/redefinir-senha", request.url));
    }

    // SEGUNDA VERIFICAÇÃO: Se NÃO é primeira senha mas está tentando acessar rota de redefinir senha
    if (
      !user.isFirstLogin &&
      passwordRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Se é redefinir senha e é primeiro login, permite acesso
    if (
      user.isFirstLogin &&
      passwordRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.next();
    }

    // Verifica permissões por role APENAS se não é primeiro login
    if (!user.isFirstLogin) {
      const userRole = user.role;
      const allowedRoutes =
        roleRoutes[userRole as keyof typeof roleRoutes] || [];

      const hasAccess = allowedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (!hasAccess) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("submita_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
