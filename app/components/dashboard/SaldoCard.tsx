'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaWallet, FaSpinner, FaSyncAlt, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { useTranslations } from '@/app/contexts/LanguageContext';
import { LoadingSpinner } from '../LoadingSpinner';

interface UserData {
  matricula: string;
  nome: string;
  empregador: string;
  cartao: string;
  limite: string;
  [key: string]: string;
}

interface SaldoData {
  saldo: number;
  limite: number;
  total: number;
  mesCorrente: string;
}

export default function SaldoCard() {
  const [loading, setLoading] = useState(true);
  const [saldoData, setSaldoData] = useState<SaldoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cartao, setCartao] = useState('');
  const [retryAttempts, setRetryAttempts] = useState(0);
  const translations = useTranslations('SaldoCard');

  // Detectar se é dispositivo móvel
  const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Função para buscar o mês corrente com timeout ajustado para mobile
  const fetchMesCorrente = useCallback(async () => {
    try {
      if (!cartao) {
        console.error('[SaldoCard] Cartão não fornecido para buscar mês corrente');
        return null;
      }

      console.log('[SaldoCard] Buscando mês corrente para cartão:', cartao);
      
      // Timeout maior para dispositivos móveis
      const timeout = isMobile ? 15000 : 10000;
      
      const formData = new FormData();
      formData.append('cartao', cartao.trim());
      
      const response = await axios.post('/api/mes-corrente', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout
      });
      
      console.log('[SaldoCard] Resposta da API de mês corrente:', response.data);
      
      // A API agora sempre retorna um array com pelo menos um item
      if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].abreviacao) {
        const mesAtual = response.data[0].abreviacao;
        console.log('[SaldoCard] Mês corrente obtido:', mesAtual);
        return mesAtual;
      } else {
        // Fallback local mais robusto
        return gerarMesCorrenteLocal();
      }
    } catch (err) {
      console.error('[SaldoCard] Erro ao buscar mês corrente:', err);
      // Sempre retornar fallback local em caso de erro
      return gerarMesCorrenteLocal();
    }
  }, [cartao, isMobile]);

  // Função para gerar mês corrente local
  const gerarMesCorrenteLocal = () => {
    const dataAtual = new Date();
    const mes = dataAtual.getMonth();
    const ano = dataAtual.getFullYear();
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const mesAtual = `${meses[mes]}/${ano}`;
    console.log('[SaldoCard] Usando mês local:', mesAtual);
    return mesAtual;
  };

  // Função para buscar os dados da conta e calcular o saldo com melhor tratamento de erro
  const fetchConta = useCallback(async (matricula: string, empregador: string, mes: string) => {
    try {
      console.log('[SaldoCard] Buscando conta:', { matricula, empregador, mes });
      
      // Timeout maior para dispositivos móveis
      const timeout = isMobile ? 20000 : 15000;
      
      // Primeiro, validar se temos dados do associado
      if (!matricula || !empregador) {
        console.log('[SaldoCard] Buscando dados do associado primeiro...');
        
        const formDataAssociado = new FormData();
        formDataAssociado.append('cartao', cartao.trim());
        
        const associadoResponse = await axios.post('/api/localiza-associado', formDataAssociado, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout
        });

        if (!associadoResponse.data || !associadoResponse.data.matricula) {
          throw new Error(translations.error_associate_data_not_found || 'Dados do associado não encontrados');
        }

        matricula = associadoResponse.data.matricula;
        empregador = associadoResponse.data.empregador;
        console.log('[SaldoCard] Dados do associado obtidos:', { matricula, empregador });
      }

      // Agora buscar os dados da conta
      const formDataConta = new FormData();
      formDataConta.append('matricula', matricula);
      formDataConta.append('empregador', empregador.toString());
      formDataConta.append('mes', mes);
      
      const response = await axios.post('/api/conta', formDataConta, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout
      });
      
      console.log('[SaldoCard] Resposta da API conta:', response.data);
      
      if (Array.isArray(response.data)) {
        // Calcular o total das contas
        let total = 0;
        for (const item of response.data) {
          const valor = parseFloat(item.valor || '0');
          if (!isNaN(valor)) {
            total += valor;
          }
        }
        console.log('[SaldoCard] Total calculado:', total);
        return total;
      } else {
        console.log('[SaldoCard] Resposta não é array, assumindo total 0');
        return 0; // Se não é array, assumir que não há gastos
      }
    } catch (error) {
      console.error('[SaldoCard] Erro ao buscar dados da conta:', error);
      
      // Em caso de erro, retornar 0 para não bloquear a exibição do limite
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.log('[SaldoCard] Timeout - assumindo total 0');
          return 0;
        }
      }
      
      throw error;
    }
  }, [cartao, translations, isMobile]);

  // Função principal para carregar todos os dados com retry automático
  const loadSaldoData = useCallback(async (isRetry = false) => {
    if (!userData && !isRetry) {
      console.log('[SaldoCard] Aguardando dados do usuário...');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[SaldoCard] Iniciando carregamento de dados de saldo');
      
      // 1. Buscar mês corrente (sempre com fallback)
      const mesAtual = await fetchMesCorrente();
      
      if (!mesAtual) {
        throw new Error(translations.error_current_month_not_available || 'Mês corrente não disponível');
      }
      
      // 2. Buscar dados da conta (com fallback para 0)
      let total = 0;
      try {
        total = await fetchConta(userData?.matricula || '', userData?.empregador || '', mesAtual);
      } catch (contaError) {
        console.warn('[SaldoCard] Erro ao buscar conta, usando total 0:', contaError);
        total = 0; // Fallback para mostrar pelo menos o limite
      }
      
      // 3. Calcular saldo
      const limite = parseFloat(userData?.limite || '0');
      const saldo = limite - total;
      
      console.log('[SaldoCard] Dados finais calculados:', { limite, total, saldo, mesAtual });
      
      // 4. Atualizar o estado
      setSaldoData({
        saldo,
        limite,
        total,
        mesCorrente: mesAtual
      });
      
      // Reset retry attempts on success
      setRetryAttempts(0);
      
    } catch (error) {
      console.error('[SaldoCard] Erro ao carregar dados de saldo:', error);
      
      // Implementar retry automático para dispositivos móveis
      if (isMobile && retryAttempts < 2) {
        console.log(`[SaldoCard] Tentativa ${retryAttempts + 1}/3 - Tentando novamente em 3 segundos...`);
        setRetryAttempts(prev => prev + 1);
        
        setTimeout(() => {
          loadSaldoData(true);
        }, 3000);
        
        return;
      }
      
      if (error instanceof Error) {
        setError((translations.error_load_balance_with_message || 'Não foi possível carregar o saldo: {message}').replace('{message}', error.message));
      } else {
        setError(translations.error_load_balance_generic || 'Não foi possível carregar o saldo. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [userData, fetchMesCorrente, fetchConta, translations, isMobile, retryAttempts]);

  // Carregar dados do usuário do localStorage com debugging melhorado
  useEffect(() => {
    console.log('[SaldoCard] useEffect para carregar usuário INICIOU');
    console.log('[SaldoCard] Dispositivo móvel detectado:', isMobile);
    
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('saspy_user');
      console.log('[SaldoCard] Dados do localStorage:', storedUser ? 'Encontrados' : 'Não encontrados');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('[SaldoCard] Usuário parseado com sucesso:', {
            cartao: parsedUser.cartao ? 'Presente' : 'Ausente',
            matricula: parsedUser.matricula ? 'Presente' : 'Ausente',
            nome: parsedUser.nome ? 'Presente' : 'Ausente',
            limite: parsedUser.limite ? 'Presente' : 'Ausente'
          });
          
          setUserData(parsedUser);
          setCartao(parsedUser.cartao);
        } catch (parseError) {
          console.error('[SaldoCard] Erro ao fazer parse do usuário:', parseError);
          setError(translations?.error_user_data_corrupted || 'Dados do usuário corrompidos. Faça login novamente.');
          setLoading(false);
        }
      } else {
        console.warn('[SaldoCard] Nenhum usuário encontrado no localStorage');
        setError(translations?.error_user_not_found || 'Usuário não encontrado. Faça login novamente.');
        setLoading(false);
      }
    } else {
      console.warn('[SaldoCard] window não definido');
      setError('Ambiente não suportado');
      setLoading(false);
    }
  }, [translations, isMobile]);

  // Carregar dados de saldo quando o usuário estiver disponível
  useEffect(() => {
    if (userData && userData.cartao) {
      console.log('[SaldoCard] Dados do usuário disponíveis, carregando saldo...');
      loadSaldoData();
    }
  }, [userData, loadSaldoData]);

  // Formatar valor para exibição em Guarani Paraguaio
  const formatCurrency = (value: number) => {
    return `₲ ${value.toFixed(2)}`;
  };

  // Se as traduções não estiverem prontas, mostrar spinner
  if (!translations) {
    console.log('[SaldoCard] Aguardando traduções...');
    return <LoadingSpinner />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg h-60">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-gray-600">{translations.loading_balance || 'Carregando saldo...'}</p>
        {retryAttempts > 0 && (
          <p className="text-sm text-amber-600 mt-2">
            Tentativa {retryAttempts}/3
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <div className="text-red-500 mb-2 font-semibold">{translations.error_title || 'Erro'}</div>
        <p className="text-gray-700 mb-2">{error}</p>
        {isMobile && (
          <p className="text-sm text-amber-600 mb-4">
            Detectado dispositivo móvel. Tentativas de reconexão automática estão ativas.
          </p>
        )}
        <button 
          onClick={() => {
            setRetryAttempts(0);
            loadSaldoData();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {translations.retry_button || 'Tentar novamente'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-600 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <FaWallet className="text-white text-2xl mr-3" />
          <h2 className="text-xl font-bold text-white">{translations.card_title || 'Seu Saldo'}</h2>
        </div>
        
        <button 
          onClick={() => loadSaldoData()}
          className="bg-blue-700 hover:bg-blue-800 p-2 rounded text-white transition-colors"
          title={translations.refresh_balance_tooltip || 'Atualizar saldo'}
        >
          <FaSyncAlt />
        </button>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-1">{translations.available_balance_label || 'Saldo Disponível'}</p>
          <p className="text-3xl font-bold text-gray-800">
            {saldoData ? formatCurrency(saldoData.saldo) : '₲ 0.00'}
          </p>
          {saldoData?.mesCorrente && (
            <p className="text-sm text-gray-500 mt-1">
              {translations.month_reference_label || 'Referente ao mês:'} {saldoData.mesCorrente}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm mb-1">{translations.total_limit_label || 'Limite Total'}</p>
            <p className="text-xl font-semibold text-gray-700">
              {saldoData ? formatCurrency(saldoData.limite) : '₲ 0.00'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">{translations.total_used_label || 'Total Utilizado'}</p>
            <p className="text-xl font-semibold text-gray-700">
              {saldoData ? formatCurrency(saldoData.total) : '₲ 0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Seção de Informações Adicionais sobre o Saldo */}
      <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center mb-4">
          <FaInfoCircle className="text-blue-500 text-xl mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">
            {translations.info_title || 'Informações sobre seu saldo'}
          </h3>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100 shadow-sm">
          <p className="text-gray-700 leading-relaxed">
            {translations.info_description || 'O saldo apresentado é baseado no limite disponível para o mês atual. O cálculo é feito subtraindo os gastos do período do seu limite total.'}
          </p>
        </div>

        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 shadow-sm">
          <div className="flex items-start mb-3">
            <div className="bg-amber-100 rounded-full p-2 mr-3 flex-shrink-0">
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-md font-semibold text-amber-800 mb-2">
                {translations.attention_title || 'Atenção'}
              </h4>
              <div className="space-y-2 text-sm text-amber-700">
                <p>
                  {translations.attention_processing_time || 'Algumas transações podem levar até 24 horas para serem processadas. Para obter informações atualizadas, utilize o botão de atualização.'}
                </p>
                <p>
                  {translations.attention_doubts || 'Se você tiver dúvidas sobre seus gastos, consulte a seção de "Extrato" para ver detalhes de todas as suas transações.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 