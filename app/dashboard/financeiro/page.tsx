'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, ArrowLeft, Save, X, HardHat, 
  TrendingUp, Calendar, AlertTriangle, CheckCircle, Clock 
} from 'lucide-react';
import api from '@/services/api';

// ========================================================
// 📊 INTERFACES RIGOROSAS PARA O TYPESCRIPT
// ========================================================
interface Construction {
  id: number;
  description: string;
  client: string;
}

type PaymentStatus = 'paid' | 'pending' | 'overdue';

interface Payment {
  id: number;
  description: string;
  construction: string;
  client: string;
  value: number;
  dueDate: string;
  status: PaymentStatus;
}

interface PaymentFormState {
  id?: number;
  description: string;
  value: number | '';
  dueDate: string;
  status: PaymentStatus;
  linkedConstruction: Construction | null;
}

export default function FinanceiroPage() {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- DADOS MOCKADOS (Substitua pela chamada da sua API futuramente) ---
  const mockConstructions: Construction[] = [
    { id: 1, description: 'Edifício Solar da Praça', client: 'Alpha Engenharia' },
    { id: 2, description: 'Reforma Residencial Flores', client: 'Condomínio Flores' }
  ];

  const [payments, setPayments] = useState<Payment[]>([
    { id: 1, description: 'Sinal - Início de Obra', construction: 'Edifício Solar da Praça', client: 'Alpha Engenharia', value: 50000, dueDate: '2026-05-10', status: 'paid' },
    { id: 2, description: 'Parcela 1 - Fundações', construction: 'Edifício Solar da Praça', client: 'Alpha Engenharia', value: 25000, dueDate: '2026-06-15', status: 'pending' },
    { id: 3, description: 'Parcela Única - Pintura', construction: 'Reforma Residencial Flores', client: 'Condomínio Flores', value: 15000, dueDate: '2026-05-25', status: 'overdue' }
  ]);

  const initialFormState: PaymentFormState = {
    description: '',
    value: '',
    dueDate: '',
    status: 'pending',
    linkedConstruction: null
  };

  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(initialFormState);

  // ========================================================
  // ⚙️ LÓGICAS E CÁLCULOS
  // ========================================================
  const handleSavePayment = async () => {
    setIsSubmitting(true);
    try {
      // Aqui entraria o POST/PUT para a sua API C#
      // await api.post(`/financeiro/${companyId}`, payload);
      
      console.log("Salvando pagamento vinculado à obra:", paymentForm.linkedConstruction?.id);
      
      setTimeout(() => {
        setView('list');
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.description.toLowerCase().includes(listSearchQuery.toLowerCase()) || 
    p.construction.toLowerCase().includes(listSearchQuery.toLowerCase()) ||
    p.client.toLowerCase().includes(listSearchQuery.toLowerCase())
  );

  // Cálculo de KPIs
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.value, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((acc, curr) => acc + curr.value, 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((acc, curr) => acc + curr.value, 0);

  // ========================================================
  // 🖥️ TELA: LISTAGEM (COM BUSCA E KPIS)
  // ========================================================
  if (view === 'list') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Contas a Receber</h2>
            <p className="text-gray-500 mt-1">Gestão de recebimentos e fluxo de caixa vinculado às obras.</p>
          </div>
          <button 
            onClick={() => { setPaymentForm(initialFormState); setView('create'); }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} /> Novo Recebimento
          </button>
        </div>

        {/* KPIs Financeiros (Estilo do Dashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Recebido (Total)</p>
              <p className="text-2xl font-black text-gray-800">R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">A Receber</p>
              <p className="text-2xl font-black text-gray-800">R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar size={24} /></div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-red-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-1">Em Atraso</p>
              <p className="text-2xl font-black text-red-700">R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center"><AlertTriangle size={24} /></div>
          </div>
        </div>

        {/* BARRA DE BUSCA */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar parcela, obra ou cliente..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-gray-800 text-sm font-medium transition-all"
            value={listSearchQuery}
            onChange={(e) => setListSearchQuery(e.target.value)}
          />
        </div>

        {/* TABELA DE LISTAGEM */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição / Obra</th>
                  <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vencimento</th>
                  <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Valor</th>
                  <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => {/* Lógica para abrir edição */}}>
                    <td className="p-6">
                      <p className="font-bold text-gray-800 text-sm">{payment.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <HardHat size={14} className="text-orange-500" /> {payment.construction}
                      </div>
                    </td>
                    <td className="p-6 text-sm text-gray-600 font-medium">{payment.client}</td>
                    <td className="p-6 text-sm text-gray-600 font-medium">{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</td>
                    <td className="p-6 text-sm font-black text-gray-800 text-right">
                      R$ {payment.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-6 text-center">
                      {payment.status === 'paid' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider"><CheckCircle size={14}/> Pago</span>}
                      {payment.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-wider"><Clock size={14}/> Pendente</span>}
                      {payment.status === 'overdue' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-wider"><AlertTriangle size={14}/> Atrasado</span>}
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400">
                      Nenhum registro financeiro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // 🖥️ TELA: FORMULÁRIO (CRIAR / EDITAR)
  // ========================================================
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER DE AÇÃO */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 pb-6 gap-4">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-400 hover:text-gray-800 font-bold text-sm transition-colors group cursor-pointer self-start sm:self-auto">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <ArrowLeft size={16} />
          </div> 
          Voltar para Lista
        </button>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="text-right hidden sm:block mr-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor do Recebimento</p>
            <p className="text-2xl font-black text-orange-600">
              R$ {Number(paymentForm.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button 
            onClick={handleSavePayment} 
            disabled={isSubmitting} 
            className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all cursor-pointer disabled:opacity-50"
          >
            <Save size={18} /> Salvar Lançamento
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* SEÇÃO DA OBRA */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/30 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <h3 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2 relative z-10">
            <HardHat size={20} className="text-orange-600" /> Obra Vinculada (Centro de Custo)
          </h3>
          
          <div className="relative z-10">
            {!paymentForm.linkedConstruction ? (
              <button 
                onClick={() => setIsConstructionModalOpen(true)}
                className="w-full h-24 border-2 border-dashed border-gray-200 text-gray-400 hover:border-orange-200 hover:bg-orange-50/30 hover:text-orange-600 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer"
              >
                <Plus size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Vincular a uma Obra Ativa</span>
              </button>
            ) : (
              <div className="p-5 bg-orange-50/50 border border-orange-100 rounded-[2rem] flex items-start justify-between group">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20 shrink-0">
                    <HardHat size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-gray-800 text-base truncate">{paymentForm.linkedConstruction.description}</h4>
                    <p className="text-[11px] text-gray-500 font-medium uppercase mt-0.5 truncate">Cliente: {paymentForm.linkedConstruction.client}</p>
                  </div>
                </div>
                <button onClick={() => setPaymentForm({...paymentForm, linkedConstruction: null})} className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer ml-2 p-2">
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* SEÇÃO DOS DADOS FINANCEIROS */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Descrição da Parcela / Cobrança *</label>
              <input 
                type="text" 
                placeholder="Ex: Parcela 02 - Fundação"
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-medium text-gray-800"
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Valor (R$) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 font-black">R$</div>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-medium text-gray-800"
                  value={paymentForm.value}
                  onChange={(e) => setPaymentForm({...paymentForm, value: parseFloat(e.target.value) || ''})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Data de Vencimento *</label>
              <input 
                type="date" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-medium text-gray-800"
                value={paymentForm.dueDate}
                onChange={(e) => setPaymentForm({...paymentForm, dueDate: e.target.value})}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Status do Recebimento *</label>
              <select 
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                value={paymentForm.status}
                onChange={(e) => setPaymentForm({...paymentForm, status: e.target.value as PaymentStatus})}
              >
                <option value="pending">Pendente (A Receber)</option>
                <option value="paid">Pago (Valor Recebido)</option>
                <option value="overdue">Atrasado (Vencido)</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL DE SELEÇÃO DE OBRA */}
      <SelectionModal 
        isOpen={isConstructionModalOpen}
        title="Selecionar Obra" 
        data={mockConstructions} 
        onClose={() => setIsConstructionModalOpen(false)}
        onSelect={(obra: Construction) => {
          setPaymentForm({...paymentForm, linkedConstruction: obra});
          setIsConstructionModalOpen(false);
        }}
      />

    </div>
  );
}

// ========================================================
// 🧩 COMPONENTE DE MODAL (PADRONIZADO)
// ========================================================
function SelectionModal({ isOpen, title, data, onSelect, onClose }: any) {
  const [q, setQ] = useState('');
  if (!isOpen) return null;

  const filtered = data.filter((d: any) => 
    (d.description || d.fantasyName || d.name || '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              autoFocus 
              placeholder="Pesquisar..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none text-gray-800 text-sm font-medium"
              value={q} 
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-[350px] overflow-y-auto p-4 space-y-2">
          {filtered.map((item: any) => (
            <button 
              key={item.id} 
              onClick={() => onSelect(item)} 
              className="w-full flex items-center gap-4 p-4 hover:bg-orange-50 rounded-2xl cursor-pointer transition-all group text-left border border-transparent hover:border-orange-100"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <HardHat size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-800">{item.description || item.fantasyName || item.name}</p>
                <p className="text-xs text-gray-500">{item.client || item.registrationNumber}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <Search size={40} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhum resultado encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}