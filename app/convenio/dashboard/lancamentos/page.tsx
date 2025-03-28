'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaPlus, FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Lancamento {
  id: string;
  data: string;
  valor: number;
  associado: string;
  cartao: string;
  status: string;
}

export default function LancamentosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulando carregamento de dados
    const fetchLancamentos = async () => {
      try {
        // Aqui você faria a chamada real para a API
        // const response = await fetch('/api/convenio/lancamentos');
        // const data = await response.json();
        
        // Dados de exemplo
        const mockData: Lancamento[] = [
          { 
            id: '1', 
            data: '28/03/2025', 
            valor: 150.00, 
            associado: 'João Silva', 
            cartao: '1234******5678', 
            status: 'Aprovado' 
          },
          { 
            id: '2', 
            data: '27/03/2025', 
            valor: 89.90, 
            associado: 'Maria Oliveira', 
            cartao: '8765******4321', 
            status: 'Aprovado' 
          },
          { 
            id: '3', 
            data: '26/03/2025', 
            valor: 200.00, 
            associado: 'Pedro Santos', 
            cartao: '5678******9012', 
            status: 'Processando' 
          }
        ];
        
        setLancamentos(mockData);
      } catch (error) {
        console.error('Erro ao carregar lançamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLancamentos();
  }, []);

  // Filtrar lançamentos com base no termo de pesquisa
  const filteredLancamentos = lancamentos.filter(lancamento => 
    lancamento.associado.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lancamento.cartao.includes(searchTerm)
  );

  const handleNovoLancamento = () => {
    router.push('/convenio/dashboard/lancamentos/novo');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
        <p className="mt-1 text-sm text-gray-600">Gerencie os lançamentos do seu convênio</p>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={handleNovoLancamento}
        >
          <FaPlus className="mr-2" /> Novo Lançamento
        </button>
        
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por associado ou cartão"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <FaSpinner className="animate-spin text-blue-500 text-4xl" />
        </div>
      ) : filteredLancamentos.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Associado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cartão
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLancamentos.map((lancamento) => (
                <tr key={lancamento.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lancamento.data}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {lancamento.valor.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lancamento.associado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lancamento.cartao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      lancamento.status === 'Aprovado' 
                        ? 'bg-green-100 text-green-800' 
                        : lancamento.status === 'Processando'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {lancamento.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <p className="text-gray-500">Nenhum lançamento encontrado.</p>
        </div>
      )}
    </div>
  );
} 