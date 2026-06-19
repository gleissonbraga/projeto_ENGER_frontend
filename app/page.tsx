"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  ArrowRight,
  Building2,   // Substitui o Buildings
  HardHat,
  TrendingUp,  // Substitui o ChartLineUp
  Menu,        // Substitui o List
  LogIn,       // Substitui o SignIn
  X,
  LogOut,
  List
} from "lucide-react";
import api from "@/services/api";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { jwtDecode } from "jwt-decode"; 

export type SubscriptionType = {
  subscriptionTypeId: number;
  descriptionSubscriptionType: string;
  subscriptionValue: number;
};

export interface LoginRequest {
  email: string;
  password: string;
}

export default function EngerHome() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [subscriptionsType, setSubscriptionsType] = useState<SubscriptionType[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  // Estados de Usuário para a Navbar
  const [user, setUser] = useState<{ userName: string; companyId: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sessionData = sessionStorage.getItem('enger_user');
    if (sessionData) {
      setUser(JSON.parse(sessionData));
    }
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const response = await api.get("/tipo_assinatura"); 
        setSubscriptionsType(response.data);
      } catch (error) {
        console.error("Erro ao buscar:", error);
      }
    };

    carregarDados();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('enger_user');
    setUser(null);
    window.location.reload(); 
  };

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", {
        email,
        password: senha, 
      }, {
        withCredentials: true 
      });

      const { expirationDate } = response.data;

      const responseLogin = await api.get('/auth/me', { withCredentials: true });
      
      const { userName, companyId, adminLevel, subscriptionTypeId, userId } = responseLogin.data;

      document.cookie = "EngerAuthToken=true; path=/; max-age=86400; SameSite=Lax";
      document.cookie = `admin_level=${adminLevel || 0}; path=/; max-age=86400; SameSite=Lax`;

      sessionStorage.setItem('enger_user', JSON.stringify({
        userName,
        companyId,
        adminLevel,
        expirationDate,
        userId
      }));

      if (!companyId) {
        document.cookie = "enger_cadastro_pendente=true; path=/; max-age=900; SameSite=Lax";
        setIsLoginOpen(false);
        window.location.href = "/pagamento";
        return;
      }

      if (expirationDate) {
        const dataExpiracao = new Date(expirationDate);
        const agora = new Date();

        if (dataExpiracao < agora) {
          if (subscriptionTypeId) {
            sessionStorage.setItem('enger_plano_anterior_id', subscriptionTypeId.toString());
          }

          document.cookie = "enger_cadastro_pendente=true; path=/; max-age=900; SameSite=Lax";
          document.cookie = "enger_assinatura_expirada=true; path=/; max-age=86400; SameSite=Lax";
          
          setIsLoginOpen(false);
          window.location.href = "/assinatura";
          return;
        }
      }

      document.cookie = "enger_assinatura_expirada=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setIsLoginOpen(false);
      window.location.href = "/dashboard";

    } catch (err: any) {
      const apiData = err.response?.data;

      if (apiData?.errors && Array.isArray(apiData.errors)) {
        const errorMessages = apiData.errors.map((e: any) => e.message).join(" ");
        setError(errorMessages);
      } 
      else if (apiData?.message) {
        setError(apiData.message);
      } 
      else {
        setError("Ocorreu um erro inesperado. Tente novamente.");
      }

      console.error("Erro do servidor:", apiData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans overflow-x-hidden">
      
      {/* MODAL DE LOGIN */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-zinc-900">
                ENGER<span className="text-orange-500">.</span>
              </h2>
              <p className="text-zinc-500 mt-2">
                Acesse o seu painel de gestão
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-black"
                />
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm animate-[shake_0.4s_ease-in-out]">
                  {error}
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2 text-zinc-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />{" "}
                  Lembrar-me
                </label>
                <a
                  href="#"
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  Esqueceu a senha?
                </a>
              </div>

              <button
                disabled={loading}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-lg transition-all mt-4 flex justify-center items-center gap-2 cursor-pointer disabled:bg-zinc-400"
              >
                {loading ? "Carregando..." : "Entrar no Sistema"}
                {!loading && <LogIn size={20} />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-md py-4" : "bg-transparent py-6"}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-3xl font-black tracking-tighter text-zinc-900">
            ENGER<span className="text-orange-500">.</span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium text-zinc-600">
            <a href="#recursos" className="hover:text-orange-500 transition-colors">
              Recursos
            </a>
            <a href="#planos" className="hover:text-orange-500 transition-colors">
              Planos
            </a>
            
            {mounted ? (
              user ? (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/dashboard"
                    className="flex items-center gap-3 pl-3 pr-5 py-2 hover:bg-orange-50 border border-gray-100 hover:border-orange-100 rounded-2xl transition-all cursor-pointer group bg-white shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-black text-sm group-hover:bg-orange-600 group-hover:text-white transition-colors shadow-sm">
                      {getInitials(user.userName)}
                    </div>
                    
                    <div className="text-left hidden sm:block">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Acessar Sistema</p>
                      <p className="text-sm font-bold text-gray-800 mt-1 leading-none group-hover:text-orange-700 transition-colors">{user.userName}</p>
                    </div>
                  </Link>

                  <button 
                    onClick={handleLogout}
                    title="Sair da conta"
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer bg-white shadow-sm border border-gray-100"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    className="text-zinc-900 hover:text-orange-500 font-bold transition-colors cursor-pointer"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    Fazer Login
                  </button>
                  <Link href="/cadastro" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] cursor-pointer">
                    Assinar Agora
                  </Link>
                </>
              )
            ) : (
              <div className="w-24 h-10 bg-gray-100 animate-pulse rounded-lg"></div>
            )}
          </div>

          <button
            className="md:hidden text-zinc-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-zinc-100 flex flex-col p-6 gap-4">
            <a href="#recursos" className="text-zinc-600 font-medium">
              Recursos
            </a>
            <a href="#planos" className="text-zinc-600 font-medium">
              Planos
            </a>
            {user ? (
               <>
                 <Link href="/dashboard" className="text-left text-zinc-900 font-bold">Acessar Sistema</Link>
                 <button onClick={handleLogout} className="text-left text-red-600 font-bold">Sair da Conta</button>
               </>
            ) : (
               <>
                 <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginOpen(true); }} className="text-left text-zinc-900 font-bold">
                   Fazer Login
                 </button>
                 <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold mt-2">
                   Assinar Agora
                 </button>
               </>
            )}
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-20 left-10 md:left-1/4 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30"></div>
        <div className="absolute top-40 right-10 md:right-1/4 w-80 h-80 bg-zinc-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>

        <div className="z-10 max-w-4xl">
          <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 font-semibold text-sm mb-6 border border-orange-200">
            A revolução na gestão de obras
          </span>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-zinc-900 leading-tight tracking-tight">
            Gestão de Obras com <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Energia e Precisão
            </span>
          </h1>
          <p className="mt-6 text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            O SaaS definitivo para construtoras. Controle orçamentos
            interativos, acompanhe a execução e gerencie sua equipe de campo em
            uma plataforma robusta e moderna.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/dashboard" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer">
                Acessar meu Dashboard <ArrowRight />
              </Link>
            ) : (
              <Link href="/cadastro" className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer">
                Começar Teste Grátis <ArrowRight />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* RECURSOS SECTION */}
      <section id="recursos" className="py-24 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900">
              Tudo que sua construtora precisa
            </h2>
            <p className="text-zinc-500 mt-4 max-w-2xl mx-auto text-lg">
              Substitua planilhas confusas por um ecossistema inteligente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mb-6">
                <Building2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Orçamentos Precisos</h3>
              <p className="text-zinc-500 leading-relaxed">
                Crie e monte orçamentos interativos de forma rápida. Exporte relatórios profissionais em PDF em segundos.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-zinc-100 text-zinc-900 rounded-xl flex items-center justify-center mb-6">
                <HardHat size={32} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Gestão de Equipes</h3>
              <p className="text-zinc-500 leading-relaxed">
                Controle a presença, alocação de funcionários e acompanhe a produtividade diária de quem está com a mão na massa.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Controle Financeiro</h3>
              <p className="text-zinc-500 leading-relaxed">
                Acompanhe o fluxo de caixa da obra e tenha relatórios detalhados para tomada de decisão e fechamento de medições.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS / ASSINATURAS SECTION */}
      <section id="planos" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900">Planos e Assinaturas</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {subscriptionsType.map((plan) => {
              const isAnual = plan.descriptionSubscriptionType.toLowerCase().includes("anual");
              return (
                <div key={plan.subscriptionTypeId} className={`rounded-2xl p-8 shadow-sm border-2 transition-all relative ${isAnual ? "bg-zinc-900 border-orange-500 md:-translate-y-4" : "bg-white border-zinc-200"}`}>
                  <h3 className={`text-xl font-bold ${isAnual ? "text-white" : "text-zinc-900"}`}>{plan.descriptionSubscriptionType}</h3>
                  <div className="my-6">
                    <span className={`text-4xl font-black ${isAnual ? "text-white" : "text-zinc-900"}`}>
                      R$ {plan.subscriptionValue.toLocaleString("pt-br", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button onClick={() => setIsLoginOpen(true)} className={`w-full font-bold py-3 rounded-lg transition-all cursor-pointer ${isAnual ? "bg-orange-500 text-white" : "bg-zinc-100 text-zinc-900"}`}>
                    Assinar {plan.descriptionSubscriptionType}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-950 py-12 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black tracking-tighter text-white">ENGER<span className="text-orange-500">.</span></div>
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} ENGER. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}