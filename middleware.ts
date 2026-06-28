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
    if (estaLogado && !acabouDeCadastrar) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ==========================================
  // 🔐 REGRA 2: Proteção da Tela de Reativação (/assinatura)
  // ==========================================
  if (pathname.startsWith('/assinatura')) {
    if (!assinaturaExpirada) {
      if (estaLogado) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // ==========================================
  // 👑 REGRA 3: Proteção Exclusiva Master (Admin 7)
  // ==========================================
  if (pathname.startsWith('/configuracoes/site/dashboard')) {
    // Se NÃO estiver logado, ou se o nível for DIFERENTE de 7, expulsa
    if (!estaLogado || adminLevel !== 7) {
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    }
    // Se for 7, o código simplesmente continua e permite o acesso.
  }

  // ==========================================
  // REGRA 4: Proteção do Dashboard Geral
  // ==========================================
  if (pathname.startsWith('/dashboard')) {
    if (!estaLogado) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (acabouDeCadastrar) {
      return NextResponse.redirect(new URL('/pagamento', request.url));
    }

    if (assinaturaExpirada) {
      return NextResponse.redirect(new URL('/assinatura', request.url));
    }

    // Validação de Nível de Acesso interna
    if (pathname.startsWith('/dashboard/obras') && adminLevel < 6) return NextResponse.redirect(new URL('/dashboard', request.url)); 
    if (pathname.startsWith('/dashboard/cargos') && adminLevel < 6) return NextResponse.redirect(new URL('/dashboard', request.url)); 
    if (pathname.startsWith('/dashboard/clientes') && adminLevel < 6) return NextResponse.redirect(new URL('/dashboard', request.url)); 
    if (pathname.startsWith('/dashboard/configuracoes') && adminLevel < 6) return NextResponse.redirect(new URL('/dashboard', request.url)); 
    if (pathname.startsWith('/dashboard/funcionarios') && adminLevel < 6) return NextResponse.redirect(new URL('/dashboard', request.url)); 
    if (pathname.startsWith('/dashboard/financeiro') && adminLevel < 6) return NextResponse.redirect(new URL('/dashboard', request.url)); 
    if (pathname.startsWith('/dashboard/orcamentos') && adminLevel < 6) return NextResponse.redirect(new URL('/dashboard', request.url)); 
    if (pathname.startsWith('/dashboard/usuarios') && adminLevel < 6) return NextResponse.redirect(new URL('/dashboard', request.url)); 
    if (pathname.startsWith('/dashboard/relatorios') && adminLevel < 6) return NextResponse.redirect(new URL('/dashboard', request.url)); 
  }

  return NextResponse.next();
}

export const config = {
  // ATENÇÃO: Adicionado '/configuracoes/:path*' no matcher para a regra do admin 7 funcionar
  matcher: ['/dashboard/:path*', '/pagamento', '/assinatura', '/configuracoes/:path*'],
};