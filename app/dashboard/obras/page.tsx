'use client';

import React, { useState, useEffect } from 'react';
import { 
  HardHat, Search, ChevronRight, ArrowLeft, Save, 
  Hammer, Users, Truck, DollarSign, CheckCircle, 
  MapPin, Plus, Trash2, X, Building2, User, Loader2
} from 'lucide-react';
import api from '@/services/api';

// ========================================================
// 📊 INTERFACES RIGOROSAS BASEADAS NO JSON DO C#
// ========================================================
interface ConstructionStage {
  stageId: number;
  description: string;
  order: number;
  constructionId: number;
  status: number;
}

interface Construction {
  constructionId: number;
  description: string;
  budgetId: number;
  totalPaidValue: number;
  totalConstructionValue: number;
  street: string;
  number: string;
  city: string;
  neighborhood: string;
  zipCode: string;
  stateAbbreviation: string;
  stateDescription: string | null;
  startDate: string;
  estimatedDeliveryDate: string | null;
  finalizationDate: string | null;
  status: number;
  companyId: number;
  responsibleId: number;
  stages: ConstructionStage[];
  employees: any[];
  payments: any[];
  presences: any[];
  rentals: any[];
  attachments: any[];
  budget?: any; 
  company?: any;
}

type TabType = 'geral' | 'etapas' | 'equipe' | 'equipamentos';

export default function ObrasPage() {
  const [constructionView, setConstructionView] = useState<'list' | 'manage'>('list');
  const [activeTab, setActiveTab] = useState<TabType>('geral');
  
  const [constructions, setConstructions] = useState<Construction[]>([]);
  const [currentConstruction, setCurrentConstruction] = useState<Construction | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [listSearchQuery, setListSearchQuery] = useState('');

  // Estados de Modais
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ title: string, type: 'user' | 'employee' | '', onSelect: any }>({ title: '', type: '', onSelect: null });
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // ========================================================
  // 🔄 INTEGRAÇÃO COM A API
  // ========================================================
  useEffect(() => {
    const sessionData = sessionStorage.getItem('enger_user');
    if (sessionData) {
      const parsedData = JSON.parse(sessionData);
      setCompanyId(parsedData.companyId);
      fetchConstructions(parsedData.companyId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchConstructions = async (compId: number) => {
    try {
      setIsLoading(true);
      // Rota presumida com base no padrão ENGER
      const response = await api.get(`/obras/${compId}`);
      
      // Ordena pelas mais recentes
      const sorted = response.data.sort((a: any, b: any) => b.constructionId - a.constructionId);
      setConstructions(sorted);
    } catch (error) {
      console.error("Erro ao buscar obras:", error);
      // Fallback para teste visual enquanto a rota não está 100% no backend:
      setConstructions([{
        constructionId: 4,
        description: "Pintura e Texturização de Fachada Externa - Edifício Horizonte",
        budgetId: 15,
        totalPaidValue: 5000,
        totalConstructionValue: 14750,
        street: "Rua Bento Gonçalves",
        number: "1020",
        city: "Porto Alegre",
        neighborhood: "Moinhos de Vento",
        zipCode: "90000-000",
        stateAbbreviation: "RS",
        stateDescription: "Rio Grande do Sul",
        startDate: "2026-05-30T22:03:35.676647Z",
        estimatedDeliveryDate: "2026-12-15T00:00:00.000Z",
        finalizationDate: null,
        status: 1,
        companyId: 1,
        responsibleId: 1,
        stages: [
          { stageId: 4, description: "Preparação e Tratamento de Superfície", order: 1, constructionId: 4, status: 1 },
          { stageId: 5, description: "Aplicação de Textura e Pintura Final", order: 2, constructionId: 4, status: 1 }
        ],
        employees: [], payments: [], presences: [], rentals: [], attachments: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConstruction = async () => {
    if (!currentConstruction) return;
    setIsSubmitting(true);
    try {
      await api.put(`/obras/${companyId}/${currentConstruction.constructionId}`, currentConstruction);
      alert('Obra atualizada com sucesso!');
      fetchConstructions(companyId!);
    } catch (error) {
      console.error("Erro ao atualizar obra:", error);
      alert('Ocorreu um erro ao atualizar a obra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (title: string, type: 'user' | 'employee', onSelect: any) => {
    setModalConfig({ title, type, onSelect });
    setModalSearchQuery('');
    setIsSelectionModalOpen(true);
  };

  // ========================================================
  // 🖥️ LÓGICA DE DADOS E FILTROS
  // ========================================================
  const filteredConstructions = constructions.filter(c => 
    c.description?.toLowerCase().includes(listSearchQuery.toLowerCase()) ||
    c.city?.toLowerCase().includes(listSearchQuery.toLowerCase())
  );

  const calculateProgress = (paid: number, total: number) => {
    if (!total || total === 0) return 0;
    const perc = (paid / total) * 100;
    return perc > 100 ? 100 : perc;
  };

  const getStatusBadge = (statusId: number) => {
    switch (statusId) {
      case 1: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Em Execução</span>;
      case 2: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Finalizada</span>;
      case 3: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Paralisada</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Em Planejamento</span>;
    }
  };

  // ========================================================
  // 🖥️ TELA: LISTAGEM DE OBRAS
  // ========================================================
  if (constructionView === 'list') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Obras em Andamento</h2>
            <p className="text-sm text-gray-500 mt-1">Acompanhe e gerencie a execução dos projetos aprovados.</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" placeholder="Buscar obra..." 
              value={listSearchQuery} onChange={(e) => setListSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 outline-none w-full sm:w-64 shadow-sm" 
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 size={32} className="animate-spin text-orange-500 mb-4" />
              <p className="font-medium text-sm">Carregando obras...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição / Endereço</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progresso Financeiro</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Datas</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredConstructions.map(obra => (
                    <tr key={obra.constructionId} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                            <HardHat className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-semibold text-gray-800 text-sm truncate">{obra.description}</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{obra.street}, {obra.number} - {obra.city}/{obra.stateAbbreviation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 w-48">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">R$ {obra.totalPaidValue?.toLocaleString('pt-BR', {minimumFractionDigits: 2})} Pago</span>
                            <span className="font-medium text-gray-800">R$ {obra.totalConstructionValue?.toLocaleString('pt-BR', {minimumFractionDigits: 2})} Total</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-orange-500 h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${calculateProgress(obra.totalPaidValue, obra.totalConstructionValue)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-800">Início: {new Date(obra.startDate).toLocaleDateString('pt-BR')}</p>
                        <p className="text-xs text-gray-500">
                          Prev: {obra.estimatedDeliveryDate ? new Date(obra.estimatedDeliveryDate).toLocaleDateString('pt-BR') : 'Não informada'}
                        </p>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(obra.status)}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => {
                            setCurrentConstruction(obra);
                            setConstructionView('manage');
                            setActiveTab('geral');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-sm font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Gerenciar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredConstructions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 font-medium italic">Nenhuma obra localizada.</td>
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
  // 🖥️ TELA: GERENCIAMENTO DE OBRA (ABAS)
  // ========================================================
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setConstructionView('list'); setCurrentConstruction(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Gerenciar Obra <span className="text-gray-400 font-medium">#{currentConstruction?.constructionId}</span></h2>
              {currentConstruction && getStatusBadge(currentConstruction.status)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Atualize o escopo, equipe e equipamentos da obra.</p>
          </div>
        </div>
        <button onClick={handleSaveConstruction} disabled={isSubmitting} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black transition-all shadow-lg shadow-gray-900/20 text-sm cursor-pointer disabled:opacity-50">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
          Salvar Alterações
        </button>
      </div>

      {/* Abas de Navegação Interna da Obra */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-px overflow-x-auto hide-scrollbar">
        {[
          { id: 'geral', label: 'Dados Gerais', icon: HardHat },
          { id: 'etapas', label: 'Etapas de Execução', icon: Hammer },
          { id: 'equipe', label: 'Equipe Alocada', icon: Users },
          { id: 'equipamentos', label: 'Aluguéis / Equip', icon: Truck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id 
                ? 'border-orange-500 text-orange-600 bg-orange-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        
        {/* ABA 1: DADOS GERAIS */}
        {activeTab === 'geral' && currentConstruction && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor Total da Obra</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">R$ {currentConstruction.totalConstructionValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Total Pago (Cliente)</p>
                  <p className="text-2xl font-bold text-orange-700 mt-1">R$ {currentConstruction.totalPaidValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-orange-500">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">Descrição da Obra</label>
                <input 
                  type="text" 
                  value={currentConstruction.description} 
                  onChange={(e) => setCurrentConstruction({...currentConstruction, description: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-semibold text-gray-800" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Status</label>
                <select 
                  value={currentConstruction.status}
                  onChange={(e) => setCurrentConstruction({...currentConstruction, status: Number(e.target.value)})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm appearance-none font-semibold text-gray-800 cursor-pointer"
                >
                  <option value={0}>Em Planejamento</option>
                  <option value={1}>Em Execução</option>
                  <option value={2}>Finalizada</option>
                  <option value={3}>Paralisada</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Responsável Técnico</label>
                <button onClick={() => openModal('Selecionar Responsável', 'user', (u: any) => { setCurrentConstruction({...currentConstruction, responsibleId: u.id}) })} className="w-full p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-800 cursor-pointer">
                  <span>ID Resp: {currentConstruction.responsibleId || 'Não definido'}</span>
                  <Search className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Data de Início</label>
                <input 
                  type="date" 
                  value={currentConstruction.startDate ? currentConstruction.startDate.split('T')[0] : ''}
                  onChange={(e) => setCurrentConstruction({...currentConstruction, startDate: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 outline-none transition-all text-sm font-semibold text-gray-800" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Previsão de Entrega</label>
                <input 
                  type="date" 
                  value={currentConstruction.estimatedDeliveryDate ? currentConstruction.estimatedDeliveryDate.split('T')[0] : ''}
                  onChange={(e) => setCurrentConstruction({...currentConstruction, estimatedDeliveryDate: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 outline-none transition-all text-sm font-semibold text-gray-800" 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Localização
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">CEP</label>
                  <input type="text" maxLength={8} value={currentConstruction.zipCode} onChange={e => setCurrentConstruction({...currentConstruction, zipCode: e.target.value.replace(/\D/g,'')})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none font-semibold text-gray-800" />
                </div>
                <div className="sm:col-span-7 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Rua/Logradouro</label>
                  <input type="text" value={currentConstruction.street} onChange={e => setCurrentConstruction({...currentConstruction, street: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none font-semibold text-gray-800" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Número</label>
                  <input type="text" value={currentConstruction.number} onChange={e => setCurrentConstruction({...currentConstruction, number: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none font-semibold text-gray-800" />
                </div>
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Bairro</label>
                  <input type="text" value={currentConstruction.neighborhood} onChange={e => setCurrentConstruction({...currentConstruction, neighborhood: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none font-semibold text-gray-800" />
                </div>
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Cidade</label>
                  <input type="text" value={currentConstruction.city} onChange={e => setCurrentConstruction({...currentConstruction, city: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none font-semibold text-gray-800" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">UF</label>
                  <input type="text" maxLength={2} value={currentConstruction.stateAbbreviation} onChange={e => setCurrentConstruction({...currentConstruction, stateAbbreviation: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none text-center font-semibold text-gray-800 uppercase" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: ETAPAS DE EXECUÇÃO */}
        {activeTab === 'etapas' && currentConstruction && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Acompanhamento das fases herdadas do orçamento.</p>
              <button className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-100 transition-colors text-sm cursor-pointer">
                <Plus className="w-4 h-4" /> Nova Etapa (Extra)
              </button>
            </div>

            <div className="space-y-3">
              {currentConstruction.stages.map((stage, idx) => (
                <div key={stage.stageId} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center gap-3 w-24">
                    <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 border border-gray-100 rounded-md">Ord: {stage.order}</span>
                  </div>
                  <div className="flex-1 space-y-1.5 w-full">
                    <input 
                      type="text" 
                      value={stage.description} 
                      onChange={(e) => {
                        const newStages = [...currentConstruction.stages];
                        newStages[idx].description = e.target.value;
                        setCurrentConstruction({...currentConstruction, stages: newStages});
                      }}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none font-semibold text-gray-800 focus:border-orange-500" 
                    />
                  </div>
                  <div className="w-full sm:w-48 space-y-1.5">
                    <select 
                      value={stage.status}
                      onChange={(e) => {
                        const newStages = [...currentConstruction.stages];
                        newStages[idx].status = Number(e.target.value);
                        setCurrentConstruction({...currentConstruction, stages: newStages});
                      }}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:border-orange-500 appearance-none cursor-pointer"
                    >
                      <option value={0}>A Iniciar</option>
                      <option value={1}>Em Andamento</option>
                      <option value={2}>Concluída</option>
                    </select>
                  </div>
                </div>
              ))}
              {currentConstruction.stages.length === 0 && (
                <div className="p-8 text-center text-gray-400 italic">Nenhuma etapa vinculada a esta obra.</div>
              )}
            </div>
          </div>
        )}

        {/* ABA 3: EQUIPE ALOCADA (Simulação baseada no JSON) */}
        {activeTab === 'equipe' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex justify-between items-center bg-orange-50 p-4 rounded-xl border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Alocação de Mão de Obra</h4>
                  <p className="text-xs text-gray-500">Vincule funcionários do seu quadro a esta obra.</p>
                </div>
              </div>
              <button onClick={() => openModal('Adicionar Funcionário', 'employee', () => {})} className="flex items-center gap-2 bg-white text-orange-600 border border-orange-200 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm shadow-sm cursor-pointer">
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
            {currentConstruction?.employees.length === 0 ? (
               <div className="p-10 text-center text-gray-400">Nenhum funcionário alocado na obra no momento.</div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {/* Mapeamento de employees virá aqui quando o endpoint alimentar o array */}
               </div>
            )}
          </div>
        )}

        {/* ABA 4: EQUIPAMENTOS (RENTALS) */}
        {activeTab === 'equipamentos' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Controle de locações, maquinário e diárias.</p>
              <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm cursor-pointer">
                <Plus className="w-4 h-4" /> Novo Aluguel
              </button>
            </div>
            
            {currentConstruction?.rentals.length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400">
                Nenhum equipamento alugado registrado.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                {/* Tabela de rentals */}
              </div>
            )}
          </div>
        )}

      </div>

      {/* RENDERIZAÇÃO DO MODAL EXCLUSIVO DESSA TELA */}
      {isSelectionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">{modalConfig.title}</h3>
              <button onClick={() => setIsSelectionModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" placeholder="Buscar..." value={modalSearchQuery} onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all outline-none text-sm font-semibold text-gray-700"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              <div className="p-8 text-center text-gray-500 text-sm italic">
                Nenhum registro encontrado (Integração de busca dependente da API).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}