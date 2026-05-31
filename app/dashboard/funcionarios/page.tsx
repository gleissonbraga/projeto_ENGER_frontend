'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, CheckCircle2, ChevronRight, Save, User, Briefcase, 
  Mail, Phone, Smartphone, Plus, Trash2, Search, X, Loader2,
  AlertTriangle, CheckCircle, ToggleLeft, ShieldAlert
} from 'lucide-react';
import api from '@/services/api';

// ========================================================
// 📊 INTERFACES RIGOROSAS PARA O TYPESCRIPT E DTOs
// ========================================================
interface Position {
  id?: number;
  positionId?: number;
  descriptionPosition?: string;
  desc?: string;
}

interface Employee {
  id?: number;
  employeeId?: number;
  employeeName: string;
  registrationNumber: string;
  numberGeneralRegistration: string;
  email: string;
  positionId: number;
  admissionDate: string;
  dateOfBirth: string;
  phoneNumber: string;
  cellNumber: string;
  status: number;
}

interface EmployeeFormState {
  employeeName: string;
  registrationNumber: string;
  numberGeneralRegistration: string;
  dateOfBirth: string;
  admissionDate: string;
  phoneNumber: string;
  cellNumber: string;
  email: string;
  positionId: number | null;
  status: number;
}

export default function FuncionariosPage() {
  const [employeeView, setEmployeeView] = useState<'list' | 'create'>('list');
  const [isPositionModalOpen, setIsPositionModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);

  // Estados de Validação e Feedback Visual
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [employeeForm, setEmployeeForm] = useState<EmployeeFormState>({
    employeeName: '',
    registrationNumber: '',
    numberGeneralRegistration: '',
    dateOfBirth: '',
    admissionDate: '',
    phoneNumber: '',
    cellNumber: '',
    email: '',
    positionId: null,
    status: 1 // 1 = Ativo
  });

  // 1. Resgata o Company ID e carrega as listas ao montar a tela
  useEffect(() => {
    const sessionData = sessionStorage.getItem('enger_user');
    if (sessionData) {
      const parsedData = JSON.parse(sessionData);
      setCompanyId(parsedData.companyId);
      fetchEmployees(parsedData.companyId);
      fetchPositions(parsedData.companyId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchEmployees = async (compId: number) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/funcionarios/${compId}`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPositions = async (compId: number) => {
    try {
      const response = await api.get(`/cargos/${compId}`);
      setPositions(response.data);
    } catch (error) {
      console.error("Erro ao buscar cargos para o modal:", error);
    }
  };

  // 2. Validação Frontend
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!employeeForm.employeeName.trim()) errors.employeename = "O nome é obrigatório.";
    if (!employeeForm.registrationNumber) errors.registrationnumber = "CPF é obrigatório.";
    else if (employeeForm.registrationNumber.length !== 11) errors.registrationnumber = "O CPF deve ter 11 dígitos.";

    if (!employeeForm.numberGeneralRegistration) errors.numbergeneralregistration = "RG é obrigatório.";
    if (!employeeForm.dateOfBirth) errors.dateofbirth = "Data de nascimento é obrigatória.";
    if (!employeeForm.admissionDate) errors.admissiondate = "Data de admissão é obrigatória.";
    
    if (!employeeForm.email.trim()) errors.email = "E-mail é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeForm.email)) errors.email = "Formato de e-mail inválido.";

    if (!employeeForm.phoneNumber) errors.phonenumber = "Telefone fixo é obrigatório.";
    if (!employeeForm.cellNumber) errors.cellnumber = "Celular é obrigatório.";
    
    if (!employeeForm.positionId) errors.positionid = "Selecione um cargo para o funcionário.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 3. Salvar / Atualizar
  const handleSaveEmployee = async () => {
    setFeedbackMsg(null);
    if (!companyId) return setFeedbackMsg({ type: 'error', text: "Erro interno: ID da empresa não encontrado." });

    if (!validateForm()) {
      setFeedbackMsg({ type: 'error', text: "Verifique os campos destacados em vermelho." });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingEmployeeId) {
        console.log(employeeForm)
        await api.put(`/funcionarios/${companyId}/${editingEmployeeId}`, employeeForm);
        setFeedbackMsg({ type: 'success', text: "Funcionário atualizado com sucesso!" });
      } else {
         console.log(employeeForm)
        await api.post(`/funcionarios/${companyId}`, employeeForm);
        setFeedbackMsg({ type: 'success', text: "Novo funcionário criado com sucesso!" });
      }

      resetForm();
      fetchEmployees(companyId);
      
      setTimeout(() => {
        setEmployeeView('list');
        setFeedbackMsg(null);
      }, 2000);

    } catch (error: any) {
      const apiErrors = error.response?.data?.errors;
      
      // Captura erros do C# e mapeia para os campos
      if (apiErrors && Array.isArray(apiErrors)) {
        const backendErrors: Record<string, string> = {};
        apiErrors.forEach((err: any) => {
          const fieldName = (err.field || err.Field || '').toLowerCase();
          backendErrors[fieldName] = err.message || err.Message;
        });
        setFieldErrors(backendErrors);
        setFeedbackMsg({ type: 'error', text: "Ocorreram erros de validação. Verifique os campos." });
      } else {
        setFeedbackMsg({ type: 'error', text: error.response?.data?.message || "Erro ao salvar funcionário." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Prepara edição
  const handleEditClick = (emp: Employee) => {
    setFieldErrors({});
    setFeedbackMsg(null);

    // Ajusta a data do banco (ISO) para yyyy-MM-dd que o input type="date" espera
    const formatInputDate = (dateStr?: string) => dateStr ? dateStr.split('T')[0] : '';

    // Encontra o cargo vinculado para preencher o modal/state
    const foundPosition = positions.find(p => (p.id || p.positionId) === emp.positionId);
    if (foundPosition) setSelectedPosition(foundPosition);

    setEmployeeForm({
      employeeName: emp.employeeName,
      registrationNumber: emp.registrationNumber,
      numberGeneralRegistration: emp.numberGeneralRegistration,
      dateOfBirth: formatInputDate(emp.dateOfBirth),
      admissionDate: formatInputDate(emp.admissionDate),
      phoneNumber: emp.phoneNumber,
      cellNumber: emp.cellNumber,
      email: emp.email,
      positionId: emp.positionId,
      status: emp.status ?? 1
    });

    setEditingEmployeeId(emp.id || emp.employeeId || null);
    setEmployeeView('create');
  };

  const resetForm = () => {
    setEmployeeForm({
      employeeName: '', registrationNumber: '', numberGeneralRegistration: '',
      dateOfBirth: '', admissionDate: '', phoneNumber: '', cellNumber: '',
      email: '', positionId: null, status: 1
    });
    setSelectedPosition(null);
    setEditingEmployeeId(null);
    setFieldErrors({});
    setFeedbackMsg(null);
  };

  // Helper para buscar nome do cargo na tabela
  const getPositionName = (posId: number) => {
    const pos = positions.find(p => (p.id || p.positionId) === posId);
    return pos ? (pos.descriptionPosition || pos.desc) : 'Cargo não definido';
  };

  // ========================================================
  // RENDERIZAÇÃO: MODAL DE CARGOS
  // ========================================================
  const renderPositionModal = () => {
    if (!isPositionModalOpen) return null;
    
    const filtered = positions.filter(item => 
      (item.descriptionPosition || item.desc || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsPositionModalOpen(false)}></div>
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Selecionar Cargo</h3>
              <button onClick={() => setIsPositionModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar cargo..." 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 outline-none text-gray-800 text-sm font-medium"
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
            {filtered.map(item => (
              <button 
                key={item.id || item.positionId} 
                onClick={() => { 
                  setSelectedPosition(item); 
                  setEmployeeForm({...employeeForm, positionId: item.id || item.positionId || null});
                  setIsPositionModalOpen(false); 
                  setSearchQuery(''); 
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-orange-50 rounded-2xl transition-all group text-left border border-transparent hover:border-orange-100 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Briefcase size={18} />
                  </div>
                  <p className="font-bold text-gray-800">{item.descriptionPosition || item.desc}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-600" />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center py-8 text-sm text-gray-400">Nenhum cargo encontrado.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========================================================
  // RENDERIZAÇÃO: LISTA DE FUNCIONÁRIOS
  // ========================================================
  if (employeeView === 'list') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Equipe e Funcionários</h2>
            <p className="text-gray-500 mt-1">Gerencie os profissionais vinculados à sua empresa.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setEmployeeView('create'); }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus size={18} /> Novo Funcionário
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 size={32} className="animate-spin text-orange-500 mb-4" />
              <p className="font-medium text-sm">Carregando quadro de funcionários...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 text-gray-400">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Nome</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Cargo</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Admissão</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employees.map((emp) => (
                    <tr key={emp.id || emp.employeeId} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold">
                            {emp.employeeName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-none">{emp.employeeName}</p>
                            <p className="text-xs text-gray-400 mt-1">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {getPositionName(emp.positionId)}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs text-gray-500 font-medium">
                        {new Date(emp.admissionDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-1 rounded-md ${emp.status === 1 ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                          <CheckCircle2 size={10} /> {emp.status === 1 ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleEditClick(emp)}
                          className="p-2 text-gray-300 hover:text-orange-600 hover:bg-white rounded-xl transition-all cursor-pointer"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">Nenhum funcionário encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDERIZAÇÃO: FORMULÁRIO CREATE/EDIT
  // ========================================================
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* 🚀 BANNER DE FEEDBACK VISUAL NO TOPO */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-sm ${feedbackMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100 animate-[shake_0.4s_ease-in-out]'}`}>
          {feedbackMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {feedbackMsg.text}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <button onClick={() => { setEmployeeView('list'); resetForm(); }} className="flex items-center gap-2 text-gray-400 hover:text-gray-800 font-bold text-sm transition-colors group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <ChevronRight size={16} className="rotate-180" />
          </div> 
          Voltar para Lista
        </button>
        <button 
          onClick={handleSaveEmployee}
          disabled={isSubmitting}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-orange-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:bg-gray-300"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {editingEmployeeId ? 'Salvar Alterações' : 'Salvar Funcionário'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Dados Pessoais */}
        <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="mb-10 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <User size={24} className="text-orange-600" /> Informações Pessoais
              </h3>
              <p className="text-gray-400 text-sm mt-1">Dados de identificação civil e nascimento.</p>
            </div>

            {editingEmployeeId && (
              <div className="flex flex-col items-end">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                <button 
                  onClick={() => setEmployeeForm({...employeeForm, status: employeeForm.status === 1 ? 0 : 1})}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-colors ${employeeForm.status === 1 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  <ToggleLeft size={16} className={employeeForm.status === 1 ? 'rotate-180 text-green-600' : ''} /> 
                  {employeeForm.status === 1 ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2 group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome Completo *</label>
              <input 
                type="text" maxLength={100} placeholder="Ex: João da Silva Ferreira"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.employeename ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={employeeForm.employeeName} 
                onChange={(e) => {
                  setEmployeeForm({...employeeForm, employeeName: e.target.value});
                  if (fieldErrors.employeename) setFieldErrors({...fieldErrors, employeename: ''});
                }}
              />
              {fieldErrors.employeename && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.employeename}</p>}
            </div>
            
            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">CPF *</label>
              <input 
                type="text" maxLength={11} placeholder="Apenas números"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-mono text-gray-800 ${fieldErrors.registrationnumber ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={employeeForm.registrationNumber} 
                onChange={(e) => {
                  setEmployeeForm({...employeeForm, registrationNumber: e.target.value.replace(/\D/g, '')});
                  if (fieldErrors.registrationnumber) setFieldErrors({...fieldErrors, registrationnumber: ''});
                }}
              />
              {fieldErrors.registrationnumber && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.registrationnumber}</p>}
            </div>
            
            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">RG (Registro Geral) *</label>
              <input 
                type="text" maxLength={11} placeholder="Apenas números"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-mono text-gray-800 ${fieldErrors.numbergeneralregistration ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={employeeForm.numberGeneralRegistration} 
                onChange={(e) => {
                  setEmployeeForm({...employeeForm, numberGeneralRegistration: e.target.value.replace(/\D/g, '')});
                  if (fieldErrors.numbergeneralregistration) setFieldErrors({...fieldErrors, numbergeneralregistration: ''});
                }}
              />
              {fieldErrors.numbergeneralregistration && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.numbergeneralregistration}</p>}
            </div>
            
            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Data de Nascimento *</label>
              <input 
                type="date"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.dateofbirth ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={employeeForm.dateOfBirth} 
                onChange={(e) => {
                  setEmployeeForm({...employeeForm, dateOfBirth: e.target.value});
                  if (fieldErrors.dateofbirth) setFieldErrors({...fieldErrors, dateofbirth: ''});
                }}
              />
              {fieldErrors.dateofbirth && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.dateofbirth}</p>}
            </div>
          </div>
        </section>

        {/* Vínculo e Contato */}
        <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <Briefcase size={24} className="text-orange-600" /> Vínculo e Contato
            </h3>
            <p className="text-gray-400 text-sm mt-1">Informações profissionais e meios de comunicação.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Cargo / Função *</label>
              {!selectedPosition ? (
                <button 
                  type="button" 
                  onClick={() => setIsPositionModalOpen(true)} 
                  className={`w-full px-6 py-4 bg-gray-50 border border-dashed rounded-2xl flex items-center justify-between transition-all group cursor-pointer ${fieldErrors.positionid ? 'border-red-300 bg-red-50/30 text-red-500' : 'border-gray-200 text-gray-400 hover:border-orange-500 hover:text-orange-600'}`}
                >
                  <span className="text-sm font-semibold">Selecionar Cargo</span>
                  <Plus size={18} />
                </button>
              ) : (
                <div className="px-6 py-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-600">{selectedPosition.descriptionPosition || selectedPosition.desc}</span>
                  <button type="button" onClick={() => { setSelectedPosition(null); setEmployeeForm({...employeeForm, positionId: null}) }} className="text-orange-400 hover:text-orange-600 cursor-pointer"><Trash2 size={16} /></button>
                </div>
              )}
              {fieldErrors.positionid && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.positionid}</p>}
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Data de Admissão *</label>
              <input 
                type="date"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.admissiondate ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={employeeForm.admissionDate} 
                onChange={(e) => {
                  setEmployeeForm({...employeeForm, admissionDate: e.target.value});
                  if (fieldErrors.admissiondate) setFieldErrors({...fieldErrors, admissiondate: ''});
                }}
              />
              {fieldErrors.admissiondate && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.admissiondate}</p>}
            </div>

            <div className="md:col-span-2 group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">E-mail Profissional *</label>
              <div className="relative">
                <Mail className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`} size={18} />
                <input 
                  type="email" maxLength={100} placeholder="funcionario@enger.com"
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.email ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                  value={employeeForm.email} 
                  onChange={(e) => {
                    setEmployeeForm({...employeeForm, email: e.target.value});
                    if (fieldErrors.email) setFieldErrors({...fieldErrors, email: ''});
                  }}
                />
              </div>
              {fieldErrors.email && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.email}</p>}
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Telefone Fixo *</label>
              <div className="relative">
                <Phone className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.phonenumber ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`} size={18} />
                <input 
                  type="text" maxLength={11} placeholder="Apenas números (DDD+Número)"
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-mono text-gray-800 ${fieldErrors.phonenumber ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                  value={employeeForm.phoneNumber} 
                  onChange={(e) => {
                    setEmployeeForm({...employeeForm, phoneNumber: e.target.value.replace(/\D/g, '')});
                    if (fieldErrors.phonenumber) setFieldErrors({...fieldErrors, phonenumber: ''});
                  }}
                />
              </div>
              {fieldErrors.phonenumber && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.phonenumber}</p>}
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Celular / WhatsApp *</label>
              <div className="relative">
                <Smartphone className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.cellnumber ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`} size={18} />
                <input 
                  type="text" maxLength={11} placeholder="Apenas números (DDD+Número)"
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-mono text-gray-800 ${fieldErrors.cellnumber ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                  value={employeeForm.cellNumber} 
                  onChange={(e) => {
                    setEmployeeForm({...employeeForm, cellNumber: e.target.value.replace(/\D/g, '')});
                    if (fieldErrors.cellnumber) setFieldErrors({...fieldErrors, cellnumber: ''});
                  }}
                />
              </div>
              {fieldErrors.cellnumber && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.cellnumber}</p>}
            </div>
          </div>
        </section>
      </div>
      {renderPositionModal()}
    </div>
  );
}