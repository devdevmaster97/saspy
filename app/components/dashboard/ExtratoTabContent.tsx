'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiSearch, FiDownload, FiEye } from 'react-icons/fi';
import { FaCalendarAlt, FaAngleRight } from 'react-icons/fa';

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
  parcela: string;
}

interface ExtratoTabContentProps {
  cartao: string;
  theme: string;
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
  parcela: string;
}

export default function ExtratoTabContent({ cartao, theme }: ExtratoTabContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [extractData, setExtractData] = useState<ExtratoItem[]>([]);
  const [mesesExtrato, setMesesExtrato] = useState<MesExtrato[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);
  const mesesContainerRef = useRef<HTMLDivElement>(null);
  const mesButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [userData, setUserData] = useState<{ nome: string; matricula: string }>({ nome: '', matricula: '' });

  // Classes baseadas no tema
  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';
  const textErrorClass = theme === 'dark' ? 'text-red-400' : 'text-red-500';
  const bgCardClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const bgAlertClass = theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50';
  const borderAlertClass = theme === 'dark' ? 'border-blue-800' : 'border-blue-100';
  const textAlertClass = theme === 'dark' ? 'text-blue-300' : 'text-blue-800';
  const bgHeaderClass = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50';
  const textHeaderClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';
  const bgHoverClass = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-blue-50';
  const bgTableBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const bgFooterClass = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50';
  const dividerClass = theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200';
  const borderInputClass = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const ringClass = theme === 'dark' ? 'focus:ring-blue-400' : 'focus:ring-blue-500';
  const bgBtnClass = theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  const bgBtnActiveClass = theme === 'dark' ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white';
  const textBtnInactiveClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  // Recuperar dados do usuário
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('qrcred_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUserData({
            nome: userData.nome || '',
            matricula: userData.matricula || ''
          });
        } catch (error) {
          console.error('Erro ao recuperar dados do usuário:', error);
        }
      }
    }
  }, []);

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
          parcela: item.parcela || '1'
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
      
      // Rolar para o mês selecionado quando ele é definido
      setTimeout(() => {
        const buttonElement = mesButtonRefs.current.get(mesSelecionado);
        if (buttonElement && mesesContainerRef.current) {
          const container = mesesContainerRef.current;
          const scrollLeft = buttonElement.offsetLeft - container.offsetWidth / 2 + buttonElement.offsetWidth / 2;
          
          container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [mesSelecionado]);

  // Filtrar dados baseado no termo de busca
  const filteredExtract = extractData.filter(item =>
    item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.valor.includes(searchTerm) ||
    item.data.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular a soma total dos valores
  const totalValor = filteredExtract.reduce((sum, item) => {
    // Converter valor de string para número, removendo formatação
    const valor = parseFloat(item.valor.replace(/[^\d,.-]/g, '').replace(',', '.'));
    return sum + (isNaN(valor) ? 0 : valor);
  }, 0);

  // Função para formatar o valor
  const formatValue = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  // Função para formatar um número diretamente
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  // Função para selecionar um mês e garantir que esteja visível
  const handleSelectMonth = (mes: string) => {
    setMesSelecionado(mes);
    
    // Scroll para o botão selecionado ficar visível
    setTimeout(() => {
      const buttonElement = mesButtonRefs.current.get(mes);
      if (buttonElement && mesesContainerRef.current) {
        const container = mesesContainerRef.current;
        const scrollLeft = buttonElement.offsetLeft - container.offsetWidth / 2 + buttonElement.offsetWidth / 2;
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  // Função para navegar para a página de comprovante
  const handleRowClick = (item: ExtratoItem, index: number) => {
    // Extrair data e hora do formato "2023-04-10 14:30:00"
    let data = item.data;
    let hora = '';
    
    if (item.data.includes(' ')) {
      const [dataPart, horaPart] = item.data.split(' ');
      
      // Tentar formatar a data
      try {
        const dateObj = new Date(dataPart + 'T' + horaPart);
        data = format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
        hora = format(dateObj, 'HH:mm', { locale: ptBR });
      } catch (err) {
        console.error('Erro ao formatar data/hora:', err);
        data = dataPart;
        hora = horaPart;
      }
    }

    // Criar objeto com todas as informações necessárias
    const lancamentoInfo = {
      data,
      hora,
      valor: item.valor,
      descricao: item.descricao,
      nome: userData.nome,
      matricula: userData.matricula,
      cartao,
      parcela: item.parcela,
      mes: item.mes,
      codigo: item.codigo
    };

    // Gerar ID único para o lançamento
    const lancamentoId = `${Date.now()}-${index}`;
    
    // Salvar no localStorage
    localStorage.setItem(`lancamento_${lancamentoId}`, JSON.stringify(lancamentoInfo));
    
    // Navegar para a página de comprovante
    router.push(`/dashboard/comprovante/${lancamentoId}`);
  };

  return (
    <div className="space-y-4">
      {/* Mês selecionado atual - exibido em destaque */}
      {mesSelecionado && (
        <div className={`${bgAlertClass} p-3 rounded-lg border ${borderAlertClass}`}>
          <h3 className={`${textAlertClass} font-medium flex items-center`}>
            <FaCalendarAlt className="mr-2" />
            Extrato de {mesesExtrato.find(m => m.abreviacao === mesSelecionado)?.completo || mesSelecionado}
          </h3>
          <p className={`${textAlertClass} text-sm mt-1`}>
            {mesesExtrato.find(m => m.abreviacao === mesSelecionado)?.periodo || ''}
          </p>
        </div>
      )}
      
      {/* Seletor de Meses */}
      <div className="relative">
        <div 
          ref={mesesContainerRef}
          className="flex overflow-x-auto pb-2 gap-2 no-scrollbar scrollbar-hide" 
          style={{ scrollBehavior: 'smooth' }}
        >
          {mesesExtrato.map((mes) => (
            <button
              key={mes.abreviacao}
              ref={(el) => {
                if (el) mesButtonRefs.current.set(mes.abreviacao, el);
              }}
              onClick={() => handleSelectMonth(mes.abreviacao)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center whitespace-nowrap min-w-[120px] relative ${
                mesSelecionado === mes.abreviacao
                  ? bgBtnActiveClass
                  : bgBtnClass
              }`}
            >
              {mesSelecionado === mes.abreviacao && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-blue-600">
                  <svg width="16" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 8L0 0H16L8 8Z" fill="currentColor" />
                  </svg>
                </div>
              )}
              <div className="flex items-center">
                <FaCalendarAlt className={`mr-2 ${mesSelecionado === mes.abreviacao ? 'text-white' : textBtnInactiveClass}`} />
                <span>{mes.abreviacao}</span>
              </div>
              <div className={`text-xs mt-1 ${mesSelecionado === mes.abreviacao ? 'text-blue-100' : textBtnInactiveClass}`}>
                {mes.periodo}
              </div>
            </button>
          ))}
        </div>
        
        {/* Indicadores de scroll para dispositivos móveis */}
        <div className="lg:hidden flex justify-center mt-2">
          <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondaryClass}`} />
        <input
          type="text"
          placeholder="Pesquisar no extrato..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 border ${borderInputClass} rounded-lg focus:outline-none focus:ring-2 ${ringClass} ${bgCardClass} ${textPrimaryClass}`}
        />
      </div>

      {/* Tabela de Extrato */}
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${dividerClass}`}>
          <thead className={bgHeaderClass}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${textHeaderClass} uppercase tracking-wider`}>
                Data/Hora
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${textHeaderClass} uppercase tracking-wider`}>
                Estabelecimento
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${textHeaderClass} uppercase tracking-wider`}>
                Valor
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${textHeaderClass} uppercase tracking-wider`}>
                Parcela
              </th>
            </tr>
          </thead>
          <tbody className={`${bgTableBgClass} divide-y ${dividerClass}`}>
            {loading ? (
              <tr>
                <td colSpan={4} className={`px-6 py-4 text-center ${textSecondaryClass}`}>
                  Carregando...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className={`px-6 py-4 text-center ${textErrorClass}`}>
                  {error}
                </td>
              </tr>
            ) : filteredExtract.length === 0 ? (
              <tr>
                <td colSpan={4} className={`px-6 py-4 text-center ${textSecondaryClass}`}>
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              <>
                {filteredExtract.map((item, index) => (
                  <tr 
                    key={index}
                    onClick={() => handleRowClick(item, index)}
                    className={`${bgHoverClass} cursor-pointer transition-colors group`}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondaryClass}`}>
                      {formatDate(item.data)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${textPrimaryClass}`}>
                      {item.descricao}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${textPrimaryClass}`}>
                      {formatValue(item.valor)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${textPrimaryClass} flex items-center justify-between`}>
                      <span>{item.parcela || '1'}</span>
                      <FaAngleRight className={`${textSecondaryClass} group-hover:text-blue-500 transition-colors ml-2`} />
                    </td>
                  </tr>
                ))}
                {/* Linha de totais */}
                <tr className={bgFooterClass}>
                  <td colSpan={2} className={`px-6 py-4 text-right text-sm ${textSecondaryClass} font-medium`}>
                    Total:
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${textPrimaryClass} font-bold`}>
                    {formatCurrency(totalValor)}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 