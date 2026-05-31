'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, ShieldCheck, CheckCircle2, ChevronRight, X, 
  UserCog, User, Mail, Lock, EyeOff, Eye, BadgeCheck, 
  ChevronDown, ShieldAlert, Save, Edit2, Loader2, ToggleLeft,
  AlertTriangle, CheckCircle
} from 'lucide-react';
import api from '@/services/api';

// ========================================================
// 📊 INTERFACES E DTOs
// ========================================================
interface SystemUser {
  id: number;
  username: string;
  email: string;
  admin: number;
  status: number; 
  entryDate?: string;
}

interface UserFormState {
  username: string;
  email: string;
  password: string;
  admin: number;
  status: number;
}

export default function UsuariosPage() {
  const [userView, setUserView] = useState<'list' | 'create'>('list');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Estados de Validação e Feedback Visual
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [userForm, setUserForm] = useState<UserFormState>({
    username: '',
    email: '',
    password: '',
    admin: 0,
    status: 1 
  });

  useEffect(() => {
    const sessionData = sessionStorage.getItem('enger_user');
    if (sessionData) {
      const parsedData = JSON.parse(sessionData);
      setCompanyId(parsedData.companyId);
      fetchUsers(parsedData.companyId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUsers = async (compId: number) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/usuarios/${compId}`);
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🧠 VALIDAÇÃO FRONTEND (Evita chamadas desnecessárias à API)
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!userForm.username.trim()) errors.username = "O nome de usuário é obrigatório.";
    else if (userForm.username.length > 50) errors.username = "O nome não pode exceder 50 caracteres.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userForm.email.trim()) errors.email = "O e-mail é obrigatório.";
    else if (!emailRegex.test(userForm.email)) errors.email = "Insira um formato de e-mail válido.";

    // O C# exige a senha tanto no Create quanto no Update
    if (!userForm.password) errors.password = "A senha é obrigatória.";
    else if (userForm.password.length > 60) errors.password = "A senha não pode exceder 60 caracteres.";

    if (userForm.admin === 0 || userForm.admin > 7) errors.admin = "Selecione um nível de acesso válido.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async () => {
    setFeedbackMsg(null);
    
    if (!companyId) {
      setFeedbackMsg({ type: 'error', text: "Erro interno: Identificador da empresa não encontrado." });
      return;
    }

    if (!validateForm()) {
      setFeedbackMsg({ type: 'error', text: "Verifique os campos destacados em vermelho." });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingUserId) {
        await api.put(`/usuarios/atualizar/${editingUserId}/${companyId}`, userForm);
        setFeedbackMsg({ type: 'success', text: "Usuário atualizado com sucesso!" });
      } else {
        await api.post(`/usuarios/cadastro/${companyId}`, userForm);
        setFeedbackMsg({ type: 'success', text: "Novo usuário criado com sucesso!" });
      }

      resetForm();
      fetchUsers(companyId);
      
      // Retorna para a lista após 2 segundos para o usuário ver o sucesso
      setTimeout(() => {
        setUserView('list');
        setFeedbackMsg(null);
      }, 2000);

    } catch (error: any) {
      const apiErrors = error.response?.data?.errors;
      
      // 🧠 CAPTURA DE ERROS DO C# (ex: Email já cadastrado)
      if (apiErrors && Array.isArray(apiErrors)) {
        const backendErrors: Record<string, string> = {};
        apiErrors.forEach((err: any) => {
          // O C# retorna field e message
          const fieldName = (err.field || err.Field || '').toLowerCase();
          backendErrors[fieldName] = err.message || err.Message;
        });
        setFieldErrors(backendErrors);
        setFeedbackMsg({ type: 'error', text: "Ocorreram erros de validação. Verifique os campos." });
      } else {
        setFeedbackMsg({ type: 'error', text: error.response?.data?.message || "Ocorreu um erro inesperado ao salvar o usuário." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user: SystemUser) => {
    setFieldErrors({});
    setFeedbackMsg(null);
    setUserForm({
      username: user.username,
      email: user.email,
      password: '', // Força o usuário a redigitar a senha no update, conforme regra do seu C#
      admin: user.admin,
      status: user.status ?? 1
    });
    setEditingUserId(user.id);
    setUserView('create');
  };

  const resetForm = () => {
    setUserForm({ username: '', email: '', password: '', admin: 0, status: 1 });
    setEditingUserId(null);
    setFieldErrors({});
    setFeedbackMsg(null);
  };

  // ========================================================
  // RENDERIZAÇÃO: LISTA DE USUÁRIOS
  // ========================================================
  if (userView === 'list') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Usuários do Sistema</h2>
            <p className="text-gray-500 mt-1">Gerencie quem tem acesso ao painel administrativo da empresa.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setUserView('create'); }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <UserPlus size={18} /> Novo Usuário
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 size={32} className="animate-spin text-orange-500 mb-4" />
              <p className="font-medium text-sm">Carregando usuários da organização...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 text-gray-400">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Usuário</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">E-mail</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Nível de Acesso</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center font-bold group-hover:bg-orange-600 group-hover:text-white transition-all">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-bold text-gray-800">{user.username}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-500">{user.email}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full w-fit">
                          <ShieldCheck size={14} />
                          {user.admin === 1 ? 'Master' : user.admin === 2 ? 'Gerente' : user.admin === 3 ? 'Financeiro' : 'Operador'}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-1 rounded-md ${user.status === 1 ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                          <CheckCircle2 size={10} /> {user.status === 1 ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-gray-300 hover:text-orange-600 hover:bg-white rounded-xl transition-all"
                          title="Editar Usuário"
                        >
                          <Edit2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">Nenhum usuário encontrado.</td>
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
        <button onClick={() => { setUserView('list'); resetForm(); }} className="flex items-center gap-2 text-gray-400 hover:text-gray-800 font-bold text-sm transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <ChevronRight size={16} className="rotate-180" />
          </div> 
          Voltar para Lista
        </button>
        <button 
          onClick={handleSaveUser}
          disabled={isSubmitting}
          className="bg-orange-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-orange-600/20 flex items-center gap-2 hover:bg-orange-700 transition-all disabled:bg-gray-300"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {editingUserId ? 'Salvar Alterações' : 'Criar Usuário'}
        </button>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <UserCog size={24} className="text-orange-600" /> Credenciais de Acesso
            </h3>
            <p className="text-gray-500 text-sm mt-1">Defina o nome de exibição, e-mail e permissões do membro.</p>
          </div>
          
          <div className="flex flex-col items-end">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status da Conta</label>
            <button 
              onClick={() => setUserForm({...userForm, status: userForm.status === 1 ? 0 : 1})}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-colors ${userForm.status === 1 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            >
              <ToggleLeft size={16} className={userForm.status === 1 ? 'rotate-180 text-green-600' : ''} /> 
              {userForm.status === 1 ? 'Conta Ativa' : 'Conta Inativa'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome de Usuário *</label>
            <div className="relative">
              <User className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.username ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`} size={18} />
              <input 
                type="text" maxLength={50} placeholder="Ex: Ricardo Lima"
                className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.username ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={userForm.username} 
                onChange={(e) => {
                  setUserForm({...userForm, username: e.target.value});
                  if (fieldErrors.username) setFieldErrors({...fieldErrors, username: ''});
                }}
              />
            </div>
            {fieldErrors.username && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.username}</p>}
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">E-mail *</label>
            <div className="relative">
              <Mail className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`} size={18} />
              <input 
                type="email" placeholder="usuario@enger.com"
                className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.email ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={userForm.email} 
                onChange={(e) => {
                  setUserForm({...userForm, email: e.target.value});
                  if (fieldErrors.email) setFieldErrors({...fieldErrors, email: ''});
                }}
              />
            </div>
            {fieldErrors.email && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.email}</p>}
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Senha *</label>
            <div className="relative">
              <Lock className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`} size={18} />
              <input 
                type={showPassword ? "text" : "password"} maxLength={60} 
                placeholder="••••••••"
                className={`w-full pl-14 pr-14 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 ${fieldErrors.password ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={userForm.password} 
                onChange={(e) => {
                  setUserForm({...userForm, password: e.target.value});
                  if (fieldErrors.password) setFieldErrors({...fieldErrors, password: ''});
                }}
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.password}</p>}
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nível de Acesso *</label>
            <div className="relative">
              <BadgeCheck className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.admin ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`} size={18} />
              <select 
                className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all text-sm font-semibold text-gray-800 appearance-none ${fieldErrors.admin ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                value={userForm.admin} 
                onChange={(e) => {
                  setUserForm({...userForm, admin: parseInt(e.target.value, 10)});
                  if (fieldErrors.admin) setFieldErrors({...fieldErrors, admin: ''});
                }}
              >
                <option value={0}>Selecione um nível...</option>
                <option value={1}>1 - Master (Acesso Total)</option>
                <option value={2}>2 - Gerente de Obras</option>
                <option value={3}>3 - Operador Financeiro</option>
                <option value={4}>4 - Visualizador (Somente Leitura)</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
            </div>
            {fieldErrors.admin && <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.admin}</p>}
          </div>
        </div>

        <div className="mt-10 p-6 bg-orange-50 rounded-3xl border border-orange-100 flex items-start gap-4">
          <ShieldAlert className="text-orange-600 shrink-0" size={24} />
          <div>
            <h4 className="text-sm font-bold text-orange-900">Segurança de Dados</h4>
            <p className="text-xs text-orange-700/70 mt-1 leading-relaxed">
              As senhas são protegidas por criptografia BCrypt no servidor. Ao criar ou atualizar um usuário, certifique-se de que o nível de acesso corresponde às responsabilidades do colaborador na empresa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}