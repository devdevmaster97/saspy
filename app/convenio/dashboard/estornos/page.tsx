'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaSearch, FaUndo, FaTimes, FaQuestionCircle, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Estorno {
  id: string;
  lancamento: string;
  associado: string;
  nome_associado: string;
  convenio: string;
  valor: string;
  data: string;
  hora: string;
  descricao: string;
  mes: string;
  empregador: string;
  nome_empregador: string;
  data_estorno: string;
  hora_estorno: string;
  parcela?: string;
}

export default function EstornosPage() {
  const [loading, setLoading] = useState(true);
  const [estornos, setEstornos] = useState<Estorno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [estornoSelecionado, setEstornoSelecionado] = useState<Estorno | null>(null);

  useEffect(() => {
    const fetchEstornos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/convenio/estornos');
        const data = await response.json();

        if (data.success) {
          setEstornos(data.data);
        } else {
          toast.error(data.message || 'Erro ao carregar estornos');
        }
      } catch (error) {
        console.error('Erro ao carregar estornos:', error);
        toast.error('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchEstornos();
  }, []);

  // Filtrar estornos com base no termo de pesquisa
  const filteredEstornos = estornos.filter(estorno => {
    const searchLower = searchTerm.toLowerCase();
    return (
      estorno.nome_associado?.toLowerCase().includes(searchLower) ||
      estorno.nome_empregador?.toLowerCase().includes(searchLower) ||
      estorno.data_estorno?.includes(searchTerm) ||
      estorno.valor?.toString().includes(searchTerm)
    );
  });

  // Abrir o modal de confirmação
  const handleConfirmarCancelamento = (estorno: Estorno) => {
    setEstornoSelecionado(estorno);
    setShowModal(true);
  };

  // Cancelar um estorno
  const handleCancelarEstorno = async () => {
    if (!estornoSelecionado) return;
    
    setCancelandoId(estornoSelecionado.id);
    setShowModal(false);
    
    try {
      // Preparar os dados para enviar à API
      const dadosCancelamento = {
        lancamento: estornoSelecionado.lancamento,
        associado: estornoSelecionado.associado,
        data: formatarDataParaAPI(estornoSelecionado.data_estorno || estornoSelecionado.data),
        mes: estornoSelecionado.mes,
        parcela: estornoSelecionado.parcela
      };
      
      // Log detalhado dos dados de cancelamento
      console.log('=====================================================');
      console.log('CANCELAMENTO DE ESTORNO - DADOS ENVIADOS:');
      console.log('ID do estorno:', estornoSelecionado.id);
      console.log('Lançamento:', estornoSelecionado.lancamento);
      console.log('Associado (ID):', estornoSelecionado.associado);
      console.log('Associado (Nome):', estornoSelecionado.nome_associado);
      console.log('Data (Original):', estornoSelecionado.data_estorno || estornoSelecionado.data);
      console.log('Data (Formatada para API):', dadosCancelamento.data);
      console.log('Mês:', estornoSelecionado.mes);
      console.log('Parcela:', estornoSelecionado.parcela);
      console.log('Valor do estorno:', estornoSelecionado.valor);
      console.log('Dados completos para API:', dadosCancelamento);
      console.log('=====================================================');
      
      // Enviar a requisição de cancelamento
      const response = await fetch('/api/convenio/cancelar-estorno', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosCancelamento),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Estorno cancelado com sucesso');
        // Atualizar a lista removendo o item cancelado
        setEstornos(estornos.filter(e => e.id !== estornoSelecionado.id));
      } else {
        toast.error(data.message || 'Erro ao cancelar estorno');
      }
    } catch (error) {
      console.error('Erro ao cancelar estorno:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setCancelandoId(null);
      setEstornoSelecionado(null);
    }
  };

  // Formatar data brasileira para exibição
  const formatarData = (data: string) => {
    if (!data) return '';
    
    // Se a data já estiver no formato DD/MM/YYYY
    if (data.includes('/')) return data;
    
    // Se a data estiver no formato YYYY-MM-DD
    try {
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch (e) {
      return data; // Retorna original em caso de erro
    }
  };
  
  // Formatar data para a API (YYYY-MM-DD)
  const formatarDataParaAPI = (data: string) => {
    if (!data) return '';
    
    // Se a data já estiver no formato YYYY-MM-DD
    if (data.includes('-')) return data;
    
    // Se a data estiver no formato DD/MM/YYYY
    try {
      const [dia, mes, ano] = data.split('/');
      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    } catch (e) {
      return data; // Retorna original em caso de erro
    }
  };

  // Formatar valor para exibição
  const formatarValor = (valor: string) => {
    if (!valor) return 'R$ 0,00';
    
    const valorNum = parseFloat(valor);
    return `R$ ${valorNum.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estornos</h1>
        <p className="mt-1 text-sm text-gray-600">Visualize e gerencie os estornos do seu convênio</p>
      </div>

      <div className="mb-4 flex justify-end">
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por associado ou empregador"
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
                  Data Estorno
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lançamento
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Associado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empregador
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parcela
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEstornos.map((estorno) => (
                <tr key={estorno.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatarData(estorno.data_estorno)} {estorno.hora_estorno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {estorno.lancamento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {estorno.nome_associado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {estorno.nome_empregador}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatarValor(estorno.valor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {estorno.parcela || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleConfirmarCancelamento(estorno)}
                      disabled={cancelandoId === estorno.id}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelandoId === estorno.id ? (
                        <FaSpinner className="animate-spin h-4 w-4 mr-1" />
                      ) : (
                        <FaTimes className="h-4 w-4 mr-1" />
                      )}
                      Cancelar
                    </button>
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

      {/* Modal de Confirmação */}
      {showModal && estornoSelecionado && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 transition-opacity">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full">
            <div className="bg-blue-50 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaQuestionCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-blue-800">
                    Confirmar Cancelamento
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-700 mb-4">
                  Você está prestes a cancelar o seguinte estorno:
                </p>
                
                <div className="bg-gray-50 rounded p-4 mb-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Associado</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estornoSelecionado.nome_associado}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Lançamento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estornoSelecionado.lancamento}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Data</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatarData(estornoSelecionado.data_estorno || estornoSelecionado.data)}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Valor</dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900">{formatarValor(estornoSelecionado.valor)}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Parcela</dt>
                      <dd className="mt-1 text-sm text-gray-900">{estornoSelecionado.parcela || '-'}</dd>
                    </div>
                  </dl>
                </div>
                
                <p className="text-base font-medium text-gray-900 text-center">
                  Deseja realmente cancelar este estorno?
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="button" 
                onClick={handleCancelarEstorno}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Sim, cancelar
              </button>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Não, manter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 