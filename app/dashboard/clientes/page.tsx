'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, ChevronRight, MapPin, Mail, Phone, Save, BadgeCheck, 
  Smartphone, Building2, Trash2, Edit2, Loader2, AlertTriangle, 
  CheckCircle, ToggleLeft, X
} from 'lucide-react';
import api from '@/services/api';

// ========================================================
// 📊 INTERFACES RIGOROSAS PARA O TYPESCRIPT E DTOs
// ========================================================
interface Client {
  id?: number;
  clientId?: number;
  reasonName: string;
  fantasyName: string;
  registrationNumber: string;
  rGIeNumber: string;
  email: string;
  street: string;
  number: string;
  city: string;
  neighborhood: string;
  zipCode: string;
  federativeUnit?: string; 
  federativeunit?: string; // Trata possíveis diferenças de case no JSON
  phoneNumber: string;
  cellNumber: string;
  status: number;
}

interface ClientFormState {
  reasonName: string;
  fantasyName: string;
  registrationNumber: string;
  rGIeNumber: string;
  email: string;
  street: string;
  number: string;
  city: string;
  neighborhood: string;
  zipCode: string;
  federativeunit: string;
  phoneNumber: string;
  cellNumber: string;
  status: number;
}

export default function ClientesPage() {
  const [clientView, setClientView] = useState<'list' | 'create'>('list');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);

  // Estados de Validação e Feedback Visual
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [clientForm, setClientForm] = useState<ClientFormState>({
    reasonName: '', fantasyName: '', registrationNumber: '', rGIeNumber: '',
    email: '', street: '', number: '', city: '', neighborhood: '',
    zipCode: '', federativeunit: '', phoneNumber: '', cellNumber: '', status: 1
  });

  // 1. Resgata o Company ID e carrega os clientes ao montar a tela
  useEffect(() => {
    const sessionData = sessionStorage.getItem('enger_user');
    if (sessionData) {
      const parsedData = JSON.parse(sessionData);
      setCompanyId(parsedData.companyId);
      fetchClients(parsedData.companyId);
    } else {
      setIsLoading(false);
    }
  }, []);

  // 2. Função GET: Buscar todos os clientes (GET api/cliente/{companyId})
  const fetchClients = async (compId: number) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/cliente/${compId}`);
      setClients(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Validação Frontend (Mapeia as regras do seu C# ExecuteAsync)
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!clientForm.reasonName.trim()) errors.reasonname = "A Razão Social é obrigatória.";
    else if (clientForm.reasonName.length > 100) errors.reasonname = "Máximo de 100 caracteres.";

    if (!clientForm.fantasyName.trim()) errors.fantasyname = "O Nome Fantasia é obrigatório.";
    
    if (!clientForm.registrationNumber) errors.registrationnumber = "CPF/CNPJ é obrigatório.";
    
    if (!clientForm.email.trim()) errors.email = "E-mail é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientForm.email)) errors.email = "Formato de e-mail inválido.";

    if (!clientForm.street.trim()) errors.street = "Rua/Logradouro é obrigatório.";
    if (!clientForm.number.trim()) errors.number = "Número é obrigatório.";
    if (!clientForm.city.trim()) errors.city = "Cidade é obrigatória.";
    if (!clientForm.neighborhood.trim()) errors.neighborhood = "Bairro é obrigatório.";
    
    if (!clientForm.zipCode) errors.zipcode = "CEP é obrigatório.";
    if (!clientForm.federativeunit) errors.federativeunit = "UF é obrigatório.";
    if (!clientForm.phoneNumber) errors.phonenumber = "Telefone Principal é obrigatório.";
    if (!clientForm.cellNumber) errors.cellnumber = "Celular/WhatsApp é obrigatório.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 4. Função POST/PUT: Salvar ou Atualizar Cliente
  const handleSaveClient = async () => {
    setFeedbackMsg(null);
    
    if (!companyId) return setFeedbackMsg({ type: 'error', text: "Erro interno: ID da empresa não encontrado." });

    if (!validateForm()) {
      setFeedbackMsg({ type: 'error', text: "Verifique os campos destacados em vermelho." });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingClientId) {
        // ATUALIZAR (PUT api/cliente/{companyId}/{clientId})
        await api.put(`/cliente/${companyId}/${editingClientId}`, clientForm);
        setFeedbackMsg({ type: 'success', text: "Cliente atualizado com sucesso!" });
      } else {
        // CRIAR (POST api/cliente/{companyId})
        await api.post(`/cliente/${companyId}`, clientForm);
        setFeedbackMsg({ type: 'success', text: "Novo cliente cadastrado com sucesso!" });
      }

      resetForm();
      fetchClients(companyId);
      
      setTimeout(() => {
        setClientView('list');
        setFeedbackMsg(null);
      }, 2000);

    } catch (error: any) {
      const apiErrors = error.response?.data?.errors;
      
      // Captura erros do C# (ex: Email já cadastrado, CNPJ em uso)
      if (apiErrors && Array.isArray(apiErrors)) {
        const backendErrors: Record<string, string> = {};
        apiErrors.forEach((err: any) => {
          const fieldName = (err.field || err.Field || '').toLowerCase();
          backendErrors[fieldName] = err.message || err.Message;
        });
        setFieldErrors(backendErrors);
        setFeedbackMsg({ type: 'error', text: "Ocorreram erros de validação. Verifique os campos." });
      } else {
        setFeedbackMsg({ type: 'error', text: error.response?.data?.message || "Ocorreu um erro inesperado ao salvar." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (client: Client) => {
    setFieldErrors({});
    setFeedbackMsg(null);
    
    setClientForm({
      reasonName: client.reasonName,
      fantasyName: client.fantasyName,
      registrationNumber: client.registrationNumber,
      rGIeNumber: client.rGIeNumber || '',
      email: client.email,
      street: client.street,
      number: client.number,
      city: client.city,
      neighborhood: client.neighborhood,
      zipCode: client.zipCode,
      federativeunit: client.federativeunit || client.federativeUnit || '',
      phoneNumber: client.phoneNumber,
      cellNumber: client.cellNumber,
      status: client.status ?? 1
    });
    
    setEditingClientId(client.id || client.clientId || null);
    setClientView('create');
  };

  const resetForm = () => {
    setClientForm({
      reasonName: '', fantasyName: '', registrationNumber: '', rGIeNumber: '',
      email: '', street: '', number: '', city: '', neighborhood: '',
      zipCode: '', federativeunit: '', phoneNumber: '', cellNumber: '', status: 1
    });
    setEditingClientId(null);
    setFieldErrors({});
    setFeedbackMsg(null);
  };

  // ========================================================
  // RENDERIZAÇÃO: LISTA DE CLIENTES
  // ========================================================
  if (clientView === 'list') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Gestão de Clientes</h2>
            <p className="text-gray-500 mt-1">Base de dados unificada de solicitantes e parceiros.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setClientView('create'); }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} /> Novo Cliente
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 size={32} className="animate-spin text-orange-500 mb-4" />
              <p className="font-medium text-sm">Carregando carteira de clientes...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 text-gray-400">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Cliente</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Documento</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Localização</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Contato</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clients.map((client) => (
                    <tr key={client.id || client.clientId} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold">
                            {client.fantasyName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-none">{client.fantasyName}</p>
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{client.reasonName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-mono text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                          {client.registrationNumber}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <MapPin size={14} className="text-orange-600" />
                          {client.city}, {client.federativeunit || client.federativeUnit}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 font-medium flex items-center gap-2">
                            <Mail size={12} className="text-gray-400" /> {client.email}
                          </p>
                          <p className="text-xs text-gray-600 font-medium flex items-center gap-2">
                            <Phone size={12} className="text-gray-400" /> {client.phoneNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleEditClick(client)}
                          className="p-2 text-gray-300 hover:text-orange-600 hover:bg-white rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          <Edit2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 font-medium italic">Nenhum cliente cadastrado.</td>
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
      
      {/* 🚀 BANNER DE FEEDBACK VISUAL */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-sm ${feedbackMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100 animate-[shake_0.4s_ease-in-out]'}`}>
          {feedbackMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {feedbackMsg.text}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <button onClick={() => { setClientView('list'); resetForm(); }} className="flex items-center gap-2 text-gray-400 hover:text-gray-800 font-bold text-sm transition-colors group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <ChevronRight size={16} className="rotate-180" />
          </div> 
          Voltar para Lista
        </button>
        <button 
          onClick={handleSaveClient}
          disabled={isSubmitting}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-orange-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:bg-gray-300"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {editingClientId ? 'Salvar Alterações' : 'Cadastrar Cliente'}
        </button>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="mb-10 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <BadgeCheck size={24} className="text-orange-600" /> Identificação e Dados Jurídicos
              </h3>
              <p className="text-gray-400 text-sm mt-1">Insira as informações oficiais da empresa ou pessoa física.</p>
            </div>
            {editingClientId && (
              <div className="flex flex-col items-end">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status do Cliente</label>
                <button 
                  onClick={() => setClientForm({...clientForm, status: clientForm.status === 1 ? 0 : 1})}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-colors ${clientForm.status === 1 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  <ToggleLeft size={16} className={clientForm.status === 1 ? 'rotate-180 text-green-600' : ''} /> 
                  {clientForm.status === 1 ? 'Cliente Ativo' : 'Cliente Inativo'}
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2 group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Razão Social *</label>
              <input 
                type="text" maxLength={100} placeholder="Ex: Engenharia Civil Silva LTDA"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.reasonname ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={clientForm.reasonName} 
                onChange={(e) => {
                  setClientForm({...clientForm, reasonName: e.target.value});
                  if (fieldErrors.reasonname) setFieldErrors({...fieldErrors, reasonname: ''});
                }}
              />
              {fieldErrors.reasonname && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.reasonname}</p>}
            </div>
            
            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome Fantasia *</label>
              <input 
                type="text" maxLength={100} placeholder="Ex: Silva Obras"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.fantasyname ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={clientForm.fantasyName} 
                onChange={(e) => {
                  setClientForm({...clientForm, fantasyName: e.target.value});
                  if (fieldErrors.fantasyname) setFieldErrors({...fieldErrors, fantasyname: ''});
                }}
              />
              {fieldErrors.fantasyname && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.fantasyname}</p>}
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">CPF / CNPJ *</label>
              <input 
                type="text" maxLength={14} placeholder="Apenas Números"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-mono text-gray-800 ${fieldErrors.registrationnumber ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={clientForm.registrationNumber} 
                onChange={(e) => {
                  setClientForm({...clientForm, registrationNumber: e.target.value.replace(/\D/g, '')});
                  if (fieldErrors.registrationnumber) setFieldErrors({...fieldErrors, registrationnumber: ''});
                }}
              />
              {fieldErrors.registrationnumber && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.registrationnumber}</p>}
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">RG / Insc. Estadual</label>
              <input 
                type="text" placeholder="Apenas Números"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.rgienumber ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={clientForm.rGIeNumber} 
                onChange={(e) => {
                  setClientForm({...clientForm, rGIeNumber: e.target.value.replace(/\D/g, '')});
                  if (fieldErrors.rgienumber) setFieldErrors({...fieldErrors, rgienumber: ''});
                }}
              />
              {fieldErrors.rgienumber && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.rgienumber}</p>}
            </div>

            <div className="md:col-span-2 group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">E-mail Principal *</label>
              <div className="relative">
                <Mail className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`} size={18} />
                <input 
                  type="email" placeholder="cliente@email.com"
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.email ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                  value={clientForm.email} 
                  onChange={(e) => {
                    setClientForm({...clientForm, email: e.target.value});
                    if (fieldErrors.email) setFieldErrors({...fieldErrors, email: ''});
                  }}
                />
              </div>
              {fieldErrors.email && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.email}</p>}
            </div>
          </div>
        </section>

        <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="mb-10">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <MapPin size={24} className="text-orange-600" /> Endereço e Contato
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-x-8 gap-y-6">
            <div className="md:col-span-2 group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">CEP *</label>
              <input 
                type="text" maxLength={8} placeholder="Apenas Números"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-mono text-gray-800 ${fieldErrors.zipcode ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={clientForm.zipCode} 
                onChange={(e) => {
                  setClientForm({...clientForm, zipCode: e.target.value.replace(/\D/g, '')});
                  if (fieldErrors.zipcode) setFieldErrors({...fieldErrors, zipcode: ''});
                }}
              />
              {fieldErrors.zipcode && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.zipcode}</p>}
            </div>

            <div className="md:col-span-3 group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Rua / Logradouro *</label>
              <input 
                type="text" maxLength={30} placeholder="Rua, Av..."
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.street ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={clientForm.street} 
                onChange={(e) => {
                  setClientForm({...clientForm, street: e.target.value});
                  if (fieldErrors.street) setFieldErrors({...fieldErrors, street: ''});
                }}
              />
              {fieldErrors.street && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.street}</p>}
            </div>

            <div className="md:col-span-1 group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nº *</label>
              <input 
                type="text" maxLength={6} placeholder="S/N"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.number ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={clientForm.number} 
                onChange={(e) => {
                  setClientForm({...clientForm, number: e.target.value});
                  if (fieldErrors.number) setFieldErrors({...fieldErrors, number: ''});
                }}
              />
            </div>

            <div className="md:col-span-2 group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Bairro *</label>
              <input 
                type="text" maxLength={16} placeholder="Ex: Centro"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.neighborhood ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={clientForm.neighborhood} 
                onChange={(e) => {
                  setClientForm({...clientForm, neighborhood: e.target.value});
                  if (fieldErrors.neighborhood) setFieldErrors({...fieldErrors, neighborhood: ''});
                }}
              />
              {fieldErrors.neighborhood && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.neighborhood}</p>}
            </div>

            <div className="md:col-span-3 group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Cidade *</label>
              <input 
                type="text" maxLength={40} placeholder="Nome da cidade"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.city ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={clientForm.city} 
                onChange={(e) => {
                  setClientForm({...clientForm, city: e.target.value});
                  if (fieldErrors.city) setFieldErrors({...fieldErrors, city: ''});
                }}
              />
              {fieldErrors.city && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.city}</p>}
            </div>

            <div className="md:col-span-1 group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">UF *</label>
              <input 
                type="text" maxLength={2} placeholder="SP"
                className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold uppercase text-center text-gray-800 ${fieldErrors.federativeunit ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={clientForm.federativeunit} 
                onChange={(e) => {
                  setClientForm({...clientForm, federativeunit: e.target.value});
                  if (fieldErrors.federativeunit) setFieldErrors({...fieldErrors, federativeunit: ''});
                }}
              />
            </div>

            <div className="md:col-span-3 group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Telefone Principal *</label>
              <div className="relative">
                <Phone className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.phonenumber ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`} size={18} />
                <input 
                  type="text" maxLength={13} placeholder="Apenas números (DDD+Número)"
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.phonenumber ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                  value={clientForm.phoneNumber} 
                  onChange={(e) => {
                    setClientForm({...clientForm, phoneNumber: e.target.value.replace(/\D/g, '')});
                    if (fieldErrors.phonenumber) setFieldErrors({...fieldErrors, phonenumber: ''});
                  }}
                />
              </div>
              {fieldErrors.phonenumber && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.phonenumber}</p>}
            </div>

            <div className="md:col-span-3 group">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Celular / WhatsApp *</label>
              <div className="relative">
                <Smartphone className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.cellnumber ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`} size={18} />
                <input 
                  type="text" maxLength={13} placeholder="Apenas números (DDD+Número)"
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.cellnumber ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                  value={clientForm.cellNumber} 
                  onChange={(e) => {
                    setClientForm({...clientForm, cellNumber: e.target.value.replace(/\D/g, '')});
                    if (fieldErrors.cellnumber) setFieldErrors({...fieldErrors, cellnumber: ''});
                  }}
                />
              </div>
              {fieldErrors.cellnumber && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.cellnumber}</p>}
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}