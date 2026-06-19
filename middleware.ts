import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Verifica se o cookie principal do C# está ativo
  const estaLogado = request.cookies.has('EngerAuthToken');

  // 2. Pega o nível de admin salvo no cookie
  const adminLevelCookie = request.cookies.get('admin_level')?.value;
  const adminLevel = adminLevelCookie ? parseInt(adminLevelCookie, 10) : 0;

  // 3. Cookies temporários de controle de fluxo
  const acabouDeCadastrar = request.cookies.has('enger_cadastro_pendente');
  const assinaturaExpirada = request.cookies.has('enger_assinatura_expirada');

  // ==========================================
  // REGRA 1: Proteção da Tela de Pagamento Comum (/pagamento)
  // ==========================================
  if (pathname.startsWith('/pagamento')) {
    if (estaLogado) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ==========================================
  // 🔐 REGRA 2: Proteção da Tela de Reativação (/assinatura)
  // ==========================================
  if (pathname.startsWith('/assinatura')) {
    // Se o usuário NÃO está com o cookie de assinatura expirada ativo:
    if (!assinaturaExpirada) {
      // Se ele estiver logado normal, manda pro Dashboard. Se não, manda pra Home
      if (estaLogado) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // ==========================================
  // REGRA 3: Proteção do Dashboard Geral
  // ==========================================
  if (pathname.startsWith('/dashboard')) {
    // Se não estiver logado, vai para a raiz inicial
    if (!estaLogado) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Mesmo logado, se a assinatura estiver expirada, tranca o painel e joga na reativação
    if (assinaturaExpirada) {
      return NextResponse.redirect(new URL('/assinatura', request.url));
    }

    // Validação de Nível de Acesso interna
    if (pathname.startsWith('/dashboard/obras') && adminLevel < 6) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }

     if (pathname.startsWith('/dashboard/cargos') && adminLevel < 6) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }

     if (pathname.startsWith('/dashboard/clientes') && adminLevel < 6) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }
    
     if (pathname.startsWith('/dashboard/configuracoes') && adminLevel < 6) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }
    
     if (pathname.startsWith('/dashboard/funcionarios') && adminLevel < 6) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }

      if (pathname.startsWith('/dashboard/financeiro') && adminLevel < 6) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }

     if (pathname.startsWith('/dashboard/orcamentos') && adminLevel < 6) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }

    if (pathname.startsWith('/dashboard/usuarios') && adminLevel < 6) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }

    if (pathname.startsWith('/dashboard/relatorios') && adminLevel < 6) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }

    // Usuário Master
    if (pathname.startsWith('/configuracoes/site/dashboard') && adminLevel < 7) {
      return NextResponse.redirect(new URL('/', request.url)); 
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/pagamento', '/assinatura'],
};