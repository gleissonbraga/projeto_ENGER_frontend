'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, UserCircle, ChevronRight, Plus, X, 
  Search, Users, UserCheck, Building2, Trash2, Truck, 
  Hammer, Save, Info, Download, MapPin,
  Mail, MessageCircle, Send, Loader2, AlertTriangle, CheckCircle, Lock
} from 'lucide-react';
import api from '@/services/api';

// ========================================================
// 📊 INTERFACES RIGOROSAS PARA O TYPESCRIPT
// ========================================================
interface Client {
  id?: number;
  clientId?: number;
  fantasyName: string;
  reasonName?: string;
  registrationNumber: string;
  city: string;
  federativeunit?: string;
  federativeUnit?: string;
  email: string;
}

interface Employee {
  id?: number;
  employeeId?: number;
  employeeName: string;
  email: string;
  registrationNumber?: string;
  positionId?: number;
}

interface BudgetMaterial {
  id: number;
  description: string;
  unit: string;
  plannedQuantity: number;
  unitCost: number;
  isClientProvided: boolean;
}

interface BudgetLabor {
  id: number;
  roleId: number | string;
  plannedHours: number;
  hourlyRate: number;
  socialCharges: number;
}

interface BudgetStage {
  id: number;
  description: string;
  order: number;
  materials: BudgetMaterial[];
  labors: BudgetLabor[];
}

interface BudgetFormState {
  id?: number;
  status: number; // 12: Pendente, 13: Aprovado, 14: Rejeitado, 17: Cancelado
  clientId: number | null;
  userId: number | null; 
  description: string;
  observation: string;
  street: string;
  number: string;
  city: string;
  neighborhood: string;
  zipCode: string;
  stateAbbreviation: string;
  totalStepsValue: number;
  totalMaterialsValue: number;
  totalValue: number;
  stages: BudgetStage[];
}

export default function OrcamentosPage() {
  const [budgetView, setBudgetView] = useState<'list' | 'create'>('list');
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');
  const [listSearchQuery, setListSearchQuery] = useState<string>('');

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // 🚀 NOVO: Estado de validação de campos
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const initialFormState: BudgetFormState = {
    status: 12, // BudPending
    clientId: null,
    userId: null,
    description: '',
    observation: '',
    street: '',
    number: '',
    city: '',
    neighborhood: '',
    zipCode: '',
    stateAbbreviation: '',
    totalStepsValue: 0,
    totalMaterialsValue: 0,
    totalValue: 0,
    stages: [
      { id: Date.now(), description: '', order: 1, materials: [], labors: [] }
    ]
  };

  const [budgetForm, setBudgetForm] = useState<BudgetFormState>(initialFormState);
  
  const isReadOnly = budgetForm.status !== 12;

  // ========================================================
  // 🔄 INTEGRAÇÃO COM A API
  // ========================================================
  useEffect(() => {
    const sessionData = sessionStorage.getItem('enger_user');
    if (sessionData) {
      const parsedData = JSON.parse(sessionData);
      setCompanyId(parsedData.companyId);
      loadDependencies(parsedData.companyId);
    } else {
      setIsLoadingData(false);
    }
  }, []);

  const loadDependencies = async (compId: number) => {
    try {
      setIsLoadingData(true);
      const [clientsRes, employeesRes, budgetsRes] = await Promise.all([
        api.get(`/cliente/${compId}`),
        api.get(`/funcionarios/${compId}`),
        api.get(`/orcamento/${compId}`)
      ]);
      setClients(clientsRes.data);
      setEmployees(employeesRes.data);
      setBudgets(budgetsRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setFeedbackMsg({ type: 'error', text: "Erro ao comunicar com o servidor." });
    } finally {
      setIsLoadingData(false);
    }
  };

  // 🚀 NOVO: Validação rígida antes de salvar
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!budgetForm.clientId) errors.client = "Obrigatório.";
    if (!budgetForm.userId) errors.user = "Obrigatório.";
    if (!budgetForm.description.trim()) errors.description = "A descrição do orçamento é obrigatória.";
    
    if (!budgetForm.zipCode.trim()) errors.zipCode = "Obrigatório";
    if (!budgetForm.street.trim()) errors.street = "Obrigatório";
    if (!budgetForm.neighborhood.trim()) errors.neighborhood = "Obrigatório";
    if (!budgetForm.city.trim()) errors.city = "Obrigatório";
    if (!budgetForm.stateAbbreviation.trim()) errors.stateAbbreviation = "Obrigatório";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveBudget = async () => {
    setFeedbackMsg(null);
    setFieldErrors({});

    if (!companyId) return setFeedbackMsg({ type: 'error', text: "ID da empresa não encontrado." });

    if (!validateForm()) {
      setFeedbackMsg({ type: 'error', text: "Verifique os campos destacados em vermelho." });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...budgetForm,
        stages: budgetForm.stages.map((stage, idx) => ({
          description: stage.description,
          order: idx + 1,
          materials: stage.materials.map(m => ({
            description: m.description,
            unit: m.unit,
            plannedQuantity: m.plannedQuantity,
            unitCost: m.unitCost,
            isClientProvided: m.isClientProvided
          })),
          labors: stage.labors.map(l => ({
            roleId: Number(l.roleId) || 0,
            plannedHours: l.plannedHours,
            hourlyRate: l.hourlyRate,
            socialCharges: l.socialCharges
          }))
        }))
      };

      if (budgetForm.id) {
        await api.put(`/orcamento/${companyId}/${budgetForm.id}`, payload, {withCredentials: true});
        setFeedbackMsg({ type: 'success', text: "Orçamento atualizado com sucesso!" });
      } else {
        await api.post(`/orcamento/${companyId}`, payload, {withCredentials: true});
        setFeedbackMsg({ type: 'success', text: "Orçamento criado e e-mail enviado com sucesso!" });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      setTimeout(() => {
        setBudgetView('list');
        setFeedbackMsg(null);
        loadDependencies(companyId);
      }, 2000);

    } catch (error: any) {
      setFeedbackMsg({ type: 'error', text: "Erro ao salvar orçamento. Verifique os dados inseridos." });
      
      // 🚀 Lida com os erros retornados pela API (ex: Validation.InputRequired)
      const apiErrors = error.response?.data?.errors;
      if (apiErrors && Array.isArray(apiErrors)) {
        const backendErrors: Record<string, string> = {};
        apiErrors.forEach((err: any) => {
          const fieldName = (err.field || err.Field || '').toLowerCase();
          backendErrors[fieldName] = err.message || err.Message;
        });
        setFieldErrors(prev => ({...prev, ...backendErrors}));
      }
      
      console.error(error.response?.data?.errors || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseStatus = (statusInfo: any): number => {
    if (statusInfo === 12 || statusInfo === 'BudPending' || statusInfo === 'Pending') return 12;
    if (statusInfo === 13 || statusInfo === 'BudApproved' || statusInfo === 'Approved') return 13;
    if (statusInfo === 14 || statusInfo === 'BudRejected' || statusInfo === 'Rejected') return 14;
    if (statusInfo === 17 || statusInfo === 'BudCanceled' || statusInfo === 'Canceled') return 17;
    return Number(statusInfo) || 12; 
  };

  const handleOpenBudget = (budget: any) => {
    const mappedClient = clients.find(c => (c.clientId || c.id) === (budget.clientId || budget.client?.clientId)) || budget.client;
    const mappedEmployee = employees.find(e => (e.employeeId || e.id) === budget.userId) || 
                          (budget.userId ? { employeeName: 'Responsável (ID: ' + budget.userId + ')', email: '' } as any : null);
    
    setSelectedClient(mappedClient || null);
    setSelectedUser(mappedEmployee || null);
    setFieldErrors({}); // Limpa erros ao abrir edição

    const safeStatus = parseStatus(budget.status);

    setBudgetForm({
      id: budget.budgetId || budget.id,
      status: safeStatus,
      clientId: mappedClient?.clientId || mappedClient?.id || budget.clientId || null,
      userId: mappedEmployee?.employeeId || mappedEmployee?.id || budget.userId || null,
      description: budget.description || '',
      observation: budget.observation || '',
      street: budget.street || budget.client?.street || '',
      number: budget.number || budget.client?.number || '',
      city: budget.city || budget.client?.city || '',
      neighborhood: budget.neighborhood || budget.client?.neighborhood || '',
      zipCode: budget.zipCode || budget.client?.zipCode || '',
      stateAbbreviation: budget.stateAbbreviation || budget.client?.federativeUnit || '',
      totalStepsValue: budget.totalStepsValue || 0,
      totalMaterialsValue: budget.totalMaterialsValue || 0,
      totalValue: budget.totalValue || 0,
      stages: budget.stages?.map((s: any) => ({
        id: s.stageId || Date.now() + Math.random(),
        description: s.description,
        order: s.order,
        materials: s.materials?.map((m: any) => ({ ...m, id: m.budgetMaterialId || Date.now() + Math.random() })) || [],
        labors: s.labors?.map((l: any) => ({ ...l, id: l.budgetLaborId || Date.now() + Math.random() })) || []
      })) || []
    });
    
    setBudgetView('create');
  };

  const handleCreateNew = () => {
    setSelectedClient(null);
    setSelectedUser(null);
    setFieldErrors({}); // Limpa erros ao abrir novo
    setBudgetForm(initialFormState);
    setBudgetView('create');
  };

  const getStatusBadge = (status: number | string) => {
    const s = parseStatus(status);
    if (s === 12) return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold uppercase">Pendente</span>;
    if (s === 13) return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Aprovado</span>;
    if (s === 14) return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase">Rejeitado</span>;
    if (s === 17) return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold uppercase">Cancelado</span>;
    return <span className="px-3 py-1 bg-zinc-100 text-zinc-500 rounded-full text-[10px] font-bold uppercase">Desconhecido</span>;
  };

  const addStage = () => {
    if (isReadOnly) return;
    setBudgetForm(prev => ({ ...prev, stages: [...prev.stages, { id: Date.now(), description: '', order: prev.stages.length + 1, materials: [], labors: [] }] }));
  };
  
  const removeStage = (id: number) => {
    if (isReadOnly) return;
    setBudgetForm(prev => ({ ...prev, stages: prev.stages.filter(s => s.id !== id) }));
  };
  
  const addMaterial = (stageId: number) => {
    if (isReadOnly) return;
    setBudgetForm(prev => ({ ...prev, stages: prev.stages.map(s => s.id === stageId ? { ...s, materials: [...s.materials, { id: Date.now(), description: '', unit: '', plannedQuantity: 0, unitCost: 0, isClientProvided: false }] } : s) }));
  };
  
  const addLabor = (stageId: number) => {
    if (isReadOnly) return;
    setBudgetForm(prev => ({ ...prev, stages: prev.stages.map(s => s.id === stageId ? { ...s, labors: [...s.labors, { id: Date.now(), roleId: '', plannedHours: 0, hourlyRate: 0, socialCharges: 0 }] } : s) }));
  };

  const updateBudgetTotals = () => {
    let totalMat = 0;
    let totalLab = 0;
    budgetForm.stages.forEach(s => {
      s.materials.forEach(m => {
        if (!m.isClientProvided) totalMat += (Number(m.plannedQuantity) * Number(m.unitCost));
      });
      s.labors.forEach(l => {
        const base = Number(l.plannedHours) * Number(l.hourlyRate);
        totalLab += base + (base * (Number(l.socialCharges) / 100));
      });
    });
    setBudgetForm(prev => ({ ...prev, totalMaterialsValue: totalMat, totalStepsValue: totalLab, totalValue: totalMat + totalLab }));
  };

  useEffect(() => {
    updateBudgetTotals();
  }, [budgetForm.stages]);

  const filteredAndSortedBudgets = budgets
    .filter(budget => {
      const searchLower = listSearchQuery.toLowerCase();
      const matchDescription = budget.description?.toLowerCase().includes(searchLower);
      const matchClient = budget.client?.fantasyName?.toLowerCase().includes(searchLower);
      return matchDescription || matchClient;
    })
    .sort((a, b) => {
      const idA = a.budgetId || a.id || 0;
      const idB = b.budgetId || b.id || 0;
      return idB - idA;
    });

  if (budgetView === 'list') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Orçamentos</h2>
            <p className="text-gray-500 mt-1">Gerencie propostas e estimativas de custos.</p>
          </div>
          <button 
            onClick={handleCreateNew}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} /> Novo Orçamento
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar por descrição ou cliente..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-gray-800 text-sm font-medium transition-all"
            value={listSearchQuery}
            onChange={(e) => setListSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-[2rem] border border-gray-100">
              <Loader2 size={32} className="animate-spin text-orange-500 mb-4" />
              <p className="font-medium text-sm">Carregando orçamentos...</p>
            </div>
          ) : filteredAndSortedBudgets.length > 0 ? (
            filteredAndSortedBudgets.map((budget) => (
              <div 
                key={budget.budgetId || budget.id} 
                onClick={() => handleOpenBudget(budget)}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{budget.description}</h4>
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-2 mt-1">
                      <Calendar size={12} /> {new Date(budget.entryDate || Date.now()).toLocaleDateString('pt-BR')} • 
                      <UserCircle size={12} /> Cliente: {budget.client?.fantasyName || 'Desconhecido'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor Total</p>
                    <p className="text-lg font-black text-gray-800">R$ {budget.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(budget.status)}
                    <div className="p-2 text-gray-300 group-hover:text-orange-600 transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="text-center py-12 text-gray-400 bg-white rounded-[2rem] border border-gray-100 flex flex-col items-center">
               <Search size={40} className="opacity-20 mb-3" />
               <p className="font-medium">Nenhum orçamento encontrado.</p>
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-sm ${feedbackMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100 animate-[shake_0.4s_ease-in-out]'}`}>
          {feedbackMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {feedbackMsg.text}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <button onClick={() => setBudgetView('list')} className="flex items-center gap-2 text-gray-400 hover:text-gray-800 font-bold text-sm transition-colors group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <X size={16} />
          </div> 
          Voltar
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right mr-4 hidden md:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor Estimado</p>
            <p className="text-2xl font-black text-orange-600">R$ {budgetForm.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          
          {isReadOnly ? (
            <div className="flex items-center gap-2 px-5 py-3.5 bg-gray-100 text-gray-500 rounded-2xl font-bold text-sm shadow-sm cursor-not-allowed border border-gray-200">
              <Lock size={18} /> Orçamento {budgetForm.status === 13 ? 'Aprovado' : budgetForm.status === 14 ? 'Rejeitado' : 'Cancelado'} (Bloqueado)
            </div>
          ) : (
            <button onClick={handleSaveBudget} disabled={isSubmitting} className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-black transition-all cursor-pointer disabled:opacity-50">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
              {budgetForm.id ? 'Salvar Edição' : 'Salvar Orçamento'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          
          <section className={`bg-white p-8 rounded-[2.5rem] border shadow-sm overflow-hidden relative transition-all ${fieldErrors.client || fieldErrors.user ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-100'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/30 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <h3 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2 relative z-10">
              <Users size={20} className="text-orange-600" /> Envolvidos no Projeto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <label className={`block text-[11px] font-bold uppercase tracking-widest ml-1 ${fieldErrors.client ? 'text-red-500' : 'text-gray-400'}`}>Cliente Solicitante *</label>
                {!selectedClient ? (
                  <button 
                    onClick={() => !isReadOnly && setIsClientModalOpen(true)}
                    disabled={isReadOnly}
                    className={`w-full h-24 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all ${isReadOnly ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed' : fieldErrors.client ? 'border-red-300 text-red-500 bg-red-50/50 hover:bg-red-100 cursor-pointer' : 'border-gray-200 text-gray-400 hover:border-orange-200 hover:bg-orange-50/30 hover:text-orange-600 group cursor-pointer'}`}
                  >
                    <Plus size={24} className={!isReadOnly ? "group-hover:scale-110 transition-transform" : ""} />
                    <span className="text-sm font-bold">Selecionar Cliente</span>
                  </button>
                ) : (
                  <div className="p-5 bg-orange-50/50 border border-orange-100 rounded-[2rem] flex items-start justify-between group">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20 shrink-0">
                        <Building2 size={24} />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-gray-800 text-base truncate">{selectedClient.fantasyName}</h4>
                        <p className="text-[11px] text-gray-500 font-medium uppercase mt-0.5 truncate">{selectedClient.registrationNumber}</p>
                      </div>
                    </div>
                    {!isReadOnly && (
                      <button onClick={() => { setSelectedClient(null); setBudgetForm({...budgetForm, clientId: null}); }} className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer ml-2">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
                {fieldErrors.client && <p className="text-[11px] font-bold text-red-500 ml-1">{fieldErrors.client}</p>}
              </div>

              <div className="space-y-4">
                <label className={`block text-[11px] font-bold uppercase tracking-widest ml-1 ${fieldErrors.user ? 'text-red-500' : 'text-gray-400'}`}>Responsável Técnico *</label>
                {!selectedUser ? (
                  <button 
                    onClick={() => !isReadOnly && setIsUserModalOpen(true)}
                    disabled={isReadOnly}
                    className={`w-full h-24 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all ${isReadOnly ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed' : fieldErrors.user ? 'border-red-300 text-red-500 bg-red-50/50 hover:bg-red-100 cursor-pointer' : 'border-gray-200 text-gray-400 hover:border-orange-200 hover:bg-orange-50/30 hover:text-orange-600 group cursor-pointer'}`}
                  >
                    <Plus size={24} className={!isReadOnly ? "group-hover:scale-110 transition-transform" : ""} />
                    <span className="text-sm font-bold">Definir Responsável</span>
                  </button>
                ) : (
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-[2rem] flex items-start justify-between group">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                        <UserCheck size={24} />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-gray-800 text-base truncate">{selectedUser.employeeName}</h4>
                        <p className="text-[11px] text-gray-400 font-medium mt-1 truncate">{selectedUser.email}</p>
                      </div>
                    </div>
                    {!isReadOnly && (
                      <button onClick={() => { setSelectedUser(null); setBudgetForm({...budgetForm, userId: null}); }} className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer ml-2">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
                {fieldErrors.user && <p className="text-[11px] font-bold text-red-500 ml-1">{fieldErrors.user}</p>}
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={`block text-[11px] font-bold uppercase tracking-widest mb-2 ml-1 ${fieldErrors.description ? 'text-red-500' : 'text-gray-400'}`}>Descrição do Orçamento *</label>
                <input 
                  type="text" 
                  disabled={isReadOnly}
                  placeholder="Ex: Reforma de Telhado e Pintura Externa"
                  className={`w-full px-5 py-3.5 border rounded-2xl outline-none transition-all text-sm font-medium text-gray-800 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${fieldErrors.description ? 'bg-red-50/50 border-red-300 focus:border-red-500 focus:bg-white' : 'bg-gray-50 border-transparent focus:bg-white focus:border-orange-500'}`}
                  value={budgetForm.description}
                  onChange={(e) => {
                    setBudgetForm({...budgetForm, description: e.target.value});
                    if(fieldErrors.description) setFieldErrors({...fieldErrors, description: ''});
                  }}
                />
                {fieldErrors.description && <p className="text-[11px] font-bold text-red-500 mt-1 ml-1">{fieldErrors.description}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Observações Internas</label>
                <input 
                  type="text" 
                  disabled={isReadOnly}
                  placeholder="Notas adicionais e detalhamentos corporativos"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-medium text-gray-800 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  value={budgetForm.observation}
                  onChange={(e) => setBudgetForm({...budgetForm, observation: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 mt-4">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Local da Obra (Endereço)</label>
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-2">
                    <input type="text" maxLength={8} disabled={isReadOnly} className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-xs font-semibold outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${fieldErrors.zipCode ? 'border-red-300 bg-red-50' : 'border-transparent focus:bg-white focus:border-orange-500'}`} placeholder="CEP *" value={budgetForm.zipCode} onChange={(e) => { setBudgetForm({...budgetForm, zipCode: e.target.value.replace(/\D/g, '')}); if(fieldErrors.zipCode) setFieldErrors({...fieldErrors, zipCode: ''}); }} />
                  </div>
                  <div className="col-span-4">
                    <input type="text" disabled={isReadOnly} className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-xs font-semibold outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${fieldErrors.street ? 'border-red-300 bg-red-50' : 'border-transparent focus:bg-white focus:border-orange-500'}`} placeholder="Rua / Av *" value={budgetForm.street} onChange={(e) => { setBudgetForm({...budgetForm, street: e.target.value}); if(fieldErrors.street) setFieldErrors({...fieldErrors, street: ''}); }} />
                  </div>
                  <div className="col-span-1">
                    <input type="text" disabled={isReadOnly} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-xs font-semibold outline-none text-gray-800 focus:bg-white focus:border-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" placeholder="Nº" value={budgetForm.number} onChange={(e) => setBudgetForm({...budgetForm, number: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <input type="text" disabled={isReadOnly} className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-xs font-semibold outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${fieldErrors.neighborhood ? 'border-red-300 bg-red-50' : 'border-transparent focus:bg-white focus:border-orange-500'}`} placeholder="Bairro *" value={budgetForm.neighborhood} onChange={(e) => { setBudgetForm({...budgetForm, neighborhood: e.target.value}); if(fieldErrors.neighborhood) setFieldErrors({...fieldErrors, neighborhood: ''}); }} />
                  </div>
                  <div className="col-span-2">
                    <input type="text" disabled={isReadOnly} className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-xs font-semibold outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${fieldErrors.city ? 'border-red-300 bg-red-50' : 'border-transparent focus:bg-white focus:border-orange-500'}`} placeholder="Cidade *" value={budgetForm.city} onChange={(e) => { setBudgetForm({...budgetForm, city: e.target.value}); if(fieldErrors.city) setFieldErrors({...fieldErrors, city: ''}); }} />
                  </div>
                  <div className="col-span-1">
                    <input type="text" maxLength={2} disabled={isReadOnly} className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-xs font-semibold uppercase outline-none text-gray-800 text-center disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${fieldErrors.stateAbbreviation ? 'border-red-300 bg-red-50' : 'border-transparent focus:bg-white focus:border-orange-500'}`} placeholder="UF *" value={budgetForm.stateAbbreviation} onChange={(e) => { setBudgetForm({...budgetForm, stateAbbreviation: e.target.value}); if(fieldErrors.stateAbbreviation) setFieldErrors({...fieldErrors, stateAbbreviation: ''}); }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Etapas */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-bold text-gray-800">Escopo e Etapas</h3>
              {!isReadOnly && (
                <button 
                  onClick={addStage}
                  className="bg-gray-900 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg cursor-pointer"
                >
                  <Plus size={16} /> Nova Etapa
                </button>
              )}
            </div>

            {budgetForm.stages.map((stage, sIdx) => (
              <section key={stage.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-orange-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-orange-600/20 shrink-0">
                      {sIdx + 1}
                    </div>
                    <input 
                      type="text" 
                      disabled={isReadOnly}
                      placeholder="Nome da Etapa (Ex: Fundações, Pintura...)"
                      className="bg-transparent border-none outline-none font-bold text-gray-800 text-lg w-full placeholder:text-gray-300 disabled:text-gray-500"
                      value={stage.description}
                      onChange={(e) => {
                        const newStages = [...budgetForm.stages];
                        newStages[sIdx].description = e.target.value;
                        setBudgetForm({...budgetForm, stages: newStages});
                      }}
                    />
                  </div>
                  {!isReadOnly && (
                    <button onClick={() => removeStage(stage.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2 cursor-pointer">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="p-8 space-y-10">
                  {/* Materiais */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Truck size={14} className="text-orange-600" /> Materiais Necessários
                      </h4>
                      {!isReadOnly && (
                        <button onClick={() => addMaterial(stage.id)} className="text-[10px] font-bold text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer">
                          <Plus size={12} /> Adicionar Material
                        </button>
                      )}
                    </div>
                    
                    {stage.materials.length > 0 && (
                      <div className="hidden md:flex gap-3 px-4 mb-2 mt-4">
                        <div className="flex-[3] text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição do Material</div>
                        <div className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidade</div>
                        <div className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantidade</div>
                        <div className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">R$ Unitário</div>
                        <div className="w-20 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ações</div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {stage.materials.map((m, mIdx) => (
                        <div key={m.id} className="flex flex-col md:flex-row gap-3 items-center bg-gray-50/40 p-3 rounded-2xl border border-gray-50">
                          <input type="text" disabled={isReadOnly} placeholder="Material" className="flex-[3] bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium outline-none text-gray-800 focus:border-orange-500/50 disabled:bg-gray-100 disabled:text-gray-500" 
                            value={m.description} onChange={(e) => { const ns=[...budgetForm.stages]; ns[sIdx].materials[mIdx].description=e.target.value; setBudgetForm({...budgetForm, stages:ns}); }} />
                          <input type="text" disabled={isReadOnly} placeholder="Un" className="flex-1 w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500" 
                            value={m.unit} onChange={(e) => { const ns=[...budgetForm.stages]; ns[sIdx].materials[mIdx].unit=e.target.value; setBudgetForm({...budgetForm, stages:ns}); }} />
                          <input type="number" disabled={isReadOnly} placeholder="Qtd" className="flex-1 w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500" 
                            value={m.plannedQuantity || ''} onChange={(e) => { const ns=[...budgetForm.stages]; ns[sIdx].materials[mIdx].plannedQuantity=Number(e.target.value); setBudgetForm({...budgetForm, stages:ns}); }} />
                          <input type="number" disabled={isReadOnly} placeholder="R$ Un" className="flex-1 w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500" 
                            value={m.unitCost || ''} onChange={(e) => { const ns=[...budgetForm.stages]; ns[sIdx].materials[mIdx].unitCost=Number(e.target.value); setBudgetForm({...budgetForm, stages:ns}); }} />
                          <div className="flex items-center gap-4 px-2">
                             <label className={`flex items-center gap-2 ${isReadOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} whitespace-nowrap`}>
                                <input type="checkbox" disabled={isReadOnly} className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:cursor-not-allowed" 
                                  checked={m.isClientProvided} onChange={(e) => { const ns=[...budgetForm.stages]; ns[sIdx].materials[mIdx].isClientProvided=e.target.checked; setBudgetForm({...budgetForm, stages:ns}); }} />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Cliente</span>
                             </label>
                             {!isReadOnly && (
                               <button onClick={() => { const ns=[...budgetForm.stages]; ns[sIdx].materials.splice(mIdx,1); setBudgetForm({...budgetForm, stages:ns}); }} className="text-gray-300 hover:text-red-400 cursor-pointer"><Trash2 size={16} /></button>
                             )}
                          </div>
                        </div>
                      ))}
                      {stage.materials.length === 0 && <div className="text-center py-6 border-2 border-dashed border-gray-50 rounded-2xl text-gray-300 text-xs italic">Nenhum material listado para esta etapa</div>}
                    </div>
                  </div>

                  {/* Mão de Obra */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Hammer size={14} className="text-orange-600" /> Equipe Técnica
                      </h4>
                      {!isReadOnly && (
                        <button onClick={() => addLabor(stage.id)} className="text-[10px] font-bold text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer">
                          <Plus size={12} /> Adicionar Mão de Obra
                        </button>
                      )}
                    </div>

                    {stage.labors.length > 0 && (
                      <div className="hidden md:flex gap-3 px-4 mb-2 mt-4">
                        <div className="flex-[2] text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Cargo / Função</div>
                        <div className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Horas Previstas</div>
                        <div className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">R$ por Hora</div>
                        <div className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Encargos (%)</div>
                        <div className="w-32 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ações</div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {stage.labors.map((l, lIdx) => (
                        <div key={l.id} className="flex flex-col md:flex-row gap-3 items-center bg-orange-50/20 p-3 rounded-2xl border border-orange-50/50">
                          <input type="number" disabled={isReadOnly} placeholder="ID Cargo" className="flex-[2] w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500" 
                            value={l.roleId || ''} onChange={(e) => { const ns=[...budgetForm.stages]; ns[sIdx].labors[lIdx].roleId=Number(e.target.value); setBudgetForm({...budgetForm, stages:ns}); }} />
                          <input type="number" disabled={isReadOnly} placeholder="Hrs" className="flex-1 w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500" 
                            value={l.plannedHours || ''} onChange={(e) => { const ns=[...budgetForm.stages]; ns[sIdx].labors[lIdx].plannedHours=Number(e.target.value); setBudgetForm({...budgetForm, stages:ns}); }} />
                          <input type="number" disabled={isReadOnly} placeholder="R$ Hora" className="flex-1 w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500" 
                            value={l.hourlyRate || ''} onChange={(e) => { const ns=[...budgetForm.stages]; ns[sIdx].labors[lIdx].hourlyRate=Number(e.target.value); setBudgetForm({...budgetForm, stages:ns}); }} />
                          <input type="number" disabled={isReadOnly} placeholder="Enc. %" className="flex-1 w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-medium outline-none text-gray-800 disabled:bg-gray-100 disabled:text-gray-500" 
                            value={l.socialCharges || ''} onChange={(e) => { const ns=[...budgetForm.stages]; ns[sIdx].labors[lIdx].socialCharges=Number(e.target.value); setBudgetForm({...budgetForm, stages:ns}); }} />
                          <div className="flex items-center gap-4 px-2 w-32 justify-between">
                             <div className="text-[10px] font-bold text-orange-600 whitespace-nowrap">R$ {((Number(l.plannedHours) * Number(l.hourlyRate)) * (1 + Number(l.socialCharges)/100)).toFixed(2)}</div>
                             {!isReadOnly && (
                               <button onClick={() => { const ns=[...budgetForm.stages]; ns[sIdx].labors.splice(lIdx,1); setBudgetForm({...budgetForm, stages:ns}); }} className="text-gray-300 hover:text-red-400 cursor-pointer"><Trash2 size={16} /></button>
                             )}
                          </div>
                        </div>
                      ))}
                      {stage.labors.length === 0 && <div className="text-center py-6 border-2 border-dashed border-gray-50 rounded-2xl text-gray-300 text-xs italic">Nenhuma mão de obra definida para esta etapa</div>}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Consolidado Lateral Fixo */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600 text-white flex items-center justify-center -mr-12 -mt-12 rounded-full font-black opacity-10"> $ </div>
              
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Consolidado Financeiro</h3>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-orange-600 transition-colors">
                      <Truck size={14} />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Materiais</span>
                  </div>
                  <span className="font-bold text-gray-800">R$ {budgetForm.totalMaterialsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center group">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-orange-600 transition-colors">
                      <Hammer size={14} />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Equipe</span>
                  </div>
                  <span className="font-bold text-gray-800">R$ {budgetForm.totalStepsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="pt-6 border-t border-dashed border-gray-100">
                  <span className="block text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Total do Orçamento</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-gray-400">R$</span>
                    <span className="text-4xl font-black text-gray-900 tracking-tight">
                      {budgetForm.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 p-4 rounded-2xl flex items-start gap-3">
                 <Info size={16} className="text-orange-600 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Os cálculos são automáticos. Valores de mão de obra incluem encargos sociais definidos por etapa.</p>
              </div>
            </div>

            {/* Ações Visíveis Apenas Após Orçamento Criado */}
            {budgetForm.id && (
              <div className="space-y-3">
                <button className="w-full bg-gray-900 text-white p-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3 hover:bg-black transition-all cursor-pointer">
                  <Download size={18} /> Baixar PDF
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button className="w-full bg-green-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 hover:bg-green-700 transition-all cursor-pointer text-xs">
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                  <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all cursor-pointer text-xs">
                    <Send size={16} /> Reenviar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modais de Seleção */}
      {isClientModalOpen && (
        <SelectionModal 
          title="Selecionar Cliente" data={clients} 
          onSelect={(c: any) => { 
            setSelectedClient(c); 
            setBudgetForm({...budgetForm, clientId: c.id || c.clientId}); 
            if(fieldErrors.client) setFieldErrors({...fieldErrors, client: ''});
            setIsClientModalOpen(false); 
          }} 
          onClose={() => setIsClientModalOpen(false)} 
        />
      )}
      {isUserModalOpen && (
        <SelectionModal 
          title="Selecionar Responsável" data={employees} 
          nameKey="employeeName"
          onSelect={(e: any) => { 
            setSelectedUser(e); 
            setBudgetForm({...budgetForm, userId: e.id || e.employeeId}); 
            if(fieldErrors.user) setFieldErrors({...fieldErrors, user: ''});
            setIsUserModalOpen(false); 
          }} 
          onClose={() => setIsUserModalOpen(false)} 
        />
      )}
    </div>
  );
}

// Componente Interno de Modal
function SelectionModal({ title, data, onSelect, onClose, nameKey = 'fantasyName' }: any) {
  const [q, setQ] = useState('');
  const filtered = data.filter((d: any) => (d[nameKey] || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <div className="flex justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <X className="cursor-pointer" onClick={onClose} />
          </div>
          <input 
            autoFocus placeholder="Pesquisar..." className="w-full px-5 py-3 bg-gray-50 rounded-2xl outline-none"
            value={q} onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
          {filtered.map((item: any) => (
            <div key={item.id || item.clientId || item.employeeId} onClick={() => onSelect(item)} className="p-4 hover:bg-orange-50 rounded-2xl cursor-pointer flex items-center gap-4 transition-all">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><UserCircle size={20} /></div>
              <div>
                <p className="font-bold text-gray-800">{item[nameKey]}</p>
                <p className="text-xs text-gray-400">{item.email || item.registrationNumber}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center py-4 text-gray-400">Nenhum resultado.</p>}
        </div>
      </div>
    </div>
  );
}