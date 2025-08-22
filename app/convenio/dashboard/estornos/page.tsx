'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaSearch, FaUndo, FaTimes, FaQuestionCircle, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import SafeDeleteButton from '../../../components/SafeDeleteButton';

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
    <div className="mb-6">
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
        <>
          {/* Versão para Desktop */}
          <div className="hidden md:block overflow-x-auto bg-white shadow rounded-lg">
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
                      <SafeDeleteButton
                        dataRow={estorno}
                        onDelete={async (id) => {
                          const estornoToDelete = estornos.find(e => e.id === id);
                          if (estornoToDelete) {
                            setEstornoSelecionado(estornoToDelete);
                            await handleCancelarEstorno();
                          }
                        }}
                        confirmMessage="Tem certeza que deseja cancelar este estorno? Esta ação não poderá ser desfeita."
                        itemDescription="este estorno"
                        disabled={cancelandoId === estorno.id}
                      >
                        {cancelandoId === estorno.id ? (
                          <FaSpinner className="animate-spin h-5 w-5" />
                        ) : (
                          <FaTimes className="h-5 w-5" />
                        )}
                      </SafeDeleteButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versão para Mobile */}
          <div className="md:hidden space-y-4">
            {filteredEstornos.map((estorno) => (
              <div key={estorno.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {estorno.nome_associado}
                    </h3>
                    <p className="text-sm text-gray-500">{estorno.nome_empregador}</p>
                  </div>
                  <span className="font-bold text-gray-900">{formatarValor(estorno.valor)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Data:</span>{' '}
                    <span className="text-gray-900">{formatarData(estorno.data_estorno)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Lançamento:</span>{' '}
                    <span className="text-gray-900">{estorno.lancamento}</span>
                  </div>
                  {estorno.parcela && (
                    <div>
                      <span className="text-gray-500">Parcela:</span>{' '}
                      <span className="text-gray-900">{estorno.parcela}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Hora:</span>{' '}
                    <span className="text-gray-900">{estorno.hora_estorno || '-'}</span>
                  </div>
                </div>
                
                <div className="mt-2 border-t pt-2 flex justify-end">
                  <button
                    onClick={() => handleConfirmarCancelamento(estorno)}
                    disabled={cancelandoId === estorno.id}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelandoId === estorno.id ? (
                      <>
                        <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <FaTimes className="mr-2 h-4 w-4" />
                        Cancelar Estorno
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum estorno encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Nenhum resultado encontrado para sua pesquisa.' : 'Não há estornos registrados no sistema.'}
          </p>
        </div>
      )}

      {/* Modal de confirmação */}
      {showModal && estornoSelecionado && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl transform transition-all">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Cancelar estorno
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Tem certeza que deseja cancelar este estorno? Esta ação não poderá ser desfeita.
                    </p>
                    
                    <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm">
                      <p><span className="font-semibold">Associado:</span> {estornoSelecionado.nome_associado}</p>
                      <p><span className="font-semibold">Lançamento:</span> {estornoSelecionado.lancamento}</p>
                      <p><span className="font-semibold">Valor:</span> {formatarValor(estornoSelecionado.valor)}</p>
                      <p><span className="font-semibold">Data:</span> {formatarData(estornoSelecionado.data_estorno)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleCancelarEstorno}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Confirmar Cancelamento
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 