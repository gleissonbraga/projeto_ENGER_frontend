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
interface Stage {
  stageId: number;
  description: string;
  order: number;
}

interface Construction {
  constructionId: number;
  description: string;
  clientName: string;
  totalConstructionValue: number;
  totalPaidValue: number;
  stages: Stage[];
  payments: any[];
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
  value: number | '';
  dueDate: string;
  linkedConstruction: Construction | null;
  linkedStageId: number | '';
}

export default function FinanceiroPage() {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados dos Dados Reais da API
  const [constructions, setConstructions] = useState<Construction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [companyId, setCompanyId] = useState<number>(0);

  const initialFormState: PaymentFormState = {
    value: '',
    dueDate: new Date().toISOString().split('T')[0], // Hoje por padrão
    linkedConstruction: null,
    linkedStageId: ''
  };

  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(initialFormState);

  // ========================================================
  // 🔄 CARREGAMENTO DOS DADOS DA API
  // ========================================================
  const loadData = async (compId: number) => {
    try {
      // Supondo que o controller base seja "obras"
      const response = await api.get(`/obras/${compId}`, { withCredentials: true });
      const obrasData = response.data;
      
      const parsedConstructions: Construction[] = obrasData.map((obra: any) => ({
        constructionId: obra.constructionId,
        description: obra.description,
        clientName: obra.budget?.client?.fantasyName || obra.client?.fantasyName || 'Cliente não informado',
        totalConstructionValue: obra.totalConstructionValue || 0,
        totalPaidValue: obra.totalPaidValue || 0,
        stages: obra.stages || [],
        payments: obra.payments || []
      }));

      setConstructions(parsedConstructions);

      // Extrai todos os pagamentos de dentro das obras para formar a lista
      const allPayments: Payment[] = [];
      parsedConstructions.forEach(obra => {
        obra.payments.forEach(pgto => {
          // Busca o nome da etapa correspondente ao stageId do pagamento
          const stageDesc = obra.stages.find(s => s.stageId === pgto.stageId)?.description || `Etapa ${pgto.stageId}`;
          
          allPayments.push({
            id: pgto.constructionPaymentId,
            description: `Pagamento - ${stageDesc}`,
            construction: obra.description,
            client: obra.clientName,
            value: pgto.paymentValue,
            dueDate: pgto.paymentDate,
            status: 'paid' // Todos os que vêm no array já estão pagos
          });
        });
      });

      // Ordena do mais recente para o mais antigo
      allPayments.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      setPayments(allPayments);

    } catch (error) {
      console.error("Erro ao buscar obras e pagamentos:", error);
    }
  };

  useEffect(() => {
    const sessionData = sessionStorage.getItem('enger_user');
    if (sessionData) {
      const user = JSON.parse(sessionData);
      setCompanyId(user.companyId);
      loadData(user.companyId);
    }
  }, []);

  // ========================================================
  // ⚙️ LÓGICAS E CÁLCULOS
  // ========================================================
  const handleSavePayment = async () => {
    if (!paymentForm.linkedConstruction || !paymentForm.linkedStageId || !paymentForm.value) {
      alert("Selecione a obra, a etapa e informe o valor!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Payload com a DTO do C#
      const payload = {
        paymentDate: new Date(paymentForm.dueDate).toISOString(),
        paymentTypeId: 1, // Assumindo 1 como padrão (Dinheiro/Pix/Transferência)
        stageId: paymentForm.linkedStageId,
        paymentValue: paymentForm.value
      };

      await api.put(`/obras/pagamento/${paymentForm.linkedConstruction.constructionId}/${companyId}`, payload, { withCredentials: true });
      
      // Recarrega os dados após o sucesso para atualizar a lista
      await loadData(companyId);
      
      setView('list');
    } catch (error: any) {
      console.error("Erro ao registrar pagamento:", error.response?.data || error.message);
      alert("Ocorreu um erro ao registrar o pagamento. Verifique o console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.description.toLowerCase().includes(listSearchQuery.toLowerCase()) || 
    p.construction.toLowerCase().includes(listSearchQuery.toLowerCase()) ||
    p.client.toLowerCase().includes(listSearchQuery.toLowerCase())
  );

  // Cálculo de KPIs reais baseado no que vem da API
  const totalPaid = constructions.reduce((acc, curr) => acc + curr.totalPaidValue, 0);
  const totalConstruction = constructions.reduce((acc, curr) => acc + curr.totalConstructionValue, 0);
  const totalPending = totalConstruction - totalPaid; 
  const totalOverdue = 0; // Se houver lógica de vencimento na sua regra de negócio no futuro

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

        {/* KPIs Financeiros */}
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
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Em Atraso</p>
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
                  <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data Efetuada</th>
                  <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Valor</th>
                  <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
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
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider"><CheckCircle size={14}/> Pago</span>
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
            disabled={isSubmitting || !paymentForm.linkedConstruction || !paymentForm.linkedStageId || !paymentForm.value} 
            className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} /> Salvar Pagamento
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* SEÇÃO DA OBRA E ETAPA */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/30 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <h3 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2 relative z-10">
            <HardHat size={20} className="text-orange-600" /> Vínculo de Centro de Custo
          </h3>
          
          <div className="relative z-10 space-y-6">
            
            {/* SELEÇÃO DA OBRA */}
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
                    <p className="text-[11px] text-gray-500 font-medium uppercase mt-0.5 truncate">Cliente: {paymentForm.linkedConstruction.clientName}</p>
                  </div>
                </div>
                <button onClick={() => setPaymentForm({...paymentForm, linkedConstruction: null, linkedStageId: ''})} className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer ml-2 p-2">
                  <X size={20} />
                </button>
              </div>
            )}

            {/* SELEÇÃO DA ETAPA (Aparece apenas se a obra foi selecionada) */}
            {paymentForm.linkedConstruction && (
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Etapa da Obra (Fase Relacionada) *</label>
                <select 
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                  value={paymentForm.linkedStageId}
                  onChange={(e) => setPaymentForm({...paymentForm, linkedStageId: parseInt(e.target.value) || ''})}
                >
                  <option value="" disabled>Selecione a etapa referente a este pagamento...</option>
                  {paymentForm.linkedConstruction.stages.map(stage => (
                    <option key={stage.stageId} value={stage.stageId}>
                      {stage.order} - {stage.description}
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>
        </section>

        {/* SEÇÃO DOS DADOS FINANCEIROS */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Valor do Pagamento (R$) *</label>
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
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Data do Pagamento *</label>
              <input 
                type="date" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-medium text-gray-800"
                value={paymentForm.dueDate}
                onChange={(e) => setPaymentForm({...paymentForm, dueDate: e.target.value})}
              />
            </div>
          </div>
        </section>
      </div>

      {/* MODAL DE SELEÇÃO DE OBRA */}
      <SelectionModal 
        isOpen={isConstructionModalOpen}
        title="Selecionar Obra Ativa" 
        data={constructions} 
        onClose={() => setIsConstructionModalOpen(false)}
        onSelect={(obra: Construction) => {
          setPaymentForm({...paymentForm, linkedConstruction: obra, linkedStageId: ''});
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
    (d.description || d.clientName || '').toLowerCase().includes(q.toLowerCase())
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
              placeholder="Pesquisar por obra ou cliente..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none text-gray-800 text-sm font-medium"
              value={q} 
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-[350px] overflow-y-auto p-4 space-y-2">
          {filtered.map((item: any) => (
            <button 
              key={item.constructionId} 
              onClick={() => onSelect(item)} 
              className="w-full flex items-center justify-between p-4 hover:bg-orange-50 rounded-2xl cursor-pointer transition-all group text-left border border-transparent hover:border-orange-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <HardHat size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{item.description}</p>
                  <p className="text-xs text-gray-500">{item.clientName}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Saldo a Pagar</p>
                 <p className="font-black text-gray-700 group-hover:text-orange-600 transition-colors">
                   R$ {(item.totalConstructionValue - item.totalPaidValue).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                 </p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <Search size={40} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhuma obra encontrada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}