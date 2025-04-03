'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

interface Estorno {
  id: string;
  data: string;
  valor: number;
  associado: string;
  cartao: string;
  status: string;
  motivo: string;
}

export default function EstornosPage() {
  const [loading, setLoading] = useState(true);
  const [estornos, setEstornos] = useState<Estorno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulando carregamento de dados
    const fetchEstornos = async () => {
      try {
        // Aqui você faria a chamada real para a API
        // const response = await fetch('/api/convenio/estornos');
        // const data = await response.json();
        
        // Dados de exemplo
        const mockData: Estorno[] = [
          { 
            id: '1', 
            data: '20/03/2025', 
            valor: 150.00, 
            associado: 'João Silva', 
            cartao: '1234******5678', 
            status: 'Aprovado',
            motivo: 'Cliente desistiu da compra'
          },
          { 
            id: '2', 
            data: '15/03/2025', 
            valor: 75.50, 
            associado: 'Maria Oliveira', 
            cartao: '8765******4321', 
            status: 'Em análise',
            motivo: 'Produto com defeito'
          },
          { 
            id: '3', 
            data: '10/03/2025', 
            valor: 200.00, 
            associado: 'Pedro Santos', 
            cartao: '5678******9012', 
            status: 'Rejeitado',
            motivo: 'Fora do prazo de estorno'
          }
        ];
        
        setEstornos(mockData);
      } catch (error) {
        console.error('Erro ao carregar estornos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstornos();
  }, []);

  // Filtrar estornos com base no termo de pesquisa
  const filteredEstornos = estornos.filter(estorno => 
    estorno.associado.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estorno.cartao.includes(searchTerm) ||
    estorno.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Em análise':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejeitado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estornos</h1>
        <p className="mt-1 text-sm text-gray-600">Visualize e gerencie os estornos do seu convênio</p>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaExclamationTriangle className="mr-2" /> Solicitar Estorno
        </button>
        
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por associado ou motivo"
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
      ) : filteredEstornos.length > 0 ? (
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
                  Motivo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEstornos.map((estorno) => (
                <tr key={estorno.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {estorno.data}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {estorno.valor.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {estorno.associado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {estorno.cartao}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {estorno.motivo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(estorno.status)}`}>
                      {estorno.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <p className="text-gray-500">Nenhum estorno encontrado.</p>
        </div>
      )}
    </div>
  );
} 