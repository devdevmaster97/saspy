'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser } from 'react-icons/fa';

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
        <p className="text-red-600">{error}</p>
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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Meus Dados</h2>
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
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                name="nome"
                value={formData.nome || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Celular</label>
              <input
                type="tel"
                name="cel"
                value={formData.cel || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">CPF</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">CEP</label>
              <input
                type="text"
                name="cep"
                value={formData.cep || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Endereço</label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Número</label>
              <input
                type="text"
                name="numero"
                value={formData.numero || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bairro</label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cidade</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <input
                type="text"
                name="uf"
                value={formData.uf || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setEditando(false);
                  setFormData(dados || {});
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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
              <FaUser className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{dados?.nome}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{dados?.email || 'Não informado'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaPhone className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Celular</p>
                <p className="font-medium">{dados?.cel || 'Não informado'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Endereço</p>
                <p className="font-medium">
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