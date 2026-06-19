'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, Building2, Users, CreditCard, 
  Settings, Search, Bell, ChevronDown, Activity,
  TrendingUp, FileText, ShieldAlert, ArrowUpRight,
  MoreVertical, CheckCircle2, AlertCircle, Ban,
  BarChart3, Zap, DollarSign, Database, Globe
} from 'lucide-react';

// ========================================================
// 📊 INTERFACES DO TYPESCRIPT
// ========================================================
type TabType = 'overview' | 'companies' | 'subscriptions' | 'users' | 'settings';
type CompanyStatus = 'active' | 'trial' | 'blocked';

interface DashboardKPIs {
  mrr: number;
  mrrGrowth: string;
  activeCompanies: number;
  companiesGrowth: string;
  totalBudgetsVolume: number;
  budgetsGrowth: string;
  totalUsers: number;
}

interface Company {
  id: number;
  name: string;
  cnpj: string;
  plan: string;
  mrr: number;
  status: CompanyStatus;
  date: string;
  users: number;
}

interface PlanDistribution {
  name: string;
  count: number;
  color: string;
  revenue: number;
}

export default function MasterDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ========================================================
  // 💾 DADOS MOCKADOS (SaaS METRICS)
  // ========================================================
  const kpis: DashboardKPIs = {
    mrr: 45250.00,
    mrrGrowth: "+12.5%",
    activeCompanies: 124,
    companiesGrowth: "+8",
    totalBudgetsVolume: 154000000.00,
    budgetsGrowth: "+2.3M",
    totalUsers: 856
  };

  const recentCompanies: Company[] = [
    { id: 101, name: "Alpha Engenharia", cnpj: "12.345.678/0001-90", plan: "Enterprise", mrr: 499.00, status: "active", date: "31 Mai, 2026", users: 45 },
    { id: 102, name: "Construtora Horizonte", cnpj: "98.765.432/0001-10", plan: "Pro", mrr: 199.00, status: "active", date: "28 Mai, 2026", users: 8 },
    { id: 103, name: "Edifica Soluções", cnpj: "45.678.901/0001-23", plan: "Starter", mrr: 99.00, status: "trial", date: "25 Mai, 2026", users: 2 },
    { id: 104, name: "Vértice Obras", cnpj: "33.444.555/0001-66", plan: "Pro", mrr: 199.00, status: "blocked", date: "15 Abr, 2026", users: 12 },
    { id: 105, name: "Nova Era Projetos", cnpj: "11.222.333/0001-44", plan: "Enterprise", mrr: 499.00, status: "active", date: "10 Mar, 2026", users: 110 },
  ];

  const plansDistribution: PlanDistribution[] = [
    { name: "Starter", count: 45, color: "bg-zinc-600", revenue: 4455 },
    { name: "Pro", count: 65, color: "bg-orange-500", revenue: 12935 },
    { name: "Enterprise", count: 14, color: "bg-orange-300", revenue: 6986 }
  ];

  // ========================================================
  // 🧩 COMPONENTES INTERNOS
  // ========================================================
  const StatusBadge = ({ status }: { status: CompanyStatus }) => {
    const configs = {
      active: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2, text: "Ativo" },
      trial: { color: "bg-orange-500/10 text-orange-400 border-orange-500/20", icon: Zap, text: "Trial" },
      blocked: { color: "bg-red-500/10 text-red-400 border-red-500/20", icon: Ban, text: "Bloqueado" }
    };
    const conf = configs[status] || configs.active;
    const Icon = conf.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.color}`}>
        <Icon size={12} /> {conf.text}
      </span>
    );
  };

  // ========================================================
  // 🖥️ RENDERIZAÇÃO DAS ABAS
  // ========================================================
  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER DA VIEW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Visão Geral da Plataforma</h2>
          <p className="text-sm text-zinc-400 mt-1">Métricas de performance e crescimento do SaaS ENGER em tempo real.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-5 py-2 bg-[#1A1A1A] border border-zinc-800 text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-800 hover:text-white transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
            <FileText size={16} className="text-orange-500" /> Exportar Relatório
          </button>
        </div>
      </div>

      {/* KPI CARDS (Dark Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-zinc-800 shadow-xl relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 relative z-10 flex items-center gap-2">
            <DollarSign size={14} className="text-orange-500" /> MRR (Receita Mensal)
          </p>
          <h3 className="text-3xl font-black text-white tracking-tight relative z-10">R$ {kpis.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          <div className="flex items-center gap-2 mt-4 relative z-10">
            <span className="flex items-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-bold">
              <TrendingUp size={12} className="mr-1" /> {kpis.mrrGrowth}
            </span>
            <span className="text-xs text-zinc-500">vs. mês anterior</span>
          </div>
        </div>

        {/* Empresas Ativas */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-zinc-800 shadow-xl relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 relative z-10 flex items-center gap-2">
            <Building2 size={14} className="text-orange-500" /> Empresas (Inscrições)
          </p>
          <h3 className="text-3xl font-black text-white tracking-tight relative z-10">{kpis.activeCompanies}</h3>
          <div className="flex items-center gap-2 mt-4 relative z-10">
            <span className="flex items-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-bold">
              <TrendingUp size={12} className="mr-1" /> {kpis.companiesGrowth}
            </span>
            <span className="text-xs text-zinc-500">novas este mês</span>
          </div>
        </div>

        {/* Volume de Orçamentos */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-zinc-800 shadow-xl relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 relative z-10 flex items-center gap-2">
            <Globe size={14} className="text-orange-500" /> Volume Transacionado
          </p>
          <h3 className="text-3xl font-black text-white tracking-tight relative z-10"><span className="text-lg text-zinc-400 font-medium mr-1">R$</span>154<span className="text-lg text-zinc-500">M</span></h3>
          <div className="flex items-center gap-2 mt-4 relative z-10">
            <span className="flex items-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-bold">
              <TrendingUp size={12} className="mr-1" /> {kpis.budgetsGrowth}
            </span>
            <span className="text-xs text-zinc-500">em orçamentos na base</span>
          </div>
        </div>

        {/* Total Usuários */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-zinc-800 shadow-xl relative overflow-hidden group hover:border-orange-500/50 transition-colors">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 relative z-10 flex items-center gap-2">
            <Users size={14} className="text-orange-500" /> Usuários Globais
          </p>
          <h3 className="text-3xl font-black text-white tracking-tight relative z-10">{kpis.totalUsers}</h3>
          <div className="flex items-center gap-2 mt-4 relative z-10">
             <span className="text-xs text-zinc-500">Contas criadas pelas empresas</span>
          </div>
        </div>
      </div>

      {/* SEGUNDA LINHA: GRÁFICOS / DISTRIBUIÇÃO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Distribuição de Planos */}
        <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
            <BarChart3 className="text-orange-500" size={16} /> Assinaturas por Plano
          </h3>
          <div className="space-y-5">
            {plansDistribution.map((plan, idx) => {
              const total = plansDistribution.reduce((acc, curr) => acc + curr.count, 0);
              const percentage = Math.round((plan.count / total) * 100);
              return (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-zinc-300">{plan.name}</span>
                    <span className="text-sm font-bold text-white">{plan.count} <span className="text-xs text-zinc-500 font-normal">empresas</span></span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden flex border border-zinc-800">
                    <div className={`${plan.color} h-full rounded-full transition-all duration-1000 relative`} style={{ width: `${percentage}%` }}>
                      <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                    </div>
                  </div>
                  <div className="text-[10px] font-medium text-zinc-500 mt-1.5 text-right uppercase tracking-wider">R$ {plan.revenue.toLocaleString('pt-BR')} MRR</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Últimas Empresas Cadastradas (Tabela Resumo) */}
        <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-6 shadow-xl lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
              <Building2 className="text-orange-500" size={16} /> Cadastros Recentes
            </h3>
            <button 
              onClick={() => setActiveTab('companies')}
              className="text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              Ver todas <ArrowUpRight size={14} />
            </button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="pb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Empresa</th>
                  <th className="pb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Plano</th>
                  <th className="pb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="pb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {recentCompanies.slice(0, 4).map(company => (
                  <tr key={company.id} className="hover:bg-zinc-900/50 transition-colors group">
                    <td className="py-4">
                      <div className="font-semibold text-zinc-200 text-sm">{company.name}</div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">{company.cnpj}</div>
                    </td>
                    <td className="py-4">
                      <span className="text-[11px] font-bold text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">{company.plan}</span>
                    </td>
                    <td className="py-4"><StatusBadge status={company.status} /></td>
                    <td className="py-4 text-right text-xs text-zinc-500 font-medium">{company.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );

  const renderCompanies = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Gestão de Empresas</h2>
          <p className="text-sm text-zinc-400 mt-1">Controle todas as construtoras cadastradas na plataforma.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CNPJ..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 pl-9 pr-4 py-2.5 bg-[#0A0A0A] border border-zinc-800 rounded-xl text-sm text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all shadow-sm placeholder:text-zinc-600" 
          />
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#111111] border-b border-zinc-800">
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Empresa / CNPJ</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Plano & MRR</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Usuários</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Status</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {recentCompanies.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.cnpj.includes(searchQuery)).map(company => (
                <tr key={company.id} className="hover:bg-zinc-900 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-orange-500 font-bold border border-zinc-800">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-200 text-sm">{company.name}</p>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{company.cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-zinc-300 text-sm">{company.plan}</p>
                    <p className="text-xs text-orange-500 font-semibold mt-0.5">R$ {company.mrr.toFixed(2)}/mês</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-xs px-2.5 py-1 rounded-lg">
                      {company.users}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={company.status} />
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-zinc-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all cursor-pointer" title="Gerenciar Empresa">
                      <Settings size={18} />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all ml-1 cursor-pointer" title="Mais Opções">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        <div className="p-4 border-t border-zinc-800 bg-[#111111] flex items-center justify-between text-sm text-zinc-500">
          <span>Mostrando <strong className="text-white">1</strong> a <strong className="text-white">5</strong> de <strong className="text-white">{kpis.activeCompanies}</strong> empresas</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-[#0A0A0A] border border-zinc-800 rounded-lg hover:border-zinc-600 hover:text-white disabled:opacity-50 transition-colors font-medium text-xs cursor-pointer">Anterior</button>
            <button className="px-3 py-1.5 bg-[#0A0A0A] border border-zinc-800 rounded-lg hover:border-zinc-600 hover:text-white transition-colors font-medium text-xs cursor-pointer">Próxima</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'companies': return renderCompanies();
      default: return (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-600 space-y-4">
          <Database size={48} className="opacity-20 text-orange-500" />
          <p className="font-semibold tracking-widest uppercase text-xs">Módulo [{activeTab.toUpperCase()}] em desenvolvimento.</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-black font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* SIDEBAR MASTER (Dark Theme) */}
      <aside className="w-64 bg-[#0A0A0A] text-zinc-300 flex flex-col fixed h-full z-20 border-r border-zinc-900 shadow-2xl">
        
        {/* LOGO AREA */}
        <div className="h-20 flex items-center px-6 border-b border-zinc-900 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              <ShieldAlert className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-black text-xl tracking-tighter text-white leading-none block">ENGER</span>
              <span className="text-[9px] font-bold text-orange-500 uppercase tracking-[0.2em] block mt-0.5">Control Tower</span>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO LATERAL */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          <div className="px-3 mb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Painel de Controle</div>
          
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'hover:bg-zinc-900 hover:text-white border border-transparent text-zinc-400'}`}
          >
            <Activity size={18} /> Visão Geral
          </button>
          
          <button 
            onClick={() => setActiveTab('companies')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'companies' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'hover:bg-zinc-900 hover:text-white border border-transparent text-zinc-400'}`}
          >
            <Building2 size={18} /> Empresas (Inscrições)
          </button>
          
          <button 
            onClick={() => setActiveTab('subscriptions')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'subscriptions' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'hover:bg-zinc-900 hover:text-white border border-transparent text-zinc-400'}`}
          >
            <CreditCard size={18} /> Faturamento / MRR
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'users' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'hover:bg-zinc-900 hover:text-white border border-transparent text-zinc-400'}`}
          >
            <Users size={18} /> Usuários Globais
          </button>

          <div className="px-3 mt-8 mb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Administração</div>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'hover:bg-zinc-900 hover:text-white border border-transparent text-zinc-400'}`}
          >
            <Settings size={18} /> Configurações do Sistema
          </button>
        </nav>

        {/* RODAPÉ SIDEBAR (PERFIL MASTER) */}
        <div className="p-4 border-t border-zinc-900 bg-black/40">
           <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111] border border-zinc-800 cursor-pointer hover:border-orange-500/50 transition-colors group">
              <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-orange-500 font-bold border border-zinc-800 group-hover:bg-orange-500 group-hover:text-black transition-colors">
                G
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">Gleisson B.</p>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest mt-0.5">Super Admin</p>
              </div>
           </div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 ml-64 flex flex-col min-w-0 bg-[#050505]">
        
        {/* HEADER TOP */}
        <header className="h-20 bg-black/60 backdrop-blur-xl border-b border-zinc-900/50 sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
            <span className="text-zinc-600">ENGER SaaS</span>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-300 capitalize">
              {activeTab === 'overview' ? 'Visão Geral' : activeTab === 'companies' ? 'Empresas' : activeTab}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors bg-zinc-900 rounded-full border border-zinc-800 hover:border-zinc-700 cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.8)]"></span>
            </button>
          </div>
        </header>

        {/* RENDER DO MÓDULO ATIVO */}
        <div className="flex-1 p-8 overflow-y-auto relative">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-600/5 rounded-[100%] blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            {renderOverview()} {/* Atualize se quiser usar o renderContent dinâmico no corpo completo */}
          </div>
        </div>

      </main>

    </div>
  );
}