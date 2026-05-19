"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  ArrowRight,
  Buildings,
  HardHat,
  ChartLineUp,
  List,
  SignIn,
  X,
} from "@phosphor-icons/react";
import api from "@/services/api";
import { useRouter } from "next/router";
import Link from "next/link";

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
  // const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [subscriptionsType, setSubscriptionsType] = useState<SubscriptionType[]>([]);
  // const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    // Função assíncrona dentro do useEffect
    const carregarDados = async () => {
      try {
        const response = await api.get("/tipo_assinatura"); // Rota do C#
        setSubscriptionsType(response.data);
      } catch (error) {
        console.error("Erro ao buscar:", error);
      }
    };

    carregarDados();
  }, []);

  // Efeito de rolagem para o Header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/login", {
        email,
        password: senha, // Ajuste o nome da chave conforme o seu DTO do C#
      });

      console.log("Sucesso:", response.data);
      setIsLoginOpen(false); // Fecha o modal no sucesso
    } catch (err: any) {
    const apiData = err.response?.data;

    // Verifica se existe o array de erros que você me mostrou
    if (apiData?.errors && Array.isArray(apiData.errors)) {
      // Extraímos apenas as mensagens e juntamos em uma string
      const errorMessages = apiData.errors.map((e: any) => e.message).join(" ");
      setError(errorMessages);
    } 
    else if (apiData?.message) {
      // Caso o backend envie uma mensagem simples em vez da lista
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
                {!loading && <SignIn size={20} weight="bold" />}
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
          {/* Logo */}
          <div className="text-3xl font-black tracking-tighter text-zinc-900">
            ENGER<span className="text-orange-500">.</span>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8 font-medium text-zinc-600">
            <a
              href="#recursos"
              className="hover:text-orange-500 transition-colors"
            >
              Recursos
            </a>
            <a
              href="#planos"
              className="hover:text-orange-500 transition-colors"
            >
              Planos
            </a>
            <button
              className="text-zinc-900 hover:text-orange-500 font-bold transition-colors cursor-pointer"
              onClick={() => setIsLoginOpen(true)}
            >
              Fazer Login
            </button>
            <Link href="/cadastro" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] cursor-pointer">
              Assinar Agora
            </Link>
          </div>

          {/* Menu Mobile Toggle */}
          <button
            className="md:hidden text-zinc-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <List size={28} />}
          </button>
        </div>

        {/* Menu Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-zinc-100 flex flex-col p-6 gap-4">
            <a href="#recursos" className="text-zinc-600 font-medium">
              Recursos
            </a>
            <a href="#planos" className="text-zinc-600 font-medium">
              Planos
            </a>
            <button className="text-left text-zinc-900 font-bold">
              Fazer Login
            </button>
            <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold mt-2">
              Assinar Agora
            </button>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Efeitos Decorativos de Fundo flutuantes */}
        <div className="absolute top-20 left-10 md:left-1/4 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute top-40 right-10 md:right-1/4 w-80 h-80 bg-zinc-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-[pulse_6s_ease-in-out_infinite]"></div>

        <div className="z-10 max-w-4xl animate-[fade-in-up_1s_ease-out]">
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
            <Link href="/cadastro" className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer">
              Começar Teste Grátis <ArrowRight weight="bold" />
            </Link>
            {/* <button className="bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 px-8 py-4 rounded-lg font-bold transition-all cursor-pointer">
              Ver Demonstração
            </button> */}
          </div>
        </div>
      </section>

      {/* RECURSOS SECTION */}
      <section
        id="recursos"
        className="py-24 bg-zinc-50 border-y border-zinc-100"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900">
              Tudo que sua construtora precisa
            </h2>
            <p className="text-zinc-500 mt-4 max-w-2xl mx-auto text-lg">
              Substitua planilhas confusas por um ecossistema inteligente
              desenhado especificamente para o canteiro de obras e o escritório.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-lg hover:border-orange-200 transition-all group">
              <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Buildings size={32} weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">
                Orçamentos Precisos
              </h3>
              <p className="text-zinc-500 leading-relaxed">
                Crie e monte orçamentos interativos de forma rápida. Exporte
                relatórios profissionais em PDF para seus clientes em segundos.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-lg hover:border-orange-200 transition-all group">
              <div className="w-14 h-14 bg-zinc-100 text-zinc-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HardHat size={32} weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">
                Gestão de Equipes
              </h3>
              <p className="text-zinc-500 leading-relaxed">
                Controle a presença, alocação de funcionários e acompanhe a
                produtividade diária de quem está com a mão na massa.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-lg hover:border-orange-200 transition-all group">
              <div className="w-14 h-14 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ChartLineUp size={32} weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">
                Controle Financeiro
              </h3>
              <p className="text-zinc-500 leading-relaxed">
                Acompanhe o fluxo de caixa da obra e tenha relatórios detalhados
                para tomada de decisão e fechamento de medições.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS / ASSINATURAS SECTION */}
      <section id="planos" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900">
              Planos e Assinaturas
            </h2>
            <p className="text-zinc-500 mt-4 text-lg">
              Escolha a melhor opção para sua construtora.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {subscriptionsType.map((plan) => {
              // Lógica para verificar se este é o plano de destaque (Anual)
              const isAnual = plan.descriptionSubscriptionType
                .toLowerCase()
                .includes("anual");

              return (
                <div
                  key={plan.subscriptionTypeId}
                  className={`rounded-2xl p-8 shadow-sm border-2 transition-all relative ${
                    isAnual
                      ? "bg-zinc-900 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.15)] md:-translate-y-4"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  {isAnual && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide whitespace-nowrap">
                      MELHOR CUSTO-BENEFÍCIO
                    </div>
                  )}

                  <h3
                    className={`text-xl font-bold ${isAnual ? "text-white" : "text-zinc-900"}`}
                  >
                    {plan.descriptionSubscriptionType}
                  </h3>

                  <p
                    className={`text-sm mt-2 ${isAnual ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    {isAnual
                      ? "O plano mais completo para sua gestão."
                      : "Acesso total aos recursos."}
                  </p>

                  <div className="my-6">
                    <span
                      className={`text-4xl font-black ${isAnual ? "text-white" : "text-zinc-900"}`}
                    >
                      R${" "}
                      {plan.subscriptionValue.toLocaleString("pt-br", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span
                      className={
                        isAnual ? "text-zinc-400" : "text-zinc-500 text-sm ml-1"
                      }
                    >
                      /
                      {plan.descriptionSubscriptionType
                        .toLowerCase()
                        .replace("al", "")}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    <li
                      className={`flex items-center gap-3 ${isAnual ? "text-zinc-300" : "text-zinc-600"}`}
                    >
                      <CheckCircle
                        className="text-orange-500"
                        weight="fill"
                        size={20}
                      />
                      Acesso a todos os módulos
                    </li>
                    <li
                      className={`flex items-center gap-3 ${isAnual ? "text-zinc-300" : "text-zinc-600"}`}
                    >
                      <CheckCircle
                        className="text-orange-500"
                        weight="fill"
                        size={20}
                      />
                      Suporte especializado
                    </li>
                    {isAnual && (
                      <li className="flex items-center gap-3 text-zinc-300">
                        <CheckCircle
                          className="text-orange-500"
                          weight="fill"
                          size={20}
                        />
                        Bônus: Consultoria Inicial
                      </li>
                    )}
                  </ul>

                  <button
                    className={`w-full font-bold py-3 rounded-lg transition-all cursor-pointer ${
                      isAnual
                        ? "bg-orange-500 hover:bg-orange-600 text-white hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                    }`}
                  >
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
          <div className="text-2xl font-black tracking-tighter text-white">
            ENGER<span className="text-orange-500">.</span>
          </div>
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} ENGER. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-zinc-500 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacidade
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
