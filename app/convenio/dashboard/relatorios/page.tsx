'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaFilter } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Lancamento {
  id: number;
  data: string;
  hora: string;
  valor: string;
  associado: string;
  empregador: string;
  mes: string;
  parcela: number;
  data_fatura: string;
  lancamento: number;
  empregador_id?: number;
  id_empregador?: number;
  codigoempregador?: number;
  emp_codigo?: number;
}

export default function RelatoriosPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string>('');
  const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([]);
  const [loadingLancamentos, setLoadingLancamentos] = useState(true);
  const [loadingMeses, setLoadingMeses] = useState(true);
  const [mesCorrente, setMesCorrente] = useState<string>('');
  const [loadingEstorno, setLoadingEstorno] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [lancamentoParaEstornar, setLancamentoParaEstornar] = useState<Lancamento | null>(null);

  // Buscar meses disponíveis da API
  useEffect(() => {
    const buscarMesesDisponiveis = async () => {
      setLoadingMeses(true);
      try {
        const response = await fetch('/api/convenio/meses');
        const data = await response.json();
        
        console.log('Resposta da API de meses:', data);
        
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

  // Buscar lançamentos do banco de dados
  useEffect(() => {
    const buscarLancamentos = async () => {
      setLoadingLancamentos(true);
      try {
        const response = await fetch('/api/convenio/lancamentos');
        const data = await response.json();
        
        console.log('Resposta da API de lançamentos:', data);
        
        if (data.success) {
          // Verificar a estrutura dos dados
          if (data.data && data.data.length > 0) {
            console.log('Exemplo do primeiro lançamento:', data.data[0]);
            console.log('Campos disponíveis:', Object.keys(data.data[0]));
            console.log('codigoempregador presente?', data.data[0].hasOwnProperty('codigoempregador'));
          }
          
          setLancamentos(data.data);
        } else {
          toast.error(data.message || 'Erro ao buscar lançamentos');
        }
      } catch (error) {
        console.error('Erro ao buscar lançamentos:', error);
        toast.error('Erro ao conectar com o servidor');
      } finally {
        setLoadingLancamentos(false);
      }
    };

    buscarLancamentos();
  }, []);

  // Efeito para selecionar o mês corrente quando ambos estiverem disponíveis
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

  // Filtrar lançamentos pelo mês selecionado
  const lancamentosFiltrados = mesSelecionado
    ? lancamentos.filter(l => l.mes === mesSelecionado)
    : lancamentos;

  const handleEstornar = async (lancamento: Lancamento) => {
    setLancamentoParaEstornar(lancamento);
    setShowModal(true);
  };

  const confirmarEstorno = async () => {
    if (!lancamentoParaEstornar) return;

    setLoadingEstorno(lancamentoParaEstornar.id);
    try {
      // Log completo do lancamento para verificar sua estrutura
      console.log('Estrutura completa do lancamento:', lancamentoParaEstornar);
      console.log('Campos disponíveis:', Object.keys(lancamentoParaEstornar));

      // Formatando diretamente no frontend
      const [dia, mes, ano] = lancamentoParaEstornar.data.split('/');
      const dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      const valorFormatado = lancamentoParaEstornar.valor.replace(',', '.');

      // Verificar todos os possíveis campos onde o código pode estar
      console.log('Valores de campos relacionados ao empregador:');
      console.log('- codigoempregador:', lancamentoParaEstornar.codigoempregador, typeof lancamentoParaEstornar.codigoempregador);
      console.log('- emp_codigo:', lancamentoParaEstornar.emp_codigo, typeof lancamentoParaEstornar.emp_codigo);
      console.log('- id_empregador:', lancamentoParaEstornar.id_empregador, typeof lancamentoParaEstornar.id_empregador);
      console.log('- empregador_id:', lancamentoParaEstornar.empregador_id, typeof lancamentoParaEstornar.empregador_id);
      
      // Tentar converter explicitamente para número
      let codigoEmpregador = 0;
      
      if (lancamentoParaEstornar.codigoempregador !== undefined) {
        const valor = Number(lancamentoParaEstornar.codigoempregador);
        if (!isNaN(valor)) {
          codigoEmpregador = valor;
        }
      } else if (lancamentoParaEstornar.emp_codigo !== undefined) {
        const valor = Number(lancamentoParaEstornar.emp_codigo);
        if (!isNaN(valor)) {
          codigoEmpregador = valor;
        }
      } else if (lancamentoParaEstornar.id_empregador !== undefined) {
        const valor = Number(lancamentoParaEstornar.id_empregador);
        if (!isNaN(valor)) {
          codigoEmpregador = valor;
        }
      } else if (lancamentoParaEstornar.empregador_id !== undefined) {
        const valor = Number(lancamentoParaEstornar.empregador_id);
        if (!isNaN(valor)) {
          codigoEmpregador = valor;
        }
      }

      console.log('Dados formatados para envio:');
      console.log('- Data original:', lancamentoParaEstornar.data, '-> Formatada:', dataFormatada);
      console.log('- Valor original:', lancamentoParaEstornar.valor, '-> Formatado:', valorFormatado);
      console.log('- Empregador (nome):', lancamentoParaEstornar.empregador);
      console.log('- Empregador (código final):', codigoEmpregador, typeof codigoEmpregador);

      const requestBody = {
        lancamento: lancamentoParaEstornar.id,
        data: dataFormatada,
        empregador: codigoEmpregador, // Usando o código do empregador como número
        valor: valorFormatado,
        mes: lancamentoParaEstornar.mes
      };

      console.log('Payload completo para API:', requestBody);

      const response = await fetch('/api/convenio/estornar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      const data = await response.json();
      console.log('Resposta da API de estorno:', data);

      if (data.Resultado === 'excluido') {
        toast.success('Lançamento estornado com sucesso!');
        setLancamentos(lancamentos.filter(l => l.id !== lancamentoParaEstornar.id));
      } else if (data.Resultado === 'mes_bloqueado') {
        toast.error('Mês bloqueado para estorno');
      } else {
        toast.error(data.message || 'Erro ao estornar lançamento');
      }
    } catch (error) {
      console.error('Erro ao estornar lançamento:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoadingEstorno(null);
      setShowModal(false);
      setLancamentoParaEstornar(null);
    }
  };

  const cancelarEstorno = () => {
    setShowModal(false);
    setLancamentoParaEstornar(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="mt-1 text-sm text-gray-600">Visualize e analise os dados do seu convênio</p>
      </div>

      {/* Listagem de Lançamentos */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Lançamentos</h2>
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

        {loadingLancamentos ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lancamentosFiltrados.map((lancamento) => (
                  <tr key={lancamento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lancamento.data} {lancamento.hora}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lancamento.associado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lancamento.empregador}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {lancamento.valor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lancamento.mes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lancamento.parcela}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lancamento.data_fatura}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEstornar(lancamento)}
                        disabled={loadingEstorno === lancamento.id}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingEstorno === lancamento.id ? (
                          <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        ) : null}
                        Estornar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Confirmar Estorno
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Tem certeza que deseja estornar este lançamento?
                </p>
                {lancamentoParaEstornar && (
                  <div className="mt-4 text-left">
                    <p className="text-sm font-medium text-gray-700">Detalhes do lançamento:</p>
                    <p className="text-sm text-gray-600">Associado: {lancamentoParaEstornar.associado}</p>
                    <p className="text-sm text-gray-600">Valor: R$ {lancamentoParaEstornar.valor}</p>
                    <p className="text-sm text-gray-600">Data: {lancamentoParaEstornar.data}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="items-center px-4 py-3">
              <button
                onClick={cancelarEstorno}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Não, cancelar
              </button>
              <button
                onClick={confirmarEstorno}
                disabled={loadingEstorno === lancamentoParaEstornar?.id}
                className="mt-3 w-full px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingEstorno === lancamentoParaEstornar?.id ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Processando...
                  </span>
                ) : (
                  'Sim, estornar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}