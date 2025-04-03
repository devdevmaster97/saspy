'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa';
import { useTheme } from '@/app/contexts/ThemeContext';

interface DadosAssociado {
  nome: string;
  email: string;
  cel: string;
  cpf: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  celwatzap: boolean;
}

// Dados de exemplo para testes
const dadosExemplo: DadosAssociado = {
  nome: "USUARIO CARTAO TESTE 3",
  email: "usuario@exemplo.com",
  cel: "(35) 9 9999-9999",
  cpf: "123.456.789-00",
  cep: "37002-010",
  endereco: "AVENIDA RIO BRANCO",
  numero: "55",
  bairro: "CENTRO",
  cidade: "Varginha",
  uf: "MG",
  celwatzap: false
};

export default function MeusDadosContent() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [dados, setDados] = useState<DadosAssociado | null>(null);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState<Partial<DadosAssociado>>({});
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user?.cartao && status === 'authenticated') {
      buscarDados();
    } else if (!dados) {
      // Usar dados de exemplo para demonstração quando não há sessão
      setDados(dadosExemplo);
      setFormData(dadosExemplo);
    }
  }, [session, status, dados]);

  const buscarDados = async () => {
    try {
      const response = await axios.post('/api/localiza-associado', {
        cartao: session?.user?.cartao,
        senha: session?.user?.senha
      });

      if (response.data) {
        setDados(response.data);
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Não foi possível carregar seus dados. Tente novamente.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/atualiza-associado', {
        ...formData,
        codigo: session?.user?.matricula,
        empregador: session?.user?.empregador
      });

      if (response.data) {
        setDados(response.data);
        setEditando(false);
        setError(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      setError('Não foi possível atualizar seus dados. Tente novamente.');
    }
  };

  if (!isMounted) {
    return null;
  }

  // Classes para temas
  const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';
  const textErrorClass = theme === 'dark' ? 'text-red-400' : 'text-red-600';
  const labelClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const inputBgClass = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const inputTextClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const inputBorderClass = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const inputFocusClass = theme === 'dark' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500';
  const iconClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-400';

  if (status === 'loading' && !dados) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className={textErrorClass}>{error}</p>
        <button
          onClick={buscarDados}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className={`${cardBgClass} rounded-lg shadow-lg p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold ${textPrimaryClass}`}>Meus Dados</h2>
          {!editando && (
            <button
              onClick={() => setEditando(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Editar
            </button>
          )}
        </div>

        {editando ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${labelClass}`}>Nome</label>
              <input
                type="text"
                name="nome"
                value={formData.nome || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md ${inputBorderClass} shadow-sm ${inputFocusClass} ${inputBgClass} ${inputTextClass}`}
                disabled
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${labelClass}`}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md ${inputBorderClass} shadow-sm ${inputFocusClass} ${inputBgClass} ${inputTextClass}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${labelClass}`}>Celular</label>
              <input
                type="tel"
                name="cel"
                value={formData.cel || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md ${inputBorderClass} shadow-sm ${inputFocusClass} ${inputBgClass} ${inputTextClass}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${labelClass}`}>CPF</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md ${inputBorderClass} shadow-sm ${inputFocusClass} ${inputBgClass} ${inputTextClass}`}
                disabled
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${labelClass}`}>CEP</label>
              <input
                type="text"
                name="cep"
                value={formData.cep || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md ${inputBorderClass} shadow-sm ${inputFocusClass} ${inputBgClass} ${inputTextClass}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${labelClass}`}>Endereço</label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md ${inputBorderClass} shadow-sm ${inputFocusClass} ${inputBgClass} ${inputTextClass}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${labelClass}`}>Número</label>
              <input
                type="text"
                name="numero"
                value={formData.numero || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md ${inputBorderClass} shadow-sm ${inputFocusClass} ${inputBgClass} ${inputTextClass}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${labelClass}`}>Bairro</label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md ${inputBorderClass} shadow-sm ${inputFocusClass} ${inputBgClass} ${inputTextClass}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${labelClass}`}>Cidade</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md ${inputBorderClass} shadow-sm ${inputFocusClass} ${inputBgClass} ${inputTextClass}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${labelClass}`}>Estado</label>
              <input
                type="text"
                name="uf"
                value={formData.uf || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md ${inputBorderClass} shadow-sm ${inputFocusClass} ${inputBgClass} ${inputTextClass}`}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setEditando(false);
                  setFormData(dados || {});
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FaUser className={iconClass} />
              <div>
                <p className={`text-sm ${textSecondaryClass}`}>Nome</p>
                <p className={`font-medium ${textPrimaryClass}`}>{dados?.nome}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaEnvelope className={iconClass} />
              <div>
                <p className={`text-sm ${textSecondaryClass}`}>Email</p>
                <p className={`font-medium ${textPrimaryClass}`}>{dados?.email || 'Não informado'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaPhone className={iconClass} />
              <div>
                <p className={`text-sm ${textSecondaryClass}`}>Celular</p>
                <p className={`font-medium ${textPrimaryClass}`}>{dados?.cel || 'Não informado'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className={iconClass} />
              <div>
                <p className={`text-sm ${textSecondaryClass}`}>Endereço</p>
                <p className={`font-medium ${textPrimaryClass}`}>
                  {dados?.endereco}, {dados?.numero} - {dados?.bairro}
                  <br />
                  {dados?.cidade} - {dados?.uf} - {dados?.cep}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 