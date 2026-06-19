'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { 
  Building2, MapPin, Calendar, CheckCircle2, 
  DollarSign, ChevronDown, Check, 
  X, AlertTriangle, ShieldCheck, HardHat,
  Package, Users, FileSignature, Loader2, Lock, Hammer, Truck
} from 'lucide-react';
import api from '@/services/api';

export default function ClientBudgetApproval() {
  const params = useParams();
  const token = params?.token as string;
  const id = params?.id as string;
  const router = useRouter();

  // Estados de Carregamento e Segurança
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Estados da Tela
  const [budgetData, setBudgetData] = useState<any>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  // Tratamento seguro do Enum de Status vindo do C# (String ou Número)
  const parseStatus = (statusInfo: any): number => {
    if (statusInfo === 12 || statusInfo === 'BudPending' || statusInfo === 'Pending') return 12;
    if (statusInfo === 13 || statusInfo === 'BudApproved' || statusInfo === 'Approved') return 13;
    if (statusInfo === 14 || statusInfo === 'BudRejected' || statusInfo === 'Rejected') return 14;
    if (statusInfo === 17 || statusInfo === 'BudCanceled' || statusInfo === 'Canceled') return 17;
    return Number(statusInfo) || 12;
  };

  useEffect(() => {
    const fetchBudgetByToken = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/orcamento/proposta/${id}/${token}`);
        const data = response.data;
        
        const safeStatus = parseStatus(data.status);

        if (safeStatus === 13) {
          setIsApproved(true);
          setBudgetData(data);
        } else if (safeStatus === 12) {
          setBudgetData(data);
          // Abre a primeira etapa por padrão se houver
          if (data.stages && data.stages.length > 0) {
            setExpandedStage(data.stages[0].stageId || data.stages[0].id);
          }
        } else {
          setAccessDenied(true); 
        }

      } catch (error) {
        console.error("Orçamento não encontrado ou token inválido:", error);
        setAccessDenied(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchBudgetByToken();
    } else {
      setAccessDenied(true);
      setIsLoading(false);
    }
  }, [token]);

  const handleAction = async (action: 'approve' | 'reject') => {
    const isApprove = action === 'approve';
    isApprove ? setIsApproving(true) : setIsDeclining(true);
    
    try {
      if (isApprove) {
        await api.post(`/obras/${token}/${id}`,  {withCredentials: true});
        
        setIsApproved(true);
      } else {
        await api.post(`/orcamento/recusar/${id}/${token}`);
        
        setShowDeclineModal(false);
        setAccessDenied(true);
      }
    } catch (error) {
      console.error("Erro na ação da proposta:", error);
    } finally {
      isApprove ? setIsApproving(false) : setIsDeclining(false);
    }
  };

  const toggleStage = (id: number) => {
    setExpandedStage(expandedStage === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 size={40} className="text-orange-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Buscando detalhes da proposta...</p>
      </div>
    );
  }

  if (accessDenied || !budgetData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Proposta Indisponível</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Este link expirou, foi cancelado ou a proposta foi recusada. Entre em contato com a administração caso precise de uma nova via.
          </p>
        </div>
      </div>
    );
  }

  if (isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="max-w-lg w-full bg-white rounded-[2.5rem] p-10 text-center shadow-xl border border-gray-100 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Proposta Aprovada!</h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            O orçamento para <strong className="text-gray-800">{budgetData.description}</strong> foi confirmado com sucesso e encaminhado para o setor de planejamento.
          </p>
          <button onClick={() => window.print()} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest">
            Imprimir Contrato
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900 pb-20 lg:pb-0 selection:bg-orange-100 selection:text-orange-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center justify-start shrink-0">
            <h2
              className="text-3xl font-black text-zinc-900 cursor-pointer"
            >
              ENGER<span className="text-orange-500">.</span>
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full">
            <ShieldCheck size={14} className="text-green-600" /> Proposta Digital Autenticada
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          <div className="w-full lg:w-2/3 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold mb-4 uppercase tracking-widest">
                <FileSignature size={14} /> Revisão da Proposta
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                {budgetData.description}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" /> Emitido em: {new Date(budgetData.entryDate).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-gray-400" /> Cliente: <strong className="text-gray-700">{budgetData.client?.fantasyName || 'Não Informado'}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 shrink-0 mt-1">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Local de Execução</h3>
                <p className="font-medium text-gray-800 text-base">
                  {budgetData.client?.street || 'Endereço cadastrado'}, {budgetData.client?.number || 'S/N'} - {budgetData.client?.city || 'Viamão'}/{budgetData.client?.federativeunit || 'RS'}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Fases e Escopo de Trabalho</h2>
              <div className="space-y-4">
                {budgetData.stages?.map((stage: any, idx: number) => {
                  const currentId = stage.stageId || stage.id;
                  const isExpanded = expandedStage === currentId;
                  
                  const stageTotalMaterials = stage.materials?.reduce((acc: number, m: any) => acc + (m.plannedQuantity * m.unitCost), 0) || 0;
                  const stageTotalLabor = stage.labors?.reduce((acc: number, l: any) => acc + ((l.plannedHours * l.hourlyRate) * (1 + l.socialCharges / 100)), 0) || 0;
                  const stageTotal = stageTotalMaterials + stageTotalLabor;

                  return (
                    <div key={currentId} className={`bg-white border transition-all duration-200 overflow-hidden ${isExpanded ? 'border-orange-500 shadow-md rounded-2xl' : 'border-gray-200 rounded-xl hover:border-gray-300'}`}>
                      <button onClick={() => toggleStage(currentId)} className="w-full flex items-center justify-between p-5 text-left focus:outline-none cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isExpanded ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>{idx + 1}</div>
                          <span className={`font-bold text-base sm:text-lg ${isExpanded ? 'text-gray-900' : 'text-gray-700'}`}>{stage.description}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-900">R$ {stageTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <div className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-orange-500' : ''}`}><ChevronDown size={20} /></div>
                        </div>
                      </button>

                      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden px-5">
                          <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Insumos e Materiais com Labels explicativas */}
                            <div>
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Package size={14} /> Componentes de Material</h4>
                              {stage.materials?.length > 0 ? (
                                <div className="space-y-3">
                                  {stage.materials.map((mat: any, mIdx: number) => (
                                    <div key={mat.budgetMaterialId || mIdx} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-sm">
                                      <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Item</p>
                                        <p className="font-semibold text-gray-800">{mat.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">Qtd: <span className="font-semibold">{mat.plannedQuantity}</span> ({mat.unit}) × R$ {mat.unitCost.toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Subtotal</p>
                                        <span className="font-bold text-gray-700">R$ {(mat.plannedQuantity * mat.unitCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : <p className="text-sm text-gray-400 italic p-2">Nenhum material alocado nesta fase.</p>}
                            </div>

                            {/* Mão de Obra com Labels explicativas */}
                            <div>
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Users size={14} /> Alocação Operacional</h4>
                              {stage.labors?.length > 0 ? (
                                <div className="space-y-3">
                                  {stage.labors.map((lab: any, lIdx: number) => {
                                    const laborTotal = (lab.plannedHours * lab.hourlyRate) * (1 + lab.socialCharges / 100);
                                    return (
                                      <div key={lab.budgetLaborId || lIdx} className="bg-orange-50/30 p-3 rounded-xl border border-orange-100/60 flex justify-between items-center text-sm">
                                        <div>
                                          <p className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">Especialidade / Cargo</p>
                                          <p className="font-semibold text-gray-800">Cód. Função: {lab.roleId}</p>
                                          <p className="text-xs text-gray-500 mt-1">Horas estimadas: <span className="font-semibold">{lab.plannedHours}h</span> × R$ {lab.hourlyRate.toLocaleString('pt-BR', {minimumFractionDigits:2})}/h</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mão de Obra</p>
                                          <span className="font-bold text-gray-700">R$ {laborTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : <p className="text-sm text-gray-400 italic p-2">Sem mão de obra listada nesta fase.</p>}
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {budgetData.observation && (
               <div className="bg-gray-100 rounded-xl p-5 text-xs text-gray-500 leading-relaxed border border-gray-200">
                 <strong className="block text-gray-700 mb-1">Notas e Observações da Proposta</strong>
                 {budgetData.observation}
               </div>
            )}
          </div>

          {/* COLUNA DIREITA: BALANÇO FINANCEIRO COM PALETA HIGH-CONTRAST */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 lg:sticky lg:top-28">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <DollarSign className="text-orange-600" size={20} /> Resumo do Contrato
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Balanço de Insumos</span>
                  <span className="font-bold text-gray-800">R$ {budgetData.totalMaterialsValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Serviços e Execução</span>
                  <span className="font-bold text-gray-800">R$ {budgetData.totalStepsValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-dashed border-gray-200 mb-8">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Investimento Total Global</p>
                <div className="text-4xl font-black text-gray-900 tracking-tight flex items-baseline gap-1">
                  <span className="text-xl text-gray-400 font-semibold">R$</span>
                  {budgetData.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => handleAction('approve')}
                  disabled={isApproving || isDeclining}
                  className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all text-lg cursor-pointer ${isApproving ? 'bg-orange-400 cursor-not-allowed shadow-none' : 'bg-orange-600 hover:bg-orange-700'}`}
                >
                  {isApproving ? <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</> : <><Check size={22} /> Confirmar e Aprovar</>}
                </button>

                <button 
                  onClick={() => setShowDeclineModal(true)}
                  disabled={isApproving || isDeclining}
                  className="w-full py-4 rounded-2xl font-bold text-gray-600 bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Recusar Proposta
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Recusa */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl animate-in zoom-in-95 border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Recusar Proposta?</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Deseja realmente recusar esta proposta comercial? O link será invalidado e a equipe interna receberá um aviso.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setShowDeclineModal(false)} className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors cursor-pointer">
                Voltar
              </button>
              <button 
                onClick={() => handleAction('reject')}
                disabled={isDeclining}
                className="flex-1 px-4 py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeclining ? <Loader2 size={16} className="animate-spin" /> : null} Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}