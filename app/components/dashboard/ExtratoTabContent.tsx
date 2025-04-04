'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiSearch, FiDownload, FiEye } from 'react-icons/fi';
import { FaCalendarAlt } from 'react-icons/fa';

interface ExtratoItem {
  data: string;
  valor: string;
  descricao: string;
  tipo: 'debito' | 'credito';
  codigo: string;
  nome: string;
  mes: string;
  ano: string;
  uri_cupom?: string;
  parcela?: string;
}

interface ExtratoTabContentProps {
  cartao: string;
}

interface MesExtrato {
  abreviacao: string;
  data: string;
  completo: string;
  periodo: string;
}

interface AssociadoResponse {
  matricula: string;
  empregador: number;
  nome: string;
  cod_cart: string;
  parcelas_permitidas: number;
  limite: string;
  email: string;
  cpf: string;
  cel: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  celwatzap: boolean;
  cod_situacao2: number;
  cod_situacaocartao: number;
  nome_divisao: string;
  situacao: number;
  senha: string;
}

interface ContaResponse {
  dia: string;
  hora: string;
  valor: string;
  nomefantasia: string;
  razaosocial: string;
  associado: string;
  nome: string;
  mes: string;
  uri_cupom: string;
  parcela?: string;
}

export default function ExtratoTabContent({ cartao }: ExtratoTabContentProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [extractData, setExtractData] = useState<ExtratoItem[]>([]);
  const [mesesExtrato, setMesesExtrato] = useState<MesExtrato[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);

  // Função para buscar o mês corrente
  const fetchMesCorrente = async () => {
    try {
      console.log('API mes-corrente: Buscando mês corrente para cartão', cartao);
      const formData = new FormData();
      formData.append('cartao', cartao.trim());
      
      const response = await axios.post('/api/mes-corrente', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Resposta do endpoint mês corrente:', response.data);
      
      if (response.data && response.data[0]?.abreviacao) {
        setMesSelecionado(response.data[0].abreviacao);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao buscar mês corrente:', error);
      setError('Erro ao carregar o mês corrente');
    }
  };

  // Função para buscar os meses disponíveis
  const fetchMesesExtrato = async () => {
    try {
      console.log('Enviando requisição para buscar meses de extrato para cartão:', cartao);
      const formData = new FormData();
      formData.append('cartao', cartao.trim());
      
      const response = await axios.post('/api/meses-extrato', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Resposta da API de meses de extrato:', response.data);
      setMesesExtrato(response.data);
    } catch (error) {
      console.error('Erro ao buscar meses de extrato:', error);
      setError('Erro ao carregar os meses disponíveis');
    }
  };

  // Função para buscar o extrato
  const fetchExtractByMonth = async (mes: string) => {
    setLoading(true);
    setError(null);

    try {
      // Primeiro, buscar dados do associado
      const formDataAssociado = new FormData();
      formDataAssociado.append('cartao', cartao.trim());
      
      const associadoResponse = await axios.post<AssociadoResponse>('/api/localiza-associado', 
        { cartao: cartao.trim() },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!associadoResponse.data) {
        throw new Error('Dados do associado não encontrados');
      }

      const { matricula, empregador } = associadoResponse.data;

      // Agora buscar o extrato com os dados do associado
      const formDataConta = new FormData();
      formDataConta.append('matricula', matricula);
      formDataConta.append('empregador', empregador.toString());
      formDataConta.append('mes', mes);
      
      const extratoResponse = await axios.post<ContaResponse[]>('/api/conta', formDataConta, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Resposta do endpoint conta:', extratoResponse.data);

      if (Array.isArray(extratoResponse.data)) {
        const formattedData = extratoResponse.data.map((item) => ({
          data: `${item.dia} ${item.hora}`,
          valor: item.valor,
          descricao: item.nomefantasia || item.razaosocial || 'N/A',
          tipo: 'debito' as const,
          codigo: item.associado,
          nome: item.nome,
          mes: item.mes,
          ano: item.mes.split('/')[1],
          uri_cupom: item.uri_cupom,
          parcela: item.parcela
        }));
        setExtractData(formattedData);
      } else {
        setExtractData([]);
      }
    } catch (error) {
      console.error('Erro ao buscar extrato:', error);
      setError('Erro ao carregar o extrato');
      setExtractData([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchMesCorrente(),
        fetchMesesExtrato()
      ]);
    };
    loadInitialData();
  }, [cartao]);

  // Carregar extrato quando o mês selecionado mudar
  useEffect(() => {
    if (mesSelecionado) {
      fetchExtractByMonth(mesSelecionado);
      
      // Centralizar o mês selecionado na visualização quando mudar
      setTimeout(() => {
        const botaoSelecionado = document.getElementById(`mes-${mesSelecionado}`);
        if (botaoSelecionado) {
          const container = document.getElementById('meses-container');
          if (container) {
            // Calcular a posição para centralizar
            const containerWidth = container.offsetWidth;
            const botaoWidth = botaoSelecionado.offsetWidth;
            const scrollLeft = botaoSelecionado.offsetLeft - (containerWidth / 2) + (botaoWidth / 2);
            
            // Aplicar scroll suave
            container.scrollTo({
              left: scrollLeft,
              behavior: 'smooth'
            });
          }
        }
      }, 300);
    }
  }, [mesSelecionado]);

  // Filtrar dados baseado no termo de busca
  const filteredExtract = extractData.filter(item =>
    item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.valor.includes(searchTerm) ||
    item.data.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para formatar o valor
  const formatValue = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  // Função para formatar a data
  const formatDate = (dateStr: string) => {
    try {
      const [date, time] = dateStr.split(' ');
      return format(new Date(date + 'T' + time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (err) {
      console.error('Erro ao formatar data:', err);
      return dateStr;
    }
  };

  // Função para centralizar o mês selecionado na visualização
  const centralizarMesSelecionado = (mesAbreviacao: string) => {
    setMesSelecionado(mesAbreviacao);
    
    // Encontrar o botão do mês selecionado e centralizar na visualização
    setTimeout(() => {
      const botaoSelecionado = document.getElementById(`mes-${mesAbreviacao}`);
      if (botaoSelecionado) {
        const container = document.getElementById('meses-container');
        if (container) {
          // Calcular a posição para centralizar
          const containerWidth = container.offsetWidth;
          const botaoWidth = botaoSelecionado.offsetWidth;
          const scrollLeft = botaoSelecionado.offsetLeft - (containerWidth / 2) + (botaoWidth / 2);
          
          // Aplicar scroll suave
          container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }
    }, 100);
  };

  return (
    <div className="space-y-4">
      {/* Seletor de Meses */}
      <div id="meses-container" className="flex overflow-x-auto pb-2 gap-2 no-scrollbar relative">
        <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="flex mx-auto">
          {mesesExtrato.map((mes) => (
            <button
              id={`mes-${mes.abreviacao}`}
              key={mes.abreviacao}
              onClick={() => centralizarMesSelecionado(mes.abreviacao)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center whitespace-nowrap mx-1 ${
                mesSelecionado === mes.abreviacao
                  ? 'bg-blue-600 text-white transform scale-110 shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                <span>{mes.abreviacao}</span>
              </div>
              <div className="text-xs font-normal mt-1">{mes.periodo}</div>
            </button>
          ))}
        </div>
        <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar no extrato..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabela de Extrato */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estabelecimento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parcela
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  Carregando...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : filteredExtract.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              filteredExtract.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.data)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.descricao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatValue(item.valor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.parcela || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 