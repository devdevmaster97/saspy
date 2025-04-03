'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaWallet, FaSpinner, FaSyncAlt } from 'react-icons/fa';
import axios from 'axios';

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

  // Função para buscar o mês corrente
  const fetchMesCorrente = useCallback(async () => {
    try {
      if (!cartao) {
        console.error('Cartão não fornecido para buscar mês corrente');
        return null;
      }

      const formData = new FormData();
      formData.append('cartao', cartao.trim());
      
      console.log('Buscando mês corrente para cartão:', cartao);
      
      const response = await axios.post('/api/mes-corrente', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Resposta da API de mês corrente:', response.data);
      
      // A API agora sempre retorna um array com pelo menos um item
      if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].abreviacao) {
        const mesAtual = response.data[0].abreviacao;
        console.log('Mês corrente obtido:', mesAtual);
        return mesAtual;
      } else {
        // Em caso de problemas, usamos o mês atual
        const dataAtual = new Date();
        const mes = dataAtual.getMonth();
        const ano = dataAtual.getFullYear();
        const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const mesAtual = `${meses[mes]}/${ano}`;
        console.log('Usando mês atual como fallback:', mesAtual);
        return mesAtual;
      }
    } catch (err) {
      console.error('Erro ao buscar mês corrente:', err);
      // Em caso de erro, retornar o mês atual
      const dataAtual = new Date();
      const mes = dataAtual.getMonth();
      const ano = dataAtual.getFullYear();
      const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      const mesAtual = `${meses[mes]}/${ano}`;
      console.log('Usando mês atual como fallback após erro:', mesAtual);
      return mesAtual;
    }
  }, [cartao]);

  // Função para buscar os dados da conta e calcular o saldo
  const fetchConta = useCallback(async (matricula: string, empregador: string, mes: string) => {
    try {
      // Primeiro, buscar dados do associado
      const formDataAssociado = new FormData();
      formDataAssociado.append('cartao', cartao.trim());
      
      const associadoResponse = await axios.post('/api/localiza-associado', formDataAssociado, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!associadoResponse.data) {
        throw new Error('Dados do associado não encontrados');
      }

      const { matricula: matriculaAssociado, empregador: empregadorAssociado } = associadoResponse.data;

      // Agora buscar os dados da conta com os dados do associado
      const formDataConta = new FormData();
      formDataConta.append('matricula', matriculaAssociado);
      formDataConta.append('empregador', empregadorAssociado.toString());
      formDataConta.append('mes', mes);
      
      const response = await axios.post('/api/conta', formDataConta, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (Array.isArray(response.data)) {
        // Calcular o total das contas
        let total = 0;
        for (const item of response.data) {
          total += parseFloat(item.valor || '0');
        }
        
        return total;
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Erro ao buscar dados da conta:', error);
      throw error;
    }
  }, [cartao]);

  // Função principal para carregar todos os dados
  const loadSaldoData = useCallback(async () => {
    if (!userData) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // 1. Buscar mês corrente
      const mesAtual = await fetchMesCorrente();
      
      if (!mesAtual) {
        throw new Error('Mês corrente não disponível');
      }
      
      // 2. Buscar dados da conta
      const total = await fetchConta(userData.matricula, userData.empregador, mesAtual);
      
      // 3. Calcular saldo
      const limite = parseFloat(userData.limite || '0');
      const saldo = limite - total;
      
      // 4. Atualizar o estado
      setSaldoData({
        saldo,
        limite,
        total,
        mesCorrente: mesAtual
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados de saldo:', error);
      if (error instanceof Error) {
        setError(`Não foi possível carregar o saldo: ${error.message}`);
      } else {
        setError('Não foi possível carregar o saldo. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [userData, fetchMesCorrente, fetchConta]);

  // Carregar dados do usuário do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('qrcred_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        setCartao(parsedUser.cartao);
      } else {
        setError('Usuário não encontrado. Faça login novamente.');
        setLoading(false);
      }
    }
  }, []);

  // Carregar dados de saldo quando o usuário estiver disponível
  useEffect(() => {
    if (userData) {
      loadSaldoData();
    }
  }, [userData, loadSaldoData]);

  // Formatar valor para exibição em Reais
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg h-60">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <p className="text-gray-600">Carregando saldo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <div className="text-red-500 mb-2 font-semibold">Erro</div>
        <p className="text-gray-700">{error}</p>
        <button 
          onClick={loadSaldoData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-600 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <FaWallet className="text-white text-2xl mr-3" />
          <h2 className="text-xl font-bold text-white">Seu Saldo</h2>
        </div>
        
        <button 
          onClick={loadSaldoData}
          className="bg-blue-700 hover:bg-blue-800 p-2 rounded text-white transition-colors"
          title="Atualizar saldo"
        >
          <FaSyncAlt />
        </button>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-1">Saldo Disponível</p>
          <p className="text-3xl font-bold text-gray-800">
            {saldoData ? formatCurrency(saldoData.saldo) : 'R$ 0,00'}
          </p>
          {saldoData?.mesCorrente && (
            <p className="text-sm text-gray-500 mt-1">
              Referente ao mês: {saldoData.mesCorrente}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm mb-1">Limite Total</p>
            <p className="text-xl font-semibold text-gray-700">
              {saldoData ? formatCurrency(saldoData.limite) : 'R$ 0,00'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Total Utilizado</p>
            <p className="text-xl font-semibold text-gray-700">
              {saldoData ? formatCurrency(saldoData.total) : 'R$ 0,00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 