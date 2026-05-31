'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, ChevronRight, Plus, Save, MoreHorizontal, 
  Loader2, AlertTriangle, CheckCircle, Edit2 
} from 'lucide-react';
import api from '@/services/api';

// ========================================================
// 📊 INTERFACES RIGOROSAS PARA O TYPESCRIPT E DTOs
// ========================================================
interface Position {
  id?: number;
  positionId?: number;
  descriptionPosition?: string;
  desc?: string; // Fallback caso o backend retorne diferente
}

interface PositionFormState {
  descriptionPosition: string;
}

export default function CargosPage() {
  const [positionView, setPositionView] = useState<'list' | 'create'>('list');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [editingPositionId, setEditingPositionId] = useState<number | null>(null);

  // Estados de Validação e Feedback Visual
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [positionForm, setPositionForm] = useState<PositionFormState>({
    descriptionPosition: ''
  });

  // 1. Resgata o Company ID e carrega os cargos ao montar a tela
  useEffect(() => {
    const sessionData = sessionStorage.getItem('enger_user');
    if (sessionData) {
      const parsedData = JSON.parse(sessionData);
      setCompanyId(parsedData.companyId);
      fetchPositions(parsedData.companyId);
    } else {
      setIsLoading(false);
    }
  }, []);

  // 2. Função GET: Buscar todos os cargos (GET api/cargos/{companyId})
  const fetchPositions = async (compId: number) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/cargos/${compId}`);
      setPositions(response.data);
    } catch (error) {
      console.error("Erro ao buscar cargos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Validação Frontend
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!positionForm.descriptionPosition.trim()) {
      errors.descriptionposition = "A descrição do cargo é obrigatória.";
    } else if (positionForm.descriptionPosition.length > 50) {
      errors.descriptionposition = "A descrição não pode exceder 50 caracteres.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 4. Função POST/PUT: Salvar ou Atualizar
  const handleSavePosition = async () => {
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
      // Como o controller C# usa [FromQuery], enviamos o DTO como params. 
      // Se fosse [FromBody], enviaríamos diretamente o objeto no segundo parâmetro.
      const payload = { descriptionPosition: positionForm.descriptionPosition };

      if (editingPositionId) {
        // ATUALIZAR (PUT api/cargos/{companyId}/{positionId})
        await api.put(`/cargos/${companyId}/${editingPositionId}`, null, { params: payload });
        setFeedbackMsg({ type: 'success', text: "Cargo atualizado com sucesso!" });
      } else {
        // CRIAR (POST api/cargos/{companyId})
        await api.post(`/cargos/${companyId}`, null, { params: payload });
        setFeedbackMsg({ type: 'success', text: "Novo cargo criado com sucesso!" });
      }

      resetForm();
      fetchPositions(companyId);
      
      setTimeout(() => {
        setPositionView('list');
        setFeedbackMsg(null);
      }, 2000);

    } catch (error: any) {
      const apiErrors = error.response?.data?.errors;
      
      // 🧠 CAPTURA DE ERROS DO C#
      if (apiErrors && Array.isArray(apiErrors)) {
        const backendErrors: Record<string, string> = {};
        apiErrors.forEach((err: any) => {
          let fieldName = (err.field || err.Field || '').toLowerCase();
          
          // Trata o caso em que o C# retorna "username" na validação de MaxLength do Cargo
          if (fieldName === 'username') fieldName = 'descriptionposition';
          
          backendErrors[fieldName] = err.message || err.Message;
        });
        setFieldErrors(backendErrors);
        setFeedbackMsg({ type: 'error', text: "Ocorreram erros de validação. Verifique os campos." });
      } else {
        setFeedbackMsg({ type: 'error', text: error.response?.data?.message || "Ocorreu um erro inesperado ao salvar o cargo." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (pos: Position) => {
    setFieldErrors({});
    setFeedbackMsg(null);
    setPositionForm({
      descriptionPosition: pos.descriptionPosition || pos.desc || ''
    });
    setEditingPositionId(pos.id || pos.positionId || null);
    setPositionView('create');
  };

  const resetForm = () => {
    setPositionForm({ descriptionPosition: '' });
    setEditingPositionId(null);
    setFieldErrors({});
    setFeedbackMsg(null);
  };

  // ========================================================
  // RENDERIZAÇÃO: FORMULÁRIO CREATE/EDIT
  // ========================================================
  if (positionView === 'create') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* 🚀 BANNER DE FEEDBACK VISUAL NO TOPO */}
        {feedbackMsg && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-sm ${feedbackMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100 animate-[shake_0.4s_ease-in-out]'}`}>
            {feedbackMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            {feedbackMsg.text}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button 
            onClick={() => { setPositionView('list'); resetForm(); }} 
            className="text-gray-400 hover:text-gray-800 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ChevronRight size={16} className="rotate-180" /> Voltar para Lista
          </button>
          <button 
            onClick={handleSavePosition}
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-orange-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:bg-gray-300"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {editingPositionId ? 'Salvar Alterações' : 'Criar Cargo'}
          </button>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {editingPositionId ? 'Editar Cargo' : 'Cadastrar Novo Cargo'}
            </h3>
            <p className="text-gray-500 text-sm">Defina a descrição oficial da função para uso em contratos e orçamentos.</p>
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Descrição do Cargo (Position) *</label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${fieldErrors.descriptionposition ? 'text-red-400' : 'text-gray-300 group-focus-within:text-orange-500'}`}>
                <Briefcase size={20} />
              </div>
              <input 
                type="text" 
                maxLength={50} 
                className={`w-full pl-12 pr-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all font-semibold text-gray-800 text-sm ${fieldErrors.descriptionposition ? 'border-red-300 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-orange-500'}`}
                placeholder="Ex: Engenheiro de Campo" 
                value={positionForm.descriptionPosition}
                onChange={(e) => {
                  setPositionForm({ descriptionPosition: e.target.value });
                  if (fieldErrors.descriptionposition) setFieldErrors({});
                }}
              />
            </div>
            {fieldErrors.descriptionposition ? (
              <p className="text-[11px] font-bold text-red-500 mt-2 ml-2">{fieldErrors.descriptionposition}</p>
            ) : (
              <div className="mt-2 text-right">
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Máximo 50 caracteres</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDERIZAÇÃO: LISTA DE CARGOS
  // ========================================================
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Cargos e Funções</h2>
          <p className="text-gray-500 text-sm mt-1">Gerencie a estrutura organizacional corporativa do time de campo.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setPositionView('create'); }} 
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-orange-600/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus size={18} /> Novo Cargo
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={32} className="animate-spin text-orange-500 mb-4" />
            <p className="font-medium text-sm">Carregando cargos da organização...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-50">
                <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Descrição do Cargo</th>
                  <th className="px-8 py-5">Atribuído a</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {positions.map(pos => (
                  <tr key={pos.id || pos.positionId} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                          <Briefcase size={16} />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{pos.descriptionPosition || pos.desc}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-400 font-medium">Corporativo (Enger)</td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleEditClick(pos)}
                        className="text-gray-300 hover:text-orange-600 transition-colors p-2 cursor-pointer"
                        title="Editar Cargo"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {positions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-20 text-center text-gray-400 font-medium italic">
                      Nenhum cargo cadastrado na organização.
                    </td>
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