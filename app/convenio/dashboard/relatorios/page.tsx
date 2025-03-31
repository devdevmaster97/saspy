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
  descricao: string;
  data_fatura: string;
}

export default function RelatoriosPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string>('');
  const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([]);
  const [loadingLancamentos, setLoadingLancamentos] = useState(true);

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
                    Descrição
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
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {lancamento.descricao}
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