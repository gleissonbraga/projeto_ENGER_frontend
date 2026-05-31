'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Calendar, TrendingUp, ArrowUpRight, HardHat } from 'lucide-react';

export default function GeneralDashboardPage() {
  const [userData, setUserData] = useState<{ userName: string } | null>(null);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('enger_user');
    if (sessionData) {
      setUserData(JSON.parse(sessionData));
    }
  }, []);

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
          <p className="text-gray-500 font-normal mt-1">
            A <span className="font-semibold text-gray-800">Enger Enterprise</span> possui <span className="text-orange-600 font-bold">14 obras ativas</span> hoje.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" /> Relatórios
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-orange-600/20 flex items-center gap-2 transition-all active:scale-95">
            <Plus size={18} /> Novo Orçamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Lucro Previsto', val: 'R$ 842.000', trend: '+12.5%' },
          { label: 'Obras no Prazo', val: '92%', trend: '+2.1%' },
          { label: 'Custo Mensal', val: 'R$ 158.400', trend: '-5.2%' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
              <TrendingUp size={80} />
            </div>
            <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">{s.label}</h3>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-gray-800 leading-none">{s.val}</p>
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-green-600 mb-1">
                <ArrowUpRight size={14} /> {s.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">Obras Recentes</h3>
            <button className="text-orange-600 font-bold text-xs hover:underline underline-offset-4">Ver todas</button>
          </div>
          <div className="space-y-6">
            {[
              { name: 'Edifício Horizonte', client: 'Construtora Sul', progress: 75 },
              { name: 'Residencial Aurora', client: 'Marina Silva', progress: 30 },
              { name: 'Ponte Rio Claro', client: 'Prefeitura Municipal', progress: 95 },
            ].map((obra, i) => (
              <div key={i} className="flex items-center gap-5 group">
                <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                  <HardHat size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-semibold text-gray-800 text-sm">{obra.name}</span>
                    <span className="text-xs font-bold text-gray-400">{obra.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{ width: `${obra.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-900 p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-orange-600/20 rounded-full blur-[80px]"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold tracking-tight mb-2">Plano Enterprise</h3>
            <p className="text-gray-400 font-normal text-sm mb-10 leading-relaxed">Sua assinatura vence em 14 dias. Mantenha os pagamentos em dia para evitar bloqueios.</p>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Uso de Armazenamento</span>
                <span className="text-xs font-bold">8.4 GB / 10 GB</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
            <button className="w-full py-3.5 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-700 transition-all">
              Gerenciar Assinatura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}