'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, Calendar, TrendingUp, ArrowUpRight, HardHat, 
  Loader2, Activity, Clock, ShieldAlert 
} from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

// ========================================================
// 📊 INTERFACES
// ========================================================
interface UserData {
  userName: string;
  companyId: number;
  adminLevel: number;
  expirationDate?: string;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalPaid: number;
  activeConstructions: number;
  recentConstructions: any[];
}

export default function GeneralDashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('enger_user');
    if (sessionData) {
      const parsedData: UserData = JSON.parse(sessionData);
      setUserData(parsedData);
      fetchDashboardData(parsedData.companyId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchDashboardData = async (compId: number) => {
    try {
      setIsLoading(true);
      // Usamos a rota de obras para calcular os totais na tela inicial
      const response = await api.get(`/obras/${compId}`);
      const obras = response.data || [];

      // Cálculos em tempo real
      const totalRevenue = obras.reduce((acc: number, curr: any) => acc + (curr.totalConstructionValue || 0), 0);
      const totalPaid = obras.reduce((acc: number, curr: any) => acc + (curr.totalPaidValue || 0), 0);
      const activeConstructions = obras.filter((o: any) => o.status === 1).length;
      
      // Pega as 4 últimas obras cadastradas
      const recentConstructions = [...obras].sort((a, b) => b.constructionId - a.constructionId).slice(0, 4);

      setMetrics({
        totalRevenue,
        totalPaid,
        activeConstructions,
        recentConstructions
      });
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Trava de segurança visual: Apenas Admin (3), Gestor (5), Especial (6) e Master (7) veem dinheiro
  const canViewFinancials = (userData?.adminLevel || 0) >= 3;

  if (isLoading || !metrics) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400 animate-in fade-in">
        <Loader2 size={40} className="animate-spin text-orange-600 mb-4" />
        <p className="font-medium text-sm">Carregando painel de controle...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-wider rounded-md">
              Painel de Controle
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-medium text-gray-400">Dados em tempo real</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Olá, {userData?.userName || 'Usuário'}</h2>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 cursor-pointer">
            <Calendar size={18} className="text-gray-400" /> Relatórios
          </button>
          
          {/* Oculta o botão de criar orçamento se for apenas colaborador/fiscal */}
          {canViewFinancials && (
            <Link href={"/dashboard/orcamentos"} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-orange-600/20 flex items-center gap-2 transition-all active:scale-95">
              <Plus size={18} /> Novo Orçamento
            </Link>
          )}
        </div>
      </div>

      {/* ================= CARDS CONDICIONAIS POR NÍVEL ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {canViewFinancials ? (
          // VISÃO DA DIRETORIA / ADMINISTRAÇÃO (Mostra R$)
          <>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><TrendingUp size={80} /></div>
              <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">Volume de Contratos</h3>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-800 leading-none">
                  {metrics.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><Activity size={80} /></div>
              <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">Obras em Andamento</h3>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-800 leading-none">{metrics.activeConstructions}</p>
                <span className="text-xs text-gray-500 font-medium mb-1">projetos ativos</span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><TrendingUp size={80} className="rotate-180" /></div>
              <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">Total Recebido</h3>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-green-600 leading-none">
                  {metrics.totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </>
        ) : (
          // VISÃO OPERACIONAL (Colaboradores e Fiscais - Oculta R$)
          <>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><HardHat size={80} /></div>
              <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">Obras da Empresa</h3>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-800 leading-none">{metrics.activeConstructions}</p>
                <span className="text-xs text-gray-500 font-medium mb-1">em andamento</span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><Activity size={80} /></div>
              <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">Suas Tarefas</h3>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-800 leading-none">0</p>
                <span className="text-xs text-gray-500 font-medium mb-1">pendentes hoje</span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform"><Clock size={80} /></div>
              <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">Horas Registradas</h3>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold text-gray-800 leading-none">40h</p>
                <span className="text-xs text-gray-500 font-medium mb-1">na semana</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LISTAGEM REAL DE OBRAS RECENTES */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">Obras Recentes</h3>
            <Link href="/dashboard/obras" className="text-orange-600 font-bold text-xs hover:underline underline-offset-4">Ver todas</Link>
          </div>
          <div className="space-y-6">
            {metrics.recentConstructions.map((obra, i) => {
              // Cálculo simples de progresso com base no valor pago vs total
              const progresso = (obra.totalConstructionValue > 0) 
                ? Math.min(Math.round((obra.totalPaidValue / obra.totalConstructionValue) * 100), 100) 
                : 0;

              return (
                <div key={obra.constructionId || i} className="flex items-center gap-5 group">
                  <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors shrink-0">
                    <HardHat size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between mb-1.5">
                      <span className="font-semibold text-gray-800 text-sm truncate pr-2">{obra.description}</span>
                      <span className="text-xs font-bold text-gray-400">{progresso}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{ width: `${progresso}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {metrics.recentConstructions.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm italic">Nenhuma obra cadastrada ainda.</div>
            )}
          </div>
        </div>
        
        {/* INFORMAÇÕES DA CONTA / ASSINATURA */}
        <div className="bg-gray-900 p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-orange-600/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold tracking-tight mb-2">Conta Empresarial</h3>
            {userData?.expirationDate ? (
              <p className="text-gray-400 font-normal text-sm mb-10 leading-relaxed">
                Sua assinatura atual é válida até <strong>{new Date(userData.expirationDate).toLocaleDateString('pt-BR')}</strong>.
              </p>
            ) : (
              <p className="text-gray-400 font-normal text-sm mb-10 leading-relaxed">
                Você está acessando o ambiente seguro do SaaS ENGER. Mantenha os pagamentos da sua empresa em dia para evitar bloqueios do sistema.
              </p>
            )}

            {canViewFinancials && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8">
                <div className="flex items-center gap-3 text-orange-400 mb-2">
                  <ShieldAlert size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Aviso Administrativo</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Lembre-se de sempre atualizar o fluxo de caixa das obras na aba Financeiro para que as métricas do seu painel permaneçam precisas.
                </p>
              </div>
            )}
          </div>

          {canViewFinancials && (
            <Link href="/dashboard/assinatura" className="relative z-10 w-full flex items-center justify-center py-3.5 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-700 transition-all cursor-pointer text-center">
              Gerenciar Assinatura
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}