'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { 
  RotateCcw, CreditCard, Check, Zap, ArrowRight, 
  ShieldCheck, Lock, Sparkles, AlertCircle
} from 'lucide-react';
import api from '@/services/api';
import Script from 'next/script';

// Tipagens para o TypeScript
interface PaymentData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

type SubscriptionType = {
  subscriptionTypeId: number;
  descriptionSubscriptionType: string;
  subscriptionValue: number;
};

const ReactivateSubscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<number>();
  const [planoAnteriorId, setPlanoAnteriorId] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [subscriptionsType, setSubscriptionsType] = useState<SubscriptionType[]>([]);

  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // 1. Resgata os dados salvos pelo login no sessionStorage
        const userSession = sessionStorage.getItem('enger_user');
        let idPlanoAnterior = null;

        if (userSession) {
          const userData = JSON.parse(userSession);
          idPlanoAnterior = userData.subscriptionTypeId; 
          if (idPlanoAnterior) {
            setPlanoAnteriorId(idPlanoAnterior);
          }
        }

        // 2. Carrega as opções de planos do banco C#
        const response = await api.get("/tipo_assinatura"); 
        setSubscriptionsType(response.data);
        
        // 3. Seleciona o plano anterior do cliente automaticamente se ele constar na lista
        if (response.data && response.data.length > 0) {
          const possuiPlanoIgual = response.data.some((p: any) => p.subscriptionTypeId === idPlanoAnterior);

          if (idPlanoAnterior && possuiPlanoIgual) {
            setSelectedPlan(idPlanoAnterior);
          } else {
            setSelectedPlan(response.data[0].subscriptionTypeId);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
      }
    };

    carregarDados();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'cardNumber') val = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    if (name === 'expiryDate') val = value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5);
    if (name === 'cvv') val = value.replace(/\D/g, '').slice(0, 4);
    
    setPaymentData(prev => ({ ...prev, [name]: val }));
  };

  const currentPlan = subscriptionsType.find(p => p.subscriptionTypeId === selectedPlan);
  
  // Trava de renderização segura (aguarda resposta assíncrona)
  if (!currentPlan) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center font-sans text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Carregando planos de reativação...</p>
        </div>
      </div>
    );
  }

  // 🟢 ALTERAÇÃO: O valor total agora reflete puramente o valor do banco, sem contas de faturamento
  const totalAmount = currentPlan.subscriptionValue;

  const isFormValid = 
    paymentData.cardNumber.length === 19 &&
    paymentData.cardName.trim().length > 2 &&
    paymentData.expiryDate.length === 5 &&
    paymentData.cvv.length >= 3;

  // 🚀 INTERCEPTAÇÃO E ENVIO REAL DO GATEWAY DE PAGAMENTO (MERCADO PAGO)
  const handleReactivate = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (!(window as any).MercadoPago) {
        throw new Error("O gateway do Mercado Pago ainda não inicializou na janela. Tente novamente.");
      }

      const mp = new (window as any).MercadoPago('APP_USR-59d69daf-48d3-4d3a-b474-52926b2c3b95');

      const [expiryMonth, expiryYear] = paymentData.expiryDate.split('/');
      const fullYear = `20${expiryYear}`;

      const cardTokenResponse = await mp.createCardToken({
        cardNumber: paymentData.cardNumber.replace(/\D/g, ''),
        cardHolderName: paymentData.cardName,
        cardExpirationMonth: expiryMonth,
        cardExpirationYear: fullYear,
        securityCode: paymentData.cvv,
      });

      if (!cardTokenResponse || !cardTokenResponse.id) {
        throw new Error("Falha na geração do token. Dados do cartão inválidos.");
      }

      const cardTokenObtido = cardTokenResponse.id;

      const payloadEnvio = {
        subscriptionTypeId: selectedPlan,
        cardRequestDTO: {
          cardToken: cardTokenObtido
        }
      };

      let companyId = null;
      const userSession = sessionStorage.getItem('enger_user');
      if (userSession) {
        companyId = JSON.parse(userSession).companyId;
      }
      if (!companyId) {
        companyId = localStorage.getItem('enger_nova_empresa_id');
      }

      if (!companyId) {
        throw new Error("Identificador da empresa ausente nesta sessão.");
      }

      await api.post(`/assinatura/${companyId}`, payloadEnvio);

      document.cookie = "enger_assinatura_expirada=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      document.cookie = "enger_cadastro_pendente=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      
      setIsSuccess(true);

    } catch (error: any) {
      console.error("Erro na reativação da assinatura:", error);
      alert(error.message || "Erro ao processar a reativação. Verifique os dados.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Sparkles size={48} className="text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Você está de volta!</h2>
          <p className="text-gray-500 leading-relaxed">
            Sua conta na <span className="font-bold text-orange-600">ENGER</span> foi reativada com sucesso. Todos os seus dados de obras e orçamentos já estão disponíveis.
          </p>
          <button 
            onClick={() => window.location.href = "/dashboard"}
            className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
          >
            Acessar meu Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-['Inter',sans-serif] text-gray-900 antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
      
      <nav className="h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <div className="text-3xl font-black tracking-tighter text-zinc-900">
            ENGER<span className="text-orange-500">.</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Lock size={16} />
          <span>Checkout Seguro MP</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold mb-4 uppercase tracking-widest">
            <RotateCcw size={14} /> Reativar Conta
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Que bom ter você de volta!</h1>
          <p className="text-gray-500 mt-2 text-lg">Reative sua assinatura agora e continue gerindo suas obras com eficiência.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* SELEÇÃO DE PLANOS */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Escolha o seu plano</h3>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                >
                  Mensal
                </button>
                <button 
                   onClick={() => setBillingCycle('yearly')}
                   className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${billingCycle === 'yearly' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
                >
                  Anual (-20%)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {subscriptionsType.map((plan) => {
                // 🟢 ALTERAÇÃO: Removida a conta do displayPrice. Mostra o valor puro vindo da API do C#
                const displayPrice = plan.subscriptionValue;

                return (
                  <div 
                    key={plan.subscriptionTypeId}
                    onClick={() => setSelectedPlan(plan.subscriptionTypeId)}
                    className={`
                      relative p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 flex items-center justify-between group
                      ${selectedPlan === plan.subscriptionTypeId ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100 bg-white hover:border-orange-200'}
                    `}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedPlan === plan.subscriptionTypeId ? 'bg-orange-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-orange-100'}`}>
                        <Zap size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg text-gray-900">{plan.descriptionSubscriptionType}</h4>
                          {planoAnteriorId === plan.subscriptionTypeId && (
                            <span className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                              Seu plano anterior
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Faturamento selecionado</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-xs font-bold text-gray-400">R$</span>
                        <span className="text-2xl font-black text-gray-900">{displayPrice.toFixed(2)}</span>
                      </div>
                      {/* 🟢 ALTERAÇÃO: Removido o rótulo fixo de faturamento por extenso */}
                    </div>

                    {selectedPlan === plan.subscriptionTypeId && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-orange-600 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Benefícios */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h5 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                O que inclui no plano {currentPlan.descriptionSubscriptionType}:
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                    <Check size={12} />
                  </div>
                  Acesso completo a todos os módulos ativos
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                    <Check size={12} />
                  </div>
                  Suporte prioritário da equipe técnica
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                    <Check size={12} />
                  </div>
                  Histórico de obras e relatórios preservados
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                    <Check size={12} />
                  </div>
                  Backups diários automatizados e segurança SSL
                </div>
              </div>
            </div>
          </div>

          {/* FORMULÁRIO E RESUMO DE PAGAMENTO */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-50 rounded-full opacity-50"></div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-8 relative z-10">Confirmar Reativação</h3>

              <div className="space-y-4 mb-8 relative z-10">
                <div className="group">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Número do Cartão</label>
                  <div className="relative">
                    <input 
                      type="text" name="cardNumber" value={paymentData.cardNumber} onChange={handleInputChange}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-mono text-sm"
                    />
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome Impresso no Cartão</label>
                  <input 
                    type="text" name="cardName" value={paymentData.cardName} onChange={handleInputChange}
                    placeholder="NOME COMO ESTÁ NO CARTÃO"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all uppercase text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Validade</label>
                    <input 
                      type="text" name="expiryDate" value={paymentData.expiryDate} onChange={handleInputChange}
                      placeholder="MM/AA"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all font-mono text-sm"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">CVV</label>
                    <input 
                      type="text" name="cvv" value={paymentData.cvv} onChange={handleInputChange}
                      placeholder="123"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8 pt-6 border-t border-gray-50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Plano Selecionado</span>
                  <span className="font-bold text-gray-900">{currentPlan.descriptionSubscriptionType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Ciclo de Cobrança</span>
                  <span className="font-bold text-orange-600">{billingCycle === 'monthly' ? 'Mensal' : 'Anual'}</span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-gray-50">
                  <div>
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total a pagar</span>
                    {/* 🟢 ALTERAÇÃO: Exibe o valor bruto direto do banco sem alterações */}
                    <span className="text-3xl font-black text-gray-900">R$ {totalAmount.toFixed(2)}</span>
                  </div>
                  {/* 🟢 ALTERAÇÃO: Removido o indicador de faturamento fixo lateral */}
                </div>
              </div>

              <button
                onClick={handleReactivate}
                disabled={isProcessing || !isFormValid}
                className={`
                  w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                  ${isProcessing || !isFormValid 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:scale-[0.98]'
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    {isFormValid ? 'Reativar Minha Conta' : 'Preencha os Dados'}
                    <ArrowRight size={20} className={!isFormValid ? 'opacity-50' : ''} />
                  </>
                )}
              </button>

              <div className="mt-6 flex flex-col items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-green-500" />
                  Ambiente 100% Seguro
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={12} />
                  Dados Criptografados SSL
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-gray-100 mt-20 text-center">
        <p className="text-xs font-bold text-gray-300 uppercase tracking-[0.2em]">ENGER Enterprise • Gestão de Alta Performance</p>
      </footer>
      
      <Script 
        src="https://sdk.mercadopago.com/js/v2" 
        strategy="afterInteractive"
        onLoad={() => console.log("Mercado Pago SDK carregado na Reativação")}
      />
    </div>
  );
};

export default ReactivateSubscription;