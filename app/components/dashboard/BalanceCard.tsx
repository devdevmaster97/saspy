'use client';

import { useState, useEffect } from 'react';
import { FaWallet, FaSpinner } from 'react-icons/fa';
import api from '@/app/lib/axios';

interface UserData {
  nome: string;
  cartao: string;
  limite: string;
  [key: string]: string;
}

interface BalanceData {
  saldo: string;
  limite: string;
  limiteAtual: string;
}

export default function BalanceCard() {
  const [loading, setLoading] = useState(true);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Carregar dados do usuário do localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('saspy_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        
        // Buscar saldo com o cartão do usuário
        fetchBalance(parsedUser.cartao);
      } else {
        setError('Usuário não encontrado. Faça login novamente.');
        setLoading(false);
      }
    }
  }, []);

  const fetchBalance = async (cardNumber: string) => {
    try {
      setLoading(true);
      
      // Formatar os dados para x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('cartao', cardNumber);
      
      // Endpoint para buscar saldo
      const response = await api.post(
        'consulta_saldo_app.php',
        formData.toString()
      );

      // Verificar resposta e formatar dados
      if (response.data && typeof response.data === 'object') {
        setBalanceData({
          saldo: response.data.saldo || '0.00',
          limite: response.data.limite || '0.00',
          limiteAtual: response.data.limiteAtual || '0.00'
        });
      } else {
        setError('Formato de resposta inválido');
      }
    } catch (err) {
      console.error('Erro ao buscar saldo:', err);
      setError('Erro ao carregar saldo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Formatar valor para exibição em Guarani Paraguaio
  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return numValue.toLocaleString('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
          onClick={() => userData && fetchBalance(userData.cartao)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-600 p-4 flex items-center">
        <FaWallet className="text-white text-2xl mr-3" />
        <h2 className="text-xl font-bold text-white">Seu Saldo</h2>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-1">Saldo Disponível</p>
          <p className="text-3xl font-bold text-gray-800">
            {balanceData ? formatCurrency(balanceData.saldo) : '$0.00'}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm mb-1">Limite Total</p>
            <p className="text-xl font-semibold text-gray-700">
              {balanceData ? formatCurrency(balanceData.limite) : '$0.00'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Limite Disponível</p>
            <p className="text-xl font-semibold text-gray-700">
              {balanceData ? formatCurrency(balanceData.limiteAtual) : '$0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 