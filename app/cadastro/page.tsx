"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Building,
  Mail,
  Phone,
  ShieldAlert,
  Check,
  Briefcase,
  Map,
  Lock,
  ArrowRight,
} from "lucide-react";
import api from "@/services/api";
import { clearFormatting, maskCNPJ, validateCNPJ } from "@/utils/formatters";

// 1. Definição da Interface
interface CompanyFormData {
  reasonName: string;
  fantasyName: string;
  registrationNumber: string;
  rGIeNumber: string;
  email: string;
  phoneNumber: string;
  zipCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  federativeunit: string;
  username: string;
  emailUser: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
}

const CompanyRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  
  // Novos estados para validação do backend
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const totalSteps = 4;
  const router = useRouter();

  // 2. Estado tipado
  const [formData, setFormData] = useState<CompanyFormData>({
    reasonName: "",
    fantasyName: "",
    registrationNumber: "",
    rGIeNumber: "",
    email: "",
    phoneNumber: "",
    zipCode: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    federativeunit: "",
    username: "",
    emailUser: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
  });

  // 3. Tipagem dos eventos de mudança
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    // Limpa os erros do backend assim que o usuário digita algo novo
    if (apiErrors[name]) {
      setApiErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (globalError) {
      setGlobalError(null);
    }

    if (name === "registrationNumber") {
      setFormData((prev) => ({ ...prev, [name]: maskCNPJ(value) }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? (e.target as HTMLInputElement).checked
              ? 1
              : 0
            : value,
      }));
    }
  };

  const passwordsMatch = formData.password === formData.confirmPassword;

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        const isCnpjOk = validateCNPJ(formData.registrationNumber);
        return (
          formData.reasonName.trim() !== "" &&
          formData.fantasyName.trim() !== "" &&
          formData.rGIeNumber.trim() !== "" &&
          isCnpjOk
        );
      case 2:
        return (
          !!formData.email &&
          !!formData.zipCode &&
          !!formData.street &&
          !!formData.number &&
          !!formData.neighborhood &&
          !!formData.city &&
          !!formData.federativeunit
        );
      case 3:
        const isPasswordMatch = formData.password === formData.confirmPassword;
        return (
          formData.username.trim() !== "" &&
          formData.emailUser.trim() !== "" &&
          formData.password.trim() !== "" &&
          formData.confirmPassword.trim() !== "" &&
          isPasswordMatch // Só retorna true se forem iguais
        );
      default:
        return true;
    }
  };

  // Atualizado para receber o 'name' do campo e checar os erros da API
  const getInputClass = (value: string, name: string) => {
    const baseClass =
      "w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 text-black";
    
    const hasLocalError = showErrors && !value;
    const hasApiError = !!apiErrors[name];

    const errorClass = hasLocalError || hasApiError
      ? "border-red-500 bg-red-50 focus:border-red-500"
      : "border-gray-200 focus:border-orange-500";
      
    return `${baseClass} ${errorClass}`;
  };

  const handleNext = () => {
    setShowErrors(true);
    if (isStepValid()) {
      setShowErrors(false);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiErrors({});
    setGlobalError(null);

    const dataToSend = {
      ...formData,
      registrationNumber: clearFormatting(formData.registrationNumber),
      zipCode: clearFormatting(formData.zipCode),
    };

    try {
      const response = await api.post("/empresas/cadastro", dataToSend);
      const novaEmpresaId = response.data.companyId;

      localStorage.setItem('enger_nova_empresa_id', novaEmpresaId);
      router.push('/pagamento');
      
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error.response?.data || error.message);

      // Tratamento dos erros da ApplicException do seu C#
      const responseData = error.response?.data;
      const errorList = responseData?.errors || responseData;

      if (Array.isArray(errorList)) {
        const newApiErrors: Record<string, string> = {};
        
        errorList.forEach((err: any) => {
          // Pega a propriedade field do seu ValidationError
          const field = err.field || err.property; 
          if (field) {
            newApiErrors[field] = err.message;
          }
        });
        
        setApiErrors(newApiErrors);
        setGlobalError("Alguns dados são inválidos ou já estão em uso. Por favor, volte aos passos anteriores para corrigir.");
      } else {
        setGlobalError(responseData?.message || "Erro interno no servidor. Verifique o console.");
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: "Dados Jurídicos", description: "Informações da empresa", icon: Briefcase },
    { id: 2, title: "Localização", description: "Endereço e contatos", icon: Map },
    { id: 3, title: "Administrador", description: "Credenciais de acesso", icon: Lock },
    { id: 4, title: "Revisão", description: "Confirme os dados", icon: CheckCircle2 },
  ];

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Sobre a Empresa</h2>
        <p className="text-gray-500 mt-1">
          Preencha os dados jurídicos e oficiais da organização.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.reasonName) || apiErrors.reasonName ? "text-red-500" : "text-gray-700"}`}>
            Razão Social *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
              <Building2 size={18} />
            </div>
            <input
              type="text"
              name="reasonName"
              value={formData.reasonName}
              onChange={handleChange}
              className={getInputClass(formData.reasonName, "reasonName")}
              placeholder="Nome oficial de registro"
              maxLength={100}
            />
          </div>
          {showErrors && !formData.reasonName && (
            <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>
          )}
          {apiErrors.reasonName && (
            <span className="text-red-500 text-xs mt-1 block">{apiErrors.reasonName}</span>
          )}
        </div>

        <div className="md:col-span-2 group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.fantasyName) || apiErrors.fantasyName ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            Nome Fantasia
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
              <Building size={18} />
            </div>
            <input
              type="text"
              name="fantasyName"
              value={formData.fantasyName}
              onChange={handleChange}
              className={getInputClass(formData.fantasyName, "fantasyName") + " pl-10"}
              placeholder="Como a empresa é conhecida"
              maxLength={100}
            />
          </div>
          {showErrors && !formData.fantasyName && (
            <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>
          )}
          {apiErrors.fantasyName && (
            <span className="text-red-500 text-xs mt-1 block">{apiErrors.fantasyName}</span>
          )}
        </div>

        <div className="group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.registrationNumber) || apiErrors.registrationNumber ? "text-red-500" : "text-gray-700"}`}>
            CNPJ *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
              <ShieldAlert size={18} />
            </div>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              className={getInputClass(formData.registrationNumber, "registrationNumber") + " pl-10"}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>
          {showErrors && !formData.registrationNumber && (
            <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>
          )}
          {apiErrors.registrationNumber && (
            <span className="text-red-500 text-xs mt-1 block">{apiErrors.registrationNumber}</span>
          )}
        </div>

        <div className="group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.rGIeNumber) || apiErrors.rGIeNumber ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            Inscrição Estadual (IE)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
              <Briefcase size={18} />
            </div>
            <input
              type="text"
              name="rGIeNumber"
              value={formData.rGIeNumber}
              onChange={handleChange}
              className={getInputClass(formData.rGIeNumber, "rGIeNumber") + " pl-10"}
              placeholder="Número do RG ou IE"
              maxLength={14}
            />
          </div>
          {showErrors && !formData.rGIeNumber && (
            <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>
          )}
          {apiErrors.rGIeNumber && (
            <span className="text-red-500 text-xs mt-1 block">{apiErrors.rGIeNumber}</span>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Localização e Contato</h2>
        <p className="text-gray-500 mt-1">Onde a empresa está localizada e como podemos contatá-la.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="md:col-span-3 group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.email) || apiErrors.email ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            E-mail Corporativo *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
              <Mail size={18} />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={getInputClass(formData.email, "email") + " pl-10"}
              placeholder="contato@empresa.com"
            />
          </div>
          {showErrors && !formData.email && <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>}
          {apiErrors.email && <span className="text-red-500 text-xs mt-1 block">{apiErrors.email}</span>}
        </div>

        <div className="md:col-span-3 group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.phoneNumber) || apiErrors.phoneNumber ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            Telefone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
              <Phone size={18} />
            </div>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={getInputClass(formData.phoneNumber, "phoneNumber") + " pl-10"}
              placeholder="(00) 0000-0000"
            />
          </div>
          {showErrors && !formData.phoneNumber && <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>}
          {apiErrors.phoneNumber && <span className="text-red-500 text-xs mt-1 block">{apiErrors.phoneNumber}</span>}
        </div>

        <div className="col-span-full border-t border-gray-100 my-2"></div>

        <div className="md:col-span-2 group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.zipCode) || apiErrors.zipCode ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            CEP *
          </label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className={getInputClass(formData.zipCode, "zipCode") + " pl-10"}
            placeholder="00000-000"
          />
          {showErrors && !formData.zipCode && <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>}
          {apiErrors.zipCode && <span className="text-red-500 text-xs mt-1 block">{apiErrors.zipCode}</span>}
        </div>

        <div className="md:col-span-4 group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.street) || apiErrors.street ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            Rua / Logradouro *
          </label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            className={getInputClass(formData.street, "street") + " pl-10"}
            placeholder="Av. Principal"
          />
          {showErrors && !formData.street && <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>}
          {apiErrors.street && <span className="text-red-500 text-xs mt-1 block">{apiErrors.street}</span>}
        </div>

        <div className="md:col-span-2 group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.number) || apiErrors.number ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            Número *
          </label>
          <input
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
            className={getInputClass(formData.number, "number") + " pl-10"}
            placeholder="123"
          />
          {showErrors && !formData.number && <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>}
          {apiErrors.number && <span className="text-red-500 text-xs mt-1 block">{apiErrors.number}</span>}
        </div>

        <div className="md:col-span-4 group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.neighborhood) || apiErrors.neighborhood ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            Bairro *
          </label>
          <input
            type="text"
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleChange}
            className={getInputClass(formData.neighborhood, "neighborhood") + " pl-10"}
            placeholder="Centro"
          />
          {showErrors && !formData.neighborhood && <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>}
          {apiErrors.neighborhood && <span className="text-red-500 text-xs mt-1 block">{apiErrors.neighborhood}</span>}
        </div>

        <div className="md:col-span-4 group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.city) || apiErrors.city ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            Cidade *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={getInputClass(formData.city, "city") + " pl-10"}
            placeholder="São Paulo"
          />
          {showErrors && !formData.city && <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>}
          {apiErrors.city && <span className="text-red-500 text-xs mt-1 block">{apiErrors.city}</span>}
        </div>

        <div className="md:col-span-2 group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.federativeunit) || apiErrors.federativeunit ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            Estado (UF) *
          </label>
          <select
            name="federativeunit"
            value={formData.federativeunit}
            onChange={handleChange}
            className={getInputClass(formData.federativeunit, "federativeunit") + " pl-10"}
          >
            <option value="">Selecione...</option>
            <option value="SP">SP</option>
            <option value="RJ">RJ</option>
            <option value="MG">MG</option>
            <option value="RS">RS</option>
          </select>
          {showErrors && !formData.federativeunit && <span className="text-red-500 text-xs mt-1 block">Obrigatório</span>}
          {apiErrors.federativeunit && <span className="text-red-500 text-xs mt-1 block">{apiErrors.federativeunit}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Usuário Administrador</h2>
        <p className="text-gray-500 mt-1">Crie a primeira conta com acesso total ao painel da empresa.</p>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3 mb-6">
        <ShieldAlert className="text-orange-500 mt-0.5 flex-shrink-0" size={20} />
        <div>
          <h4 className="font-medium text-orange-900 text-sm">Acesso Master</h4>
          <p className="text-orange-700/80 text-xs mt-1">
            Este usuário será o responsável por gerenciar a plataforma e convidar novos membros.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.username) || apiErrors.username ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            Nome Completo *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
              <User size={18} />
            </div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={getInputClass(formData.username, "username") + " pl-10"}
              placeholder="Nome do administrador"
            />
          </div>
          {showErrors && !formData.username && <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>}
          {apiErrors.username && <span className="text-red-500 text-xs mt-1 block">{apiErrors.username}</span>}
        </div>

        <div className="group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.dateOfBirth) || apiErrors.dateOfBirth ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            Data de Nascimento
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={getInputClass(formData.dateOfBirth, "dateOfBirth") + " pl-10"}
          />
          {showErrors && !formData.dateOfBirth && <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>}
          {apiErrors.dateOfBirth && <span className="text-red-500 text-xs mt-1 block">{apiErrors.dateOfBirth}</span>}
        </div>

        <div className="md:col-span-2 group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.emailUser) || apiErrors.emailUser ? "text-red-500" : "text-gray-700 group-focus-within:text-orange-600 transition-colors"}`}>
            E-mail de Acesso *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
              <Mail size={18} />
            </div>
            <input
              type="email"
              name="emailUser"
              value={formData.emailUser}
              onChange={handleChange}
              className={getInputClass(formData.emailUser, "emailUser") + " pl-10"}
              placeholder="admin@empresa.com"
            />
          </div>
          {showErrors && !formData.emailUser && <span className="text-red-500 text-xs mt-1 block">Este campo é obrigatório</span>}
          {apiErrors.emailUser && <span className="text-red-500 text-xs mt-1 block">{apiErrors.emailUser}</span>}
        </div>

        <div className="group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && !formData.password) || apiErrors.password ? 'text-red-500' : 'text-gray-700'}`}>
            Senha Inicial *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
              <Lock size={18} />
            </div>
            <input 
              type="password" name="password" value={formData.password} onChange={handleChange}
              className={getInputClass(formData.password, "password") + " pl-10"}
              placeholder="••••••••"
            />
          </div>
          {showErrors && !formData.password && <span className="text-red-500 text-xs mt-1 font-medium block">Este campo é obrigatório</span>}
          {apiErrors.password && <span className="text-red-500 text-xs mt-1 font-medium block">{apiErrors.password}</span>}
        </div>

        <div className="group">
          <label className={`block text-sm font-semibold mb-2 ${(showErrors && (!formData.confirmPassword || !passwordsMatch)) || apiErrors.confirmPassword ? 'text-red-500' : 'text-gray-700'}`}>
            Confirmar Senha *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500">
              <Lock size={18} />
            </div>
            <input 
              type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              className={`${getInputClass(formData.confirmPassword, "confirmPassword")} pl-10 ${showErrors && !passwordsMatch ? 'border-red-500 bg-red-50' : ''}`}
              placeholder="••••••••"
            />
          </div>
          {showErrors && (
            <>
              {!formData.confirmPassword && <span className="text-red-500 text-xs mt-1 font-medium block">Este campo é obrigatório</span>}
              {formData.confirmPassword && !passwordsMatch && <span className="text-red-500 text-xs mt-1 font-medium block">As senhas não coincidem</span>}
            </>
          )}
          {apiErrors.confirmPassword && <span className="text-red-500 text-xs mt-1 font-medium block">{apiErrors.confirmPassword}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Revise os Dados</h2>
        <p className="text-gray-500 mt-1">Verifique se as informações estão corretas antes de finalizar.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
            <Building className="text-orange-500" size={20} />
            <h3 className="font-bold text-gray-800">Empresa</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <span className="block text-gray-500 mb-1">Razão Social</span>
              <span className="font-medium text-gray-900">{formData.reasonName || "Não informado"}</span>
            </div>
            <div>
              <span className="block text-gray-500 mb-1">CNPJ</span>
              <span className="font-medium text-gray-900">{formData.registrationNumber || "Não informado"}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-gray-500 mb-1">Endereço</span>
              <span className="font-medium text-gray-900">
                {formData.street}, {formData.number} - {formData.neighborhood}, {formData.city}/{formData.federativeunit}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
            <User className="text-orange-500" size={20} />
            <h3 className="font-bold text-gray-800">Administrador</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <span className="block text-gray-500 mb-1">Nome</span>
              <span className="font-medium text-gray-900">{formData.username || "Não informado"}</span>
            </div>
            <div>
              <span className="block text-gray-500 mb-1">E-mail de Acesso</span>
              <span className="font-medium text-gray-900">{formData.emailUser || "Não informado"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <div className="hidden lg:flex w-1/3 max-w-md bg-orange-600 text-white flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="absolute -top-20 -left-20 w-96 h-96">
            <circle cx="200" cy="200" r="200" fill="white" />
          </svg>
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="absolute -bottom-20 -right-20 w-96 h-96">
            <circle cx="200" cy="200" r="200" fill="white" />
          </svg>
        </div>

        <div className="p-10 relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-lg">
              <Building2 size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight">ENGER</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Novo Cadastro</h1>
          <p className="text-orange-100 mb-12">Adicione uma nova empresa à plataforma seguindo os passos abaixo.</p>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-start gap-4 relative">
                  {index < steps.length - 1 && (
                    <div className={`absolute top-10 left-5 w-0.5 h-12 -ml-[1px] ${isCompleted ? "bg-orange-300" : "bg-orange-800/30"}`}></div>
                  )}

                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300
                    ${
                      isActive
                        ? "bg-white border-white text-orange-600 shadow-lg scale-110"
                        : isCompleted
                          ? "bg-orange-500 border-orange-400 text-white"
                          : "bg-transparent border-orange-400 text-orange-200"
                    }
                  `}
                  >
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
                  </div>

                  <div className="pt-1">
                    <h3 className={`font-semibold text-lg transition-colors duration-300 ${isActive ? "text-white" : isCompleted ? "text-orange-50" : "text-orange-200"}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mt-0.5 transition-colors duration-300 ${isActive ? "text-orange-100" : "text-orange-300/60"}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        <div className="lg:hidden bg-orange-600 text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-2">
            <Building2 size={20} />
            <span className="font-bold">Cadastro</span>
          </div>
          <div className="text-sm font-medium bg-orange-700 px-3 py-1 rounded-full text-white">
            Passo {currentStep} de {totalSteps}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-10 lg:px-12 lg:py-16">
            <form onSubmit={handleSubmit}>
              <div className="min-h-[400px]">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
              </div>

              {globalError && currentStep === 4 && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2 animate-in fade-in">
                  <ShieldAlert size={20} className="flex-shrink-0" />
                  {globalError}
                </div>
              )}

              <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  className={`px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center gap-2 ${currentStep === 1 ? "opacity-0 pointer-events-none" : ""}`}
                >
                  <ChevronLeft size={20} /> Voltar
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 flex items-center gap-2"
                  >
                    Próximo Passo <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>Processando...</>
                    ) : (
                      <>
                        <CheckCircle2 size={18} /> Confirmar Cadastro
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistration;