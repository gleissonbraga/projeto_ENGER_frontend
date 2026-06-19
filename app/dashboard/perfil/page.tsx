'use client';

import React, { useEffect, useState } from 'react';
import { 
  BadgeCheck, UserCircle, ShieldCheck, Mail, Phone, 
  Globe, Fingerprint, Building2, MapPin, Loader2, 
  Calendar
} from 'lucide-react';
import api from '@/services/api';

// ========================================================
// 📊 INTERFACES BASEADAS NO RETORNO DO C#
// ========================================================
interface CompanyProfile {
  companyId: number;
  reasonName: string;
  fantasyName: string;
  registrationNumber: string;
  rgieNumber: string;
  email: string;
  street: string;
  number: string;
  city: string;
  neighborhood: string;
  zipCode: string;
  federativeUnit: string;
  phoneNumber: string;
  subscriptionCode: string;
}

interface UserProfile {
  userId: number;
  username: string;
  email: string;
  admin: number;
  entryDate: string;
  updateDate: string;
  status: number;
  company: CompanyProfile;
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ========================================================
  // 🔄 INTEGRAÇÃO COM A API
  // ========================================================
  useEffect(() => {
    const fetchProfileData = async () => {
      const sessionData = sessionStorage.getItem('enger_user');
      
      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        
        // Extraímos os dois IDs do cache de login do usuário
        const userId = parsedData.id || parsedData.userId;
        const companyId = parsedData.companyId;
        
        try {
          setIsLoading(true);
          // Rota ajustada exatamente para o formato: {userId}/{intCompanyId}
          const response = await api.get(`/usuarios/${userId}/${companyId}`, { withCredentials: true });
          setProfileData(response.data);
        } catch (error) {
          console.error("Erro ao carregar dados do perfil:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // ========================================================
  // ⚙️ FUNÇÕES DE MÁSCARA PARA VISUALIZAÇÃO
  // ========================================================
  const formatDocument = (doc: string) => {
    if (!doc) return 'Não informado';
    const cleaned = doc.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    return doc;
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'Não informado';
    const cleaned = phone.replace(/\D/g, '');
    // Trata o formato DDI + DDD + Número (ex: 5551999303193)
    if (cleaned.length === 13) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4");
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  };

  const formatZipCode = (zip: string) => {
    if (!zip) return '';
    return zip.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  // ========================================================
  // 🖥️ TELAS DE CARREGAMENTO E RENDERIZAÇÃO
  // ========================================================
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
        <Loader2 size={40} className="animate-spin text-orange-600 mb-4" />
        <p className="font-medium text-sm">Carregando perfil...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
        <p className="font-medium">Não foi possível carregar os dados do perfil.</p>
      </div>
    );
  }

  const nomeUsuario = profileData.username;
  const nivelAcessoTexto = profileData.admin >= 7 ? 'Acesso Total (Root)' : 'Acesso Restrito';
  const empresa = profileData.company;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Perfil de Acesso</h2>
          <p className="text-gray-500 font-normal mt-1">Visualize seus dados de usuário e as informações da sua organização.</p>
        </div>
        <div className="flex gap-3">
          <span className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 ${profileData.status === 1 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
            <BadgeCheck size={16} /> {profileData.status === 1 ? 'Conta Ativa' : 'Conta Inativa'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Resumo do Usuário */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-orange-600 to-orange-400"></div>
            
            <div className="w-32 h-32 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-400 mx-auto mb-6 border-4 border-white shadow-xl relative z-10 mt-8">
              <UserCircle size={64} />
              <div className="absolute -bottom-2 -right-2 bg-gray-900 text-white p-2 rounded-xl shadow-lg">
                <ShieldCheck size={18} />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900">{nomeUsuario}</h3>
            <p className="text-orange-600 font-bold text-xs uppercase tracking-widest mt-1">Nível de Acesso: {profileData.admin}</p>
            
            <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={18} className="text-orange-600 shrink-0" />
                <span className="font-medium truncate">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar size={18} className="text-orange-600 shrink-0" />
                <span className="font-medium">Membro desde {new Date(profileData.entryDate).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
             <Globe className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10" />
             <h4 className="text-lg font-bold mb-2">Plano Atual</h4>
             <p className="text-gray-400 text-sm mb-6 flex items-center gap-2">
               Licença: <span className="text-white font-mono text-xs truncate max-w-[150px]">{empresa?.subscriptionCode || 'N/A'}</span>
             </p>
             <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border border-white/5">
               Gerenciar Assinatura
             </button>
          </div>
        </div>

        {/* Lado Direito: Dados Detalhados */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Seção Dados Pessoais */}
          <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
              <Fingerprint size={14} className="text-orange-600" /> Detalhes da Conta
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Nome de Usuário</p>
                <p className="text-gray-800 font-bold">{nomeUsuario}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">E-mail de Login</p>
                <p className="text-gray-800 font-bold">{profileData.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status de Permissão</p>
                <p className="text-orange-600 font-bold">{nivelAcessoTexto}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Última Atualização</p>
                <p className="text-gray-800 font-bold">{new Date(profileData.updateDate).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Seção Dados da Empresa */}
          {empresa && (
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
                <Building2 size={14} className="text-orange-600" /> Organização e Contato
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="md:col-span-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Razão Social</p>
                  <p className="text-gray-800 font-black text-lg">{empresa.reasonName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Nome Fantasia</p>
                  <p className="text-gray-800 font-bold">{empresa.fantasyName || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">CNPJ / Documento</p>
                  <p className="text-gray-800 font-bold">{formatDocument(empresa.registrationNumber)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Inscrição Estadual</p>
                  <p className="text-gray-800 font-bold">{empresa.rgieNumber || 'Isento / Não Informado'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">E-mail Comercial</p>
                  <p className="text-gray-800 font-bold">{empresa.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Telefone Principal</p>
                  <p className="text-gray-800 font-bold flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    {formatPhone(empresa.phoneNumber)}
                  </p>
                </div>
                
                <div className="md:col-span-2 pt-4 border-t border-gray-50">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Endereço Sede</p>
                  <div className="bg-gray-50 p-4 rounded-2xl flex items-start gap-3">
                    <MapPin size={20} className="text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800 font-bold">
                        {empresa.street}, {empresa.number} - {empresa.neighborhood}
                      </p>
                      <p className="text-sm text-gray-500 font-medium mt-0.5">
                        {empresa.city} - {empresa.federativeUnit}, {formatZipCode(empresa.zipCode)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}