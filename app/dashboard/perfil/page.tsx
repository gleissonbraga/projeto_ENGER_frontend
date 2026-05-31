'use client';

import React, { useEffect, useState } from 'react';
import { 
  BadgeCheck, UserCircle, ShieldCheck, Mail, Phone, 
  Globe, Fingerprint, Building2, MapPin 
} from 'lucide-react';

export default function ProfilePage() {
  const [userData, setUserData] = useState<{ userName: string; adminLevel: number } | null>(null);

  useEffect(() => {
    const sessionData = sessionStorage.getItem('enger_user');
    if (sessionData) {
      setUserData(JSON.parse(sessionData));
    }
  }, []);

  const nomeUsuario = userData?.userName || 'Ricardo Lima';
  const nivelAcessoTexto = userData?.adminLevel && userData.adminLevel >= 7 ? 'Acesso Total (Root)' : 'Acesso Restrito';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Perfil de Acesso</h2>
          <p className="text-gray-500 font-normal mt-1">Visualize seus dados de usuário e as informações da sua organização.</p>
        </div>
        <div className="flex gap-3">
          <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100 flex items-center gap-2">
            <BadgeCheck size={16} /> Conta Verificada
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Resumo do Usuário */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
            <div className="w-32 h-32 bg-orange-50 rounded-[2rem] flex items-center justify-center text-orange-600 mx-auto mb-6 border-4 border-white shadow-xl relative group">
              <UserCircle size={64} />
              <div className="absolute -bottom-2 -right-2 bg-orange-600 text-white p-2 rounded-xl shadow-lg">
                <ShieldCheck size={18} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{nomeUsuario}</h3>
            <p className="text-orange-600 font-bold text-xs uppercase tracking-widest mt-1">Administrador Master</p>
            
            <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={18} className="text-gray-400" />
                <span className="font-medium">ricardo@enger.com.br</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={18} className="text-gray-400" />
                <span className="font-medium">(11) 98765-4321</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-600/20 relative overflow-hidden">
             <Globe className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10" />
             <h4 className="text-lg font-bold mb-2">Plano Atual</h4>
             <p className="text-orange-100 text-sm mb-6">Assinatura Enterprise (Anual)</p>
             <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
               Ver Faturas
             </button>
          </div>
        </div>

        {/* Lado Direito: Dados Detalhados */}
        <div className="lg:col-span-2 space-y-8">
          {/* Seção Dados Pessoais */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
              <Fingerprint size={14} className="text-orange-600" /> Dados Pessoais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Nome Completo</p>
                <p className="text-gray-800 font-semibold">{nomeUsuario}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Data de Nascimento</p>
                <p className="text-gray-800 font-semibold">15 de Maio de 1985</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Cargo / Função</p>
                <p className="text-gray-800 font-semibold">Engenheiro Civil Sênior</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Nível de Acesso</p>
                <p className="text-orange-600 font-bold">{nivelAcessoTexto}</p>
              </div>
            </div>
          </div>

          {/* Seção Dados da Empresa */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
              <Building2 size={14} className="text-orange-600" /> Informações Corporativas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Razão Social</p>
                <p className="text-gray-800 font-semibold">ENGER ENTERPRISE GESTÃO DE OBRAS LTDA</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">CNPJ</p>
                <p className="text-gray-800 font-semibold">12.345.678/0001-90</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Inscrição Estadual</p>
                <p className="text-gray-800 font-semibold">456.789.123.110</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">E-mail Corporativo</p>
                <p className="text-gray-800 font-semibold">administrativo@enger.com.br</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Telefone Comercial</p>
                <p className="text-gray-800 font-semibold">(11) 3300-4400</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Endereço Sede</p>
                <p className="text-gray-800 font-semibold flex items-center gap-2">
                  <MapPin size={16} className="text-orange-600" />
                  Av. Faria Lima, 1000 - 14º Andar, São Paulo - SP, 01234-567
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}