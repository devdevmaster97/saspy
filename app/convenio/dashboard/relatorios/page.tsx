'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaFilter, FaUndo, FaExclamationTriangle, FaTimes, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Lancamento {
  id: number;
  data: string;
  hora: string;
  valor: string;
  associado: string;
  empregador: string;
  mes: string;
  parcela: number;
  descricao: string;
  data_fatura: string;
  matricula?: string;
  codigoempregador?: number;
}

export default function RelatoriosPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string>('');
  const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([]);
  const [loadingLancamentos, setLoadingLancamentos] = useState(true);
  const [estornandoId, setEstornandoId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState<Lancamento | null>(null);

  // Função para gerar o mês corrente no formato abreviado (ex: JAN/2024)
  const gerarMesCorrente = () => {
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const data = new Date();
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();
    return `${mes}/${ano}`;
  };

  // Buscar lançamentos do banco de dados
  useEffect(() => {
    const buscarLancamentos = async () => {
      try {
        const response = await fetch('/api/convenio/lancamentos');
        const data = await response.json();

        if (data.success) {
          setLancamentos(data.data);
          // Extrair meses únicos dos lançamentos
          const meses = Array.from(new Set(data.data.map((l: Lancamento) => l.mes))) as string[];
          // Ordenar meses do mais recente para o mais antigo
          const mesesOrdenados = meses.sort().reverse();
          setMesesDisponiveis(mesesOrdenados);
          
          // Definir o mês corrente como padrão
          const mesCorrente = gerarMesCorrente();
          setMesSelecionado(mesCorrente);
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

  // Filtrar lançamentos pelo mês selecionado
  const lancamentosFiltrados = mesSelecionado
    ? lancamentos.filter(l => l.mes === mesSelecionado)
    : lancamentos;

  // Abrir modal de confirmação antes de estornar
  const confirmarEstorno = (lancamento: Lancamento) => {
    setLancamentoSelecionado(lancamento);
    setShowModal(true);
  };

  // Função para estornar um lançamento
  const handleEstornar = async () => {
    if (!lancamentoSelecionado) return;
    
    const id = lancamentoSelecionado.id;
    setEstornandoId(id);
    setShowModal(false);
    
    try {
      // Log de debug para verificar a estrutura dos dados
      console.log('Lançamento selecionado:', lancamentoSelecionado);
      
      // Extrair código do empregador - verificar primeiro se codigoempregador existe
      let codigoEmpregador;
      if (lancamentoSelecionado.codigoempregador) {
        codigoEmpregador = lancamentoSelecionado.codigoempregador;
      } else {
        // Tentativa de extrair o código do texto (assumindo formato "CÓDIGO - Nome")
        const empregadorParts = lancamentoSelecionado.empregador.split(' - ');
        if (empregadorParts.length > 1 && !isNaN(Number(empregadorParts[0]))) {
          codigoEmpregador = parseInt(empregadorParts[0]);
        } else {
          // Fallback: usar 1 como código padrão ou perguntar ao usuário
          codigoEmpregador = 1; 
        }
      }
      
      // Formatação de data se necessário (DD/MM/YYYY -> YYYY-MM-DD)
      let dataFormatada = lancamentoSelecionado.data;
      if (dataFormatada.includes('/')) {
        const [dia, mes, ano] = dataFormatada.split('/');
        dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      }
      
      // Formatar o valor substituindo vírgula por ponto
      const valorFormatado = lancamentoSelecionado.valor.replace(',', '.');
      
      // Preparando os dados para enviar para a API
      const dadosEstorno = {
        lancamento: id.toString(),
        data: dataFormatada,
        hora: lancamentoSelecionado.hora, // Formato HH:MM:SS
        empregador: codigoEmpregador, // Enviando como número
        valor: valorFormatado, // Valor formatado com ponto
        mes: lancamentoSelecionado.mes
      };

      // Log de debug para verificar os parâmetros
      console.log('Parâmetros enviados para API:', dadosEstorno);

      // Chamada para a API Next.js
      const response = await fetch('/api/convenio/estorno', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosEstorno),
      });

      const resultData = await response.json();
      console.log('Resposta da API de estorno:', resultData);

      if (resultData.success) {
        toast.success('Lançamento estornado com sucesso');
        // Atualizar a lista removendo o item estornado
        setLancamentos(lancamentos.filter(l => l.id !== id));
      } else {
        toast.error(resultData.message || 'Erro ao estornar lançamento');
      }
    } catch (error) {
      console.error('Erro ao estornar lançamento:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setEstornandoId(null);
      setLancamentoSelecionado(null);
    }
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => confirmarEstorno(lancamento)}
                        disabled={estornandoId === lancamento.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {estornandoId === lancamento.id ? (
                          <FaSpinner className="animate-spin h-4 w-4 mr-1" />
                        ) : (
                          <FaUndo className="h-4 w-4 mr-1" />
                        )}
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
      {showModal && lancamentoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden transform transition-all">
            <div className="bg-red-50 p-4 border-b border-red-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">Confirmar Estorno</h3>
                </div>
                <div className="ml-auto">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="bg-red-50 rounded-md text-red-500 hover:text-red-600 focus:outline-none"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="mt-2 text-center sm:mt-0 sm:text-left">
                <p className="text-sm text-gray-500 mb-4">
                  Você está prestes a estornar o seguinte lançamento:
                </p>
                
                <div className="bg-gray-50 rounded-md p-4 mb-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">ID Lançamento</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">{lancamentoSelecionado.id}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Data/Hora</dt>
                      <dd className="mt-1 text-sm text-gray-900">{lancamentoSelecionado.data} {lancamentoSelecionado.hora}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Associado</dt>
                      <dd className="mt-1 text-sm text-gray-900">{lancamentoSelecionado.associado}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Empregador</dt>
                      <dd className="mt-1 text-sm text-gray-900">{lancamentoSelecionado.empregador}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Mês</dt>
                      <dd className="mt-1 text-sm text-gray-900">{lancamentoSelecionado.mes}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Valor</dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900">R$ {lancamentoSelecionado.valor}</dd>
                    </div>
                  </dl>
                </div>
                
                <p className="text-sm text-red-600 font-medium">
                  Deseja prosseguir com o estorno?
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleEstornar}
                className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                <FaCheck className="mr-2 h-4 w-4" /> Sim, estornar
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