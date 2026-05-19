'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { 
  CreditCard, Check, ShieldCheck, Lock, 
  ArrowRight, Zap, CheckCircle2, AlertCircle
} from 'lucide-react';
import api from '@/services/api';
import Script from 'next/script';

// Tipagens para o TypeScript
interface PaymentData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  document: string;
}

type SubscriptionType = {
  subscriptionTypeId: number;
  descriptionSubscriptionType: string;
  subscriptionValue: number;
};

type BillingCycle = 'monthly' | 'yearly';

const SubscriptionPayment = () => {
  const [selectedPlan, setSelectedPlan] = useState<number>();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [subscriptionsType, setSubscriptionsType] = useState<SubscriptionType[]>([]);

  // Form State tipado
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    document: ''
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const response = await api.get("/tipo_assinatura"); // Rota do C#
        setSubscriptionsType(response.data);
        
        // Seleciona o primeiro plano automaticamente assim que os dados chegam
        if (response.data && response.data.length > 0) {
          setSelectedPlan(response.data[0].subscriptionTypeId);
        }
      } catch (error) {
        console.error("Erro ao buscar:", error);
      }
    };

    carregarDados();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Máscaras simples
    let formattedValue = value;
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const getSelectedPlanDetails = () => {
    return subscriptionsType.find(p => p.subscriptionTypeId === selectedPlan); 
  };

  const handleCheckout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // 1. Garante que o SDK do Mercado Pago está disponível na janela do navegador
      if (!(window as any).MercadoPago) {
        alert("O sistema de pagamento ainda está carregando. Aguarde um instante.");
        setIsProcessing(false);
        return;
      }

      // 2. Inicializa o Mercado Pago (Substitua pela sua Credencial Pública de Teste do painel do Mercado Pago)
      const mp = new (window as any).MercadoPago('APP_USR-59d69daf-48d3-4d3a-b474-52926b2c3b95');

      // 3. Separa a data de expiração (MM/AA) para o formato do Mercado Pago
      const [expiryMonth, expiryYear] = paymentData.expiryDate.split('/');
      // Converte o ano de 2 dígitos (ex: 26) para 4 dígitos (ex: 2026)
      const fullYear = `20${expiryYear}`; 

      // 4. Cria o Token do Cartão direto na API do Mercado Pago
      const cardTokenResponse = await mp.createCardToken({
        cardNumber: paymentData.cardNumber.replace(/\D/g, ''),
        cardHolderName: paymentData.cardName,
        cardExpirationMonth: expiryMonth,
        cardExpirationYear: fullYear,
        securityCode: paymentData.cvv,
      });

      // Se o Mercado Pago não devolver o token, algo deu errado com os dados do cartão
      if (!cardTokenResponse || !cardTokenResponse.id) {
        throw new Error("Não foi possível gerar o token do cartão. Verifique os dados.");
      }

      const cardTokenObtido = cardTokenResponse.id;

      // 5. Monta o JSON (DTO) exatamente no formato que o seu backend C# espera
      const payloadEnvio = {
        subscriptionTypeId: selectedPlan, // O ID do plano selecionado
        cardRequestDTO: {
          cardToken: cardTokenObtido // O Token gerado pelo Mercado Pago
        }
      };

      // 6. Envia para o seu endpoint C# salvar no banco e processar a cobrança
      // Passamos o ID da empresa guardado no localStorage nos headers ou na URL se seu endpoint exigir
      const companyId = localStorage.getItem('enger_nova_empresa_id');
      
      await api.post(`/assinatura/${companyId}`, payloadEnvio);

      // Sucesso! Limpa o ID da empresa do cache e avança
      localStorage.removeItem('enger_nova_empresa_id');
      setIsSuccess(true);

    } catch (error: any) {
      console.error("Erro no fluxo de pagamento:", error);
      alert(error.message || "Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPlan = getSelectedPlanDetails();

  // Se o pagamento deu certo, mostra a tela de sucesso
  if (isSuccess && currentPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl shadow-gray-200/50 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pagamento Aprovado!</h2>
          <p className="text-gray-600 mb-8">
            Sua assinatura do plano <span className="font-semibold text-orange-600">{currentPlan.descriptionSubscriptionType}</span> foi ativada com sucesso.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            Ir para o Dashboard
          </button>
        </div>
      </div>
    );
  }

  // TRAVA DE SEGURANÇA: Mostra carregamento enquanto a API não responde
  if (!currentPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium">Carregando planos disponíveis...</p>
        </div>
      </div>
    );
  }

  // Calcula o valor total com base no ciclo de faturamento (Mensal x Anual)
  const totalAmount = billingCycle === 'monthly' 
    ? currentPlan.subscriptionValue 
    : currentPlan.subscriptionValue * 12 * 0.8; // Anual tem 20% de desconto

  const isFormValid = 
    paymentData.cardNumber.length === 19 &&
    paymentData.cardName.trim().length > 2 &&
    paymentData.expiryDate.length === 5 &&
    paymentData.cvv.length >= 3;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* Header Simples */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="text-3xl font-black tracking-tighter text-zinc-900">
            ENGER<span className="text-orange-500">.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Lock size={16} />
          <span>Checkout Seguro</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Coluna Esquerda: Planos e Pagamento */}
          <div className="xl:col-span-8 space-y-12">
            
            {/* Secão de Planos */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <Zap size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Escolha seu Plano</h2>
                  <p className="text-gray-500 mt-1">Selecione a opção que melhor atende à sua empresa.</p>
                </div>
              </div>

              {/* Grid de Planos - Mais compacto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionsType.map((plan) => {
                  // Calcula o preço a ser exibido no card do plano (Mensal ou Mensal com desc. Anual)
                  const displayPrice = billingCycle === 'monthly' 
                    ? plan.subscriptionValue 
                    : plan.subscriptionValue * 0.8;

                  return (
                    <div 
                      key={plan.subscriptionTypeId}
                      onClick={() => setSelectedPlan(plan.subscriptionTypeId)}
                      className={`
                        relative bg-white rounded-2xl p-4 md:p-5 cursor-pointer border-2 transition-all duration-200
                        ${selectedPlan === plan.subscriptionTypeId 
                          ? 'border-orange-500 shadow-lg shadow-orange-500/10 scale-[1.02] z-10' 
                          : 'border-transparent hover:border-orange-200 shadow-sm'}
                      `}
                    >
                      <h3 className="text-base font-bold text-gray-900 mb-1">{plan.descriptionSubscriptionType}</h3>
                      <p className="text-xs text-gray-500 h-8 mb-4 line-clamp-2">Plano ideal para o seu negócio.</p>
                      
                      <div className="mb-4 flex items-baseline gap-1">
                        <span className="text-xs font-semibold text-gray-500">R$</span>
                        <span className="text-3xl font-black text-gray-900">{displayPrice.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">/{plan.descriptionSubscriptionType.substring(0,4)}</span>
                      </div>

                      <div className="space-y-2.5">
                         {/* Lista estática por enquanto, já que a API não retornou features */}
                         <div className="flex items-start gap-2">
                           <Check size={14} className="text-orange-500 shrink-0 mt-0.5" />
                           <span className="text-xs text-gray-600 leading-tight">Acesso completo</span>
                         </div>
                         <div className="flex items-start gap-2">
                           <Check size={14} className="text-orange-500 shrink-0 mt-0.5" />
                           <span className="text-xs text-gray-600 leading-tight">Suporte online</span>
                         </div>
                      </div>

                      <div className={`
                        mt-5 w-full py-2 rounded-xl text-center text-xs font-semibold transition-colors
                        ${selectedPlan === plan.subscriptionTypeId ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600 group-hover:bg-gray-100'}
                      `}>
                        {selectedPlan === plan.subscriptionTypeId ? 'Selecionado' : 'Escolher plano'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Secão de Pagamento */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
               <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dados de Pagamento</h2>
                  <p className="text-gray-500 mt-1">Insira os dados do cartão de crédito para a assinatura.</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                
                {/* Cartão de Crédito Visual (Preview interativo) */}
                <div className="w-full max-w-[340px] h-[210px] mx-auto bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-2xl shadow-gray-900/20 relative overflow-hidden mb-8 transition-transform duration-300 hover:scale-[1.02]">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -ml-8 -mb-8"></div>

                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="w-12 h-8 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md flex flex-col justify-center gap-1 p-1 opacity-90 shadow-sm border border-yellow-600/30">
                       <div className="w-full h-[1px] bg-black/20"></div>
                       <div className="w-full h-[1px] bg-black/20"></div>
                    </div>
                    <Zap size={20} className="text-gray-400 opacity-80" />
                  </div>

                  <div className="font-mono text-xl tracking-[0.15em] mb-6 relative z-10 text-gray-100 h-7 flex items-center">
                    {paymentData.cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end relative z-10">
                    <div className="flex-1 pr-4">
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-semibold">Titular do Cartão</div>
                      <div className="font-medium text-sm uppercase tracking-widest truncate text-gray-200">
                        {paymentData.cardName || 'NOME IMPRESSO'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-semibold">Validade</div>
                      <div className="font-mono text-sm tracking-widest text-gray-200">
                        {paymentData.expiryDate || 'MM/AA'}
                      </div>
                    </div>
                  </div>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="md:col-span-2 group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">Número do Cartão</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <CreditCard size={18} />
                      </div>
                      <input 
                        type="text" 
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">Nome Impresso no Cartão</label>
                    <input 
                      type="text"
                      name="cardName"
                      value={paymentData.cardName}
                      onChange={handleInputChange}
                      placeholder="NOME COMO ESTÁ NO CARTÃO"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all uppercase"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">Validade</label>
                    <input 
                      type="text"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors flex items-center gap-1">
                      CVV
                      <span className="text-gray-400 cursor-help" title="Código de 3 ou 4 dígitos no verso do cartão">
                        <AlertCircle size={14} />
                      </span>
                    </label>
                    <input 
                      type="text"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                    />
                  </div>
                </form>
              </div>
            </section>
          </div>

          {/* Coluna Direita: Resumo Fixo */}
          <div className="xl:col-span-4">
            <div className="sticky top-24 bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Resumo do Pedido</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plano selecionado</span>
                  <span className="font-semibold text-gray-900">{currentPlan.descriptionSubscriptionType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Faturamento</span>
                  <span className="font-semibold text-gray-900">{billingCycle === 'monthly' ? 'Mensal' : 'Anual (20% OFF)'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">R$ {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-base font-semibold text-gray-900">Total a pagar</span>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">{billingCycle === 'monthly' ? 'por mês' : 'por ano'}</div>
                    <div className="text-3xl font-black text-orange-600">
                      <span className="text-lg mr-1">R$</span>
                      {totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing || !isFormValid} // 👈 Trava se não for válido
                className={`
                  w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300
                  ${isProcessing || !isFormValid 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' // Visual cinza bloqueado
                    : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-600/30 active:scale-[0.98]' // Visual laranja liberado
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    {/* 👇 Muda o texto dependendo de estar preenchido ou não */}
                    {isFormValid ? 'Assinar Agora' : 'Preencha os Dados'} 
                    <ArrowRight size={20} className={!isFormValid ? 'opacity-50' : ''} />
                  </>
                )}
              </button>

              {/* Security Badges */}
              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <ShieldCheck size={16} className="text-green-500" />
                  <span>Pagamento 100% Seguro</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock size={16} className="text-gray-400" />
                  <span>Criptografia SSL</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Script 
        src="https://sdk.mercadopago.com/js/v2" 
        strategy="afterInteractive"
        onLoad={() => console.log("Mercado Pago SDK carregado")}
      />
    </div>
  );
};

export default SubscriptionPayment;