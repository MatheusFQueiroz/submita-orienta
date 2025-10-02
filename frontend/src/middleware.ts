import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Rotas que não precisam de autenticação
const publicRoutes = ["/", "/login", "/register"];

// Rotas que requerem redefinição de senha
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

    // Mapear dados do token
    const user = {
      id: tokenData.userId,
      role: tokenData.role,
      isFirstLogin: tokenData.isFirstLogin || false,
      email: tokenData.email,
    };

    // Se é primeira senha e não está na rota de redefinir senha
    if (
      user.isFirstLogin &&
      !passwordRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/redefinir-senha", request.url));
    }

    // Se não é primeira senha mas está tentando acessar rota de redefinir senha
    if (
      !user.isFirstLogin &&
      passwordRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Verifica permissões por role
    const userRole = user.role;
    const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || [];

    // Permite acesso se a rota está nas permitidas para o role
    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!hasAccess) {
      // Redireciona para dashboard se não tem acesso à rota
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Token inválido, redireciona para login
    console.log("Token inválido ou expirado:", error);
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("submita_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
