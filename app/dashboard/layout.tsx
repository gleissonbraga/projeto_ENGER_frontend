"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  HardHat,
  UserCircle,
  Briefcase,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Wallet,
  Target,
  LogOut,
  LucideIcon,
} from "lucide-react";
import api from "@/services/api";
import Link from "next/link";

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
  href: string; // Adicionado rota real
}

interface NavigationGroup {
  label: string;
  id: string;
  items: NavigationItem[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    userName: string;
    adminLevel: number;
  } | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const sessionData = sessionStorage.getItem("enger_user");
    if (sessionData) {
      setUserData(JSON.parse(sessionData));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmitExit = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Erro ao encerrar sessão no servidor:", error);
    } finally {
      sessionStorage.removeItem("enger_user");
      window.location.href = "/";
    }
  };

  const navigation: NavigationGroup[] = [
    {
      label: "Gestão",
      id: "gestao",
      items: [
        {
          id: "dashboard",
          label: "Visão Geral",
          icon: LayoutDashboard,
          desc: "Métricas e indicadores principais",
          href: "/dashboard",
        },
        {
          id: "orcamentos",
          label: "Orçamentos",
          icon: FileText,
          desc: "Propostas e orçamentação",
          href: "/dashboard/orcamentos",
        },
        {
          id: "obras",
          label: "Gestão de Obras",
          icon: HardHat,
          desc: "Acompanhamento de canteiro",
          href: "/dashboard/obras",
        },
      ],
    },
    {
      label: "Operacional",
      id: "operacional",
      items: [
        {
          id: "clientes",
          label: "Clientes",
          icon: Users,
          desc: "Base de dados de contratantes",
          href: "/dashboard/clientes",
        },
        {
          id: "funcionarios",
          label: "Funcionários",
          icon: Briefcase,
          desc: "Gestão de Funcionários",
          href: "/dashboard/funcionarios",
        },
        {
          id: "cargos",
          label: "Cargos",
          icon: Target,
          desc: "Estrutura organizacional",
          href: "/dashboard/cargos",
        },
      ],
    },
    {
      label: "Administrativo",
      id: "adm",
      items: [
        {
          id: "financeiro",
          label: "Financeiro",
          icon: Wallet,
          desc: "Contas, fluxo e pagamentos",
          href: "/dashboard/financeiro",
        },
        {
          id: "usuarios",
          label: "Acessos",
          icon: UserCircle,
          desc: "Controle de permissões",
          href: "/dashboard/usuarios",
        },
        {
          id: "configuracoes",
          label: "Configurações",
          icon: Settings,
          desc: "Dados da empresa e assinatura",
          href: "/dashboard/configuracoes",
        },
      ],
    },
    {
      label: "Relatórios",
      id: "relatorio",
      items: [
        {
          id: "pagamentos",
          label: "Pagamentos",
          icon: Wallet,
          desc: "Relatório de Pagamentos",
          href: "/dashboard/relatorios/pagamentos",
        },
      ],
    },
  ];

  const NavItem = ({ group }: { group: NavigationGroup }) => (
    <div
      className="relative group py-6"
      onMouseEnter={() => setActiveGroup(group.id)}
      onMouseLeave={() => setActiveGroup(null)}
    >
      <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors px-4 py-1.5 rounded-full hover:bg-orange-50">
        {group.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${activeGroup === group.id ? "rotate-180" : ""}`}
        />
      </button>

      {/* Mega Dropdown */}
      <div
        className={`
        absolute top-[100%] left-1/2 -translate-x-1/2 w-[480px] bg-white rounded-3xl shadow-2xl shadow-orange-900/10 border border-gray-100 p-6
        transition-all duration-300 origin-top z-50
        ${activeGroup === group.id ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"}
      `}
      >
        <div className="grid grid-cols-1 gap-2">
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  // Fechamos o Mega Dropdown visual quando o usuário clica no link
                  setActiveGroup(null);
                }}
                className={`
                    flex items-start gap-4 p-4 rounded-2xl transition-all text-left border
                    ${isActive ? "bg-orange-50 border-orange-100" : "hover:bg-gray-50 border-transparent"}
                  `}
                          >
                <div
                  className={`p-2.5 rounded-xl ${isActive ? "bg-orange-600 text-white" : "bg-orange-50 text-orange-600"}`}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-gray-800">
                    {item.label}
                  </div>
                  <div className="text-sm text-gray-500 font-normal mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Inter',system-ui,sans-serif] text-gray-900 antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-2 px-4 md:px-12" : "py-6 px-4 md:px-12"}`}
      >
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl px-8 h-20 flex items-center justify-between shadow-xl shadow-gray-200/40">
          <div className="flex items-center justify-start shrink-0">
            <h2
              className="text-3xl font-black text-zinc-900 cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              ENGER<span className="text-orange-500">.</span>
            </h2>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((group) => (
              <NavItem key={group.id} group={group} />
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 focus-within:border-orange-200 focus-within:bg-white transition-all group">
              <Search
                size={16}
                className="text-gray-400 group-focus-within:text-orange-500"
              />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="bg-transparent border-none outline-none px-3 text-sm font-medium w-24 focus:w-40 transition-all text-gray-700"
              />
            </div>

            <button className="relative p-2 text-gray-400 hover:text-orange-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-600 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 group cursor-pointer pl-2 relative py-2">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-700 font-bold border border-orange-100 group-hover:border-orange-300 transition-all">
                {userData?.userName
                  ? userData.userName.substring(0, 2).toUpperCase()
                  : "EX"}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-gray-800 leading-none mb-1 truncate max-w-[100px]">
                  {userData?.userName || "Carregando..."}
                </p>
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">
                  Administrador
                </p>
              </div>

              {/* Menu Dropdown de Perfil */}
              <div className="absolute top-[100%] right-0 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={() => router.push("/dashboard/perfil")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all"
                >
                  <UserCircle size={16} /> Perfil
                </button>
                <button
                  onClick={() => router.push("/dashboard/configuracoes")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all"
                >
                  <Settings size={16} /> Configurações
                </button>
                <div className="h-px bg-gray-50 my-1"></div>
                <button
                  onClick={handleSubmitExit}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-all"
                >
                  <LogOut size={16} /> Sair
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 bg-gray-50 rounded-xl text-gray-500"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="absolute top-24 left-4 right-4 bg-white rounded-[2rem] p-8 shadow-2xl max-h-[80vh] overflow-y-auto">
            {navigation.map((group) => (
              <div key={group.id} className="mb-8 last:mb-0">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">
                  {group.label}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          router.push(item.href);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${pathname === item.href ? "bg-orange-600 text-white" : "bg-gray-50 text-gray-700"}`}
                      >
                        <Icon size={20} />
                        <span className="font-bold text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📌 O CONTEÚDO DAS PÁGINAS FILHAS É INJETADO AQUI DE FORMA DINÂMICA */}
      <main className="pt-32 pb-20 px-4 md:px-12 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <footer className="max-w-7xl mx-auto px-12 py-12 border-t border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-40">
            <div className="w-7 h-7 bg-gray-400 rounded-lg flex items-center justify-center text-white font-bold text-[10px]">
              E
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-800">
              Enger Enterprise
            </span>
          </div>
          <div className="flex gap-8">
            {["Suporte", "Privacidade", "Termos", "Ajuda"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-[11px] font-bold text-gray-400 hover:text-orange-600 transition-colors uppercase tracking-[0.15em]"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
