'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, CreditCard, Bell, Target, Lock, 
  RefreshCw, AlertTriangle
} from 'lucide-react';

// Tipagem rigorosa para o controle das sub-abas internas
type SettingsSubTab = 'seguranca' | 'assinatura' | 'notificacoes';

export default function SettingsPage() {
  // Estado para controlar a sub-aba de configurações ativa
  const [settingsSubTab, setSettingsSubTab] = useState<SettingsSubTab>('seguranca');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Configurações</h2>
        <p className="text-gray-500 font-normal mt-1">Gerencie as preferências da sua conta e detalhes da sua organização.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu de Navegação Interno das Configurações */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm">
            <button 
              onClick={() => setSettingsSubTab('seguranca')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all text-left ${settingsSubTab === 'seguranca' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <ShieldCheck size={20} /> Segurança e Senha
            </button>
            <button 
              onClick={() => setSettingsSubTab('assinatura')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all text-left ${settingsSubTab === 'assinatura' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <CreditCard size={20} /> Plano e Faturamento
            </button>
            <button 
              onClick={() => setSettingsSubTab('notificacoes')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all text-left ${settingsSubTab === 'notificacoes' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Bell size={20} /> Notificações
            </button>
          </div>

          <div className="bg-orange-600 p-6 rounded-[2rem] text-white shadow-xl shadow-orange-600/20">
            <h4 className="font-bold mb-2 flex items-center gap-2 text-sm">
              <Target size={18} /> Precisando de Ajuda?
            </h4>
            <p className="text-orange-100 text-xs leading-relaxed mb-4">Nosso suporte técnico está disponível 24/7 para sua empresa.</p>
            <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
              Falar com Suporte
            </button>
          </div>
        </div>

        {/* Conteúdo das Configurações baseado na sub-aba ativa */}
        <div className="lg:col-span-2">
          {settingsSubTab === 'seguranca' && (
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4">
              <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
                <Lock size={14} className="text-orange-600" /> Alterar Senha de Acesso
              </h4>
              
              <form className="space-y-6 max-w-md" onSubmit={(e) => e.preventDefault()}>
                <div className="group">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Senha Atual</label>
                  <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm text-gray-800" />
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nova Senha</label>
                  <input type="password" placeholder="Mínimo 8 caracteres" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm text-gray-800" />
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirmar Nova Senha</label>
                  <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm text-gray-800" />
                </div>
                <button type="submit" className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 cursor-pointer">
                  Atualizar Senha
                </button>
              </form>
            </div>
          )}

          {settingsSubTab === 'assinatura' && (
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-right-4">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                <CreditCard size={120} className="text-gray-900" />
              </div>

              <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
                <CreditCard size={14} className="text-orange-600" /> Gerenciar Assinatura
              </h4>

              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between mb-10">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Plano Atual</p>
                  <h3 className="text-2xl font-bold text-gray-900">Enterprise Yearly</h3>
                  <p className="text-sm text-gray-500 font-medium">Próxima cobrança em <span className="text-gray-800 font-bold">12 de Dezembro de 2026</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100">Ativa</span>
                  <button type="button" className="p-2 text-gray-400 hover:text-orange-600 transition-colors cursor-pointer">
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Cartão de Crédito</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 bg-gray-900 rounded-md flex flex-col justify-center gap-1 p-1">
                      <div className="w-full h-[1px] bg-white/20"></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">•••• 8822</span>
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Valor do Plano</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">R$ 4.790,00</span>
                    <span className="text-xs font-medium text-gray-400">/ano</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h5 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-500" /> Cancelar Assinatura
                    </h5>
                    <p className="text-xs text-gray-500 mt-1">Ao cancelar, você terá acesso aos dados até o fim do período vigente.</p>
                  </div>
                  <button type="button" className="px-6 py-3 border border-red-100 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer">
                    Cancelar Assinatura
                  </button>
                </div>
              </div>
            </div>
          )}

          {settingsSubTab === 'notificacoes' && (
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4">
              <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
                <Bell size={14} className="text-orange-600" /> Preferências de Notificação
              </h4>
              
              <div className="space-y-6">
                {[
                  { title: 'Novos Orçamentos', desc: 'Receba alertas quando um novo orçamento for criado.' },
                  { title: 'Status de Obras', desc: 'Notificações sobre atualizações críticas no canteiro.' },
                  { title: 'Relatórios Mensais', desc: 'Envio automático de resumo financeiro por e-mail.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                    <div>
                      <h5 className="text-sm font-bold text-gray-800">{item.title}</h5>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="relative inline-block w-10 h-5">
                      <input type="checkbox" defaultChecked className="peer appearance-none w-10 h-5 bg-gray-200 rounded-full checked:bg-orange-500 transition-colors cursor-pointer" />
                      <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 pointer-events-none"></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}