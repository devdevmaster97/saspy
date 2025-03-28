'use client';

import { useState } from 'react';
import { FaSpinner, FaFileDownload, FaFilePdf, FaFileExcel, FaCalendarAlt } from 'react-icons/fa';

interface Relatorio {
  id: string;
  nome: string;
  descricao: string;
  formato: 'pdf' | 'excel';
}

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');

  const relatorios: Relatorio[] = [
    {
      id: '1',
      nome: 'Vendas por Período',
      descricao: 'Relatório detalhado de todas as vendas realizadas no período selecionado.',
      formato: 'pdf'
    },
    {
      id: '2',
      nome: 'Estornos Realizados',
      descricao: 'Lista de todos os estornos realizados no período selecionado, com detalhes e status.',
      formato: 'pdf'
    },
    {
      id: '3',
      nome: 'Análise de Vendas',
      descricao: 'Análise detalhada das vendas, com gráficos e estatísticas sobre o desempenho do convênio.',
      formato: 'excel'
    },
    {
      id: '4',
      nome: 'Clientes Atendidos',
      descricao: 'Lista de todos os clientes atendidos no período selecionado, com detalhes das compras.',
      formato: 'excel'
    },
    {
      id: '5',
      nome: 'Resumo Financeiro',
      descricao: 'Resumo financeiro do período, incluindo vendas, estornos, taxas e valores líquidos.',
      formato: 'pdf'
    }
  ];

  const gerarRelatorio = (id: string) => {
    if (!dataInicio || !dataFim) {
      alert('Selecione o período para gerar o relatório');
      return;
    }

    setLoading(true);

    // Simulação de geração de relatório
    setTimeout(() => {
      setLoading(false);
      alert(`Relatório gerado com sucesso! Período: ${dataInicio} a ${dataFim}`);
    }, 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="mt-1 text-sm text-gray-600">Gere relatórios e analise os dados do seu convênio</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Selecione o período</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700">
              Data Inicial
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <input
                type="date"
                name="dataInicio"
                id="dataInicio"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700">
              Data Final
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <input
                type="date"
                name="dataFim"
                id="dataFim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {relatorios.map((relatorio) => (
            <li key={relatorio.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    {relatorio.formato === 'pdf' ? (
                      <FaFilePdf className="h-5 w-5 text-red-500 mr-2" />
                    ) : (
                      <FaFileExcel className="h-5 w-5 text-green-500 mr-2" />
                    )}
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {relatorio.nome}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {relatorio.descricao}
                  </p>
                </div>
                <button
                  onClick={() => gerarRelatorio(relatorio.id)}
                  disabled={loading}
                  className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin h-4 w-4 mr-1" />
                  ) : (
                    <FaFileDownload className="h-4 w-4 mr-1" />
                  )}
                  Gerar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}