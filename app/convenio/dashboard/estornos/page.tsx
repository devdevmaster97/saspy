'use client';

import { useState, useEffect, useRef } from 'react';
import { FaSpinner, FaFilter, FaUndo } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Estorno {
  id: number;
  lancamento: number;
  associado: string;
  nome_associado: string;
  empregador: string;
  nome_empregador: string;
  valor: string;
  data: string;
  hora: string;
  mes: string;
  parcela: number;
  data_fatura: string;
  data_estorno: string;
  hora_estorno: string;
  func_estorno: string;
  descricao: string;
}

export default function EstornosPage() {
  const [estornos, setEstornos] = useState<Estorno[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string>('');
  const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMeses, setLoadingMeses] = useState(true);
  const [mesCorrente, setMesCorrente] = useState<string>('');
  const [convenioId, setConvenioId] = useState<number>(0);
  const [processandoCancelamento, setProcessandoCancelamento] = useState<number | null>(null);
  const [estornoParaCancelar, setEstornoParaCancelar] = useState<Estorno | null>(null);
  const [showModal, setShowModal] = useState(false);
  const naoButtonRef = useRef<HTMLButtonElement>(null);

  // Efeito para focar no botão "Não" quando o modal abrir
  useEffect(() => {
    if (showModal && naoButtonRef.current) {
      setTimeout(() => {
        naoButtonRef.current?.focus();
      }, 100);
    }
  }, [showModal]);

  // Obter ID do convênio
  useEffect(() => {
    const obterConvenioId = async () => {
      try {
        // Tentar obter de dadosConvenio no localStorage
        const dadosConvenioString = localStorage.getItem('dadosConvenio');
        if (dadosConvenioString) {
          try {
            const dadosConvenio = JSON.parse(dadosConvenioString);
            if (dadosConvenio && dadosConvenio.cod_convenio) {
              setConvenioId(Number(dadosConvenio.cod_convenio));
              console.log('ID do convênio obtido do localStorage:', dadosConvenio.cod_convenio);
              return;
            }
          } catch (error) {
            console.log('Não foi possível ler dados do localStorage, tentando API...');
          }
        }
        
        // Tentar obter da API
        try {
          const response = await fetch('/api/convenio/dados');
          const data = await response.json();
          
          if (data.success && data.data && data.data.cod_convenio) {
            setConvenioId(Number(data.data.cod_convenio));
            console.log('ID do convênio obtido da API:', data.data.cod_convenio);
            return;
          }
        } catch (apiError) {
          console.log('Não foi possível obter dados da API, usando valor padrão');
        }
        
        // Se nada funcionar, usar valor padrão para desenvolvimento
        console.log('Usando ID de convênio padrão (1) para desenvolvimento');
        setConvenioId(1);
      } catch (error) {
        console.log('Usando ID de convênio padrão (1) para desenvolvimento');
        setConvenioId(1);
      }
    };
    
    obterConvenioId();
  }, []);

  // Buscar meses disponíveis da API
  useEffect(() => {
    const buscarMesesDisponiveis = async () => {
      setLoadingMeses(true);
      try {
        const response = await fetch('/api/convenio/meses');
        const data = await response.json();
        
        console.log('Resposta da API de meses para estornos:', data);
        
        if (data.success) {
          if (data.mesCorrente) {
            console.log('Mês corrente obtido da API:', data.mesCorrente);
            setMesCorrente(data.mesCorrente);
          }
          
          if (data.meses && Array.isArray(data.meses)) {
            console.log('Meses disponíveis obtidos da API:', data.meses);
            setMesesDisponiveis(data.meses);
          }
        } else {
          toast.error(data.message || 'Erro ao buscar meses disponíveis');
        }
      } catch (error) {
        console.error('Erro ao buscar meses disponíveis:', error);
        toast.error('Erro ao conectar com o servidor');
      } finally {
        setLoadingMeses(false);
      }
    };
    
    buscarMesesDisponiveis();
  }, []);

  // Efeito para selecionar o mês corrente quando disponível
  useEffect(() => {
    if (mesCorrente && mesesDisponiveis.length > 0) {
      if (mesesDisponiveis.includes(mesCorrente)) {
        console.log('Selecionando mês corrente da API:', mesCorrente);
        setMesSelecionado(mesCorrente);
      } else if (mesesDisponiveis.length > 0) {
        // Se o mês corrente não estiver na lista, seleciona o primeiro mês disponível
        console.log('Mês corrente não disponível, selecionando o primeiro mês:', mesesDisponiveis[0]);
        setMesSelecionado(mesesDisponiveis[0]);
      }
    }
  }, [mesCorrente, mesesDisponiveis]);

  // Buscar estornos do banco de dados
  useEffect(() => {
    // Não buscar estornos se o ID do convênio não estiver disponível
    if (convenioId === 0) return;
    
    const buscarEstornos = async () => {
      setLoading(true);
      try {
        console.log('Buscando estornos para o convênio:', convenioId);
        const response = await fetch('/api/convenio/estornos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          body: JSON.stringify({
            convenio: convenioId // Usando o ID do convênio logado
          }),
          cache: 'no-store'
        });

        const data = await response.json();

        if (data.success) {
          setEstornos(data.data);
        } else {
          toast.error(data.message || 'Erro ao buscar estornos');
        }
      } catch (error) {
        console.error('Erro ao buscar estornos:', error);
        toast.error('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    };

    buscarEstornos();
  }, [convenioId]);

  // Função para mostrar o modal de confirmação
  const handleCancelarEstorno = (estorno: Estorno) => {
    setEstornoParaCancelar(estorno);
    setShowModal(true);
  };

  // Função para fechar o modal sem cancelar
  const cancelarOperacao = () => {
    setShowModal(false);
    setEstornoParaCancelar(null);
  };

  // Função para cancelar estorno após confirmação
  const confirmarCancelamento = async () => {
    if (!estornoParaCancelar) return;
    
    setProcessandoCancelamento(estornoParaCancelar.id);
    
    try {
      console.log('Enviando solicitação de cancelamento para estorno:', estornoParaCancelar);
      
      // Validar dados obrigatórios
      if (
        !estornoParaCancelar.lancamento || 
        !convenioId || 
        !estornoParaCancelar.associado || 
        !estornoParaCancelar.data || 
        !estornoParaCancelar.mes
      ) {
        toast.error('Dados incompletos para cancelar o estorno');
        return;
      }
      
      // Chamar a API de cancelamento de estorno
      const response = await fetch('/api/convenio/cancelar-estorno', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ 
          // Parâmetros obrigatórios
          convenio: convenioId,
          lancamento: estornoParaCancelar.lancamento,
          associado: estornoParaCancelar.associado,
          data: estornoParaCancelar.data,
          mes: estornoParaCancelar.mes,
          // Parâmetros opcionais
          valor: estornoParaCancelar.valor,
          empregador: estornoParaCancelar.empregador || '',
          parcela: estornoParaCancelar.parcela || ''
        }),
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Estorno cancelado com sucesso!');
        
        // Recarregar os estornos
        setEstornos(prev => prev.filter(estorno => estorno.id !== estornoParaCancelar.id));
      } else {
        toast.error(data.message || 'Erro ao cancelar estorno');
      }
    } catch (error) {
      console.error('Erro ao cancelar estorno:', error);
      toast.error('Erro ao cancelar estorno');
    } finally {
      setProcessandoCancelamento(null);
      setShowModal(false);
      setEstornoParaCancelar(null);
    }
  };

  // Filtrar estornos pelo mês selecionado
  const estornosFiltrados = mesSelecionado
    ? estornos.filter(e => e.mes === mesSelecionado)
    : estornos;

  return (
    <div>
      {/* Modal de confirmação */}
      {showModal && estornoParaCancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay escuro */}
          <div className="fixed inset-0 bg-black opacity-50" onClick={cancelarOperacao}></div>
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 z-10">
            <div className="flex items-center mb-4">
              <svg className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Cancelar Estorno</h3>
            </div>
            
            <p className="mb-4 text-gray-700">Tem certeza que deseja cancelar este estorno?</p>
            
            <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Associado:</div>
                <div className="font-medium">{estornoParaCancelar.nome_associado || estornoParaCancelar.associado}</div>
                
                <div className="text-gray-600">Valor:</div>
                <div className="font-medium">R$ {estornoParaCancelar.valor}</div>
                
                <div className="text-gray-600">Data:</div>
                <div className="font-medium">{estornoParaCancelar.data_estorno}</div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                ref={naoButtonRef}
                onClick={cancelarOperacao}
                className="inline-flex justify-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={processandoCancelamento === estornoParaCancelar.id}
              >
                Não, cancelar
              </button>
              <button
                onClick={confirmarCancelamento}
                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={processandoCancelamento === estornoParaCancelar.id}
              >
                {processandoCancelamento === estornoParaCancelar.id ? (
                  <>
                    <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                    Processando...
                  </>
                ) : (
                  <>Sim, cancelar estorno</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estornos</h1>
        <p className="mt-1 text-sm text-gray-600">Visualize o histórico de estornos realizados</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Histórico de Estornos</h2>
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-500" />
            <label htmlFor="mes" className="text-sm font-medium text-gray-700">
              Filtrar por Mês:
            </label>
            {loadingMeses ? (
              <div className="ml-2">
                <FaSpinner className="animate-spin h-4 w-4 text-blue-600" />
              </div>
            ) : (
              <select
                id="mes"
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(e.target.value)}
                className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Todos os Meses</option>
                {mesesDisponiveis.map((mes) => (
                  <option key={mes} value={mes}>
                    {mes}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin h-8 w-8 mx-auto text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Associado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empregador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mês
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parcela
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Fatura
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estornosFiltrados.map((estorno) => (
                  <tr key={estorno.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {estorno.data_estorno} {estorno.hora_estorno}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {estorno.nome_associado || estorno.associado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {estorno.nome_empregador || estorno.empregador}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {estorno.valor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {estorno.mes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {estorno.parcela}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {estorno.data_fatura}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => handleCancelarEstorno(estorno)}
                        disabled={processandoCancelamento === estorno.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {processandoCancelamento === estorno.id ? (
                          <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                        ) : (
                          <FaUndo className="mr-2 h-4 w-4" />
                        )}
                        Cancelar estorno
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 