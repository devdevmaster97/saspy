'use client';

import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaSpinner, FaClockRotateLeft, FaArrowRotateLeft, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa6';

interface AntecipacaoProps {
  cartao?: string;
}

interface AssociadoData {
  matricula: string;
  empregador: string;
  nome: string;
  limite: string;
  email: string;
  cel: string;
  cpf: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface SaldoData {
  saldo: number;
  limite: number;
  total: number;
  mesCorrente: string;
  porcentagem?: number;
}

interface SolicitacaoAntecipacao {
  id: string;
  matricula: string;
  data_solicitacao: string;
  valor_solicitado: string;
  taxa: string;
  valor_descontar: string;
  mes_corrente: string;
  chave_pix: string;
  status: string;
}

export default function AntecipacaoContent({ cartao: propCartao }: AntecipacaoProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [associadoData, setAssociadoData] = useState<AssociadoData | null>(null);
  const [saldoData, setSaldoData] = useState<SaldoData | null>(null);
  const [cartao, setCartao] = useState('');
  const [valorSolicitado, setValorSolicitado] = useState("");
  const [valorFormatado, setValorFormatado] = useState("");
  const [taxa, setTaxa] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [chavePix, setChavePix] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [solicitado, setSolicitado] = useState(false);
  const [solicitacaoData, setSolicitacaoData] = useState("");
  const [ultimasSolicitacoes, setUltimasSolicitacoes] = useState<SolicitacaoAntecipacao[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  
  // Valores para exibição após a solicitação ser enviada
  const [valorConfirmado, setValorConfirmado] = useState("");
  const [taxaConfirmada, setTaxaConfirmada] = useState(0);
  const [totalConfirmado, setTotalConfirmado] = useState(0);

  // Função para buscar o mês corrente
  const fetchMesCorrente = useCallback(async (cartaoParam: string) => {
    try {
      if (!cartaoParam) {
        console.error('Cartão não fornecido para buscar mês corrente');
        return null;
      }

      const formData = new FormData();
      formData.append('cartao', cartaoParam.trim());
      
      console.log('Buscando mês corrente para cartão:', cartaoParam);
      
      const response = await axios.post('/api/mes-corrente', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Resposta da API de mês corrente:', response.data);
      
      // A API agora sempre retorna um array com pelo menos um item
      if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].abreviacao) {
        const mesAtual = response.data[0].abreviacao;
        const porcentagem = parseFloat(response.data[0].porcentagem || '0');
        console.log('Mês corrente obtido:', mesAtual, 'porcentagem:', porcentagem);
        return { mesAtual, porcentagem };
      } else {
        // Em caso de problemas, usamos o mês atual
        const dataAtual = new Date();
        const mes = dataAtual.getMonth();
        const ano = dataAtual.getFullYear();
        const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const mesAtual = `${meses[mes]}/${ano}`;
        console.log('Usando mês atual como fallback:', mesAtual);
        return { mesAtual, porcentagem: 0 };
      }
    } catch (err) {
      console.error('Erro ao buscar mês corrente:', err);
      // Em caso de erro, retornar o mês atual
      const dataAtual = new Date();
      const mes = dataAtual.getMonth();
      const ano = dataAtual.getFullYear();
      const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      const mesAtual = `${meses[mes]}/${ano}`;
      console.log('Usando mês atual como fallback após erro:', mesAtual);
      return { mesAtual, porcentagem: 0 };
    }
  }, []);

  // Função para buscar os dados da conta e calcular o saldo
  const fetchConta = useCallback(async (matricula: string, empregador: string, mes: string) => {
    try {
      // Não buscar dados do associado novamente, usar os que já temos
      if (!matricula || !empregador) {
        throw new Error('Matrícula ou empregador não fornecidos');
      }

      // Agora buscar os dados da conta com os dados do associado
      const formDataConta = new FormData();
      formDataConta.append('matricula', matricula);
      formDataConta.append('empregador', empregador.toString());
      formDataConta.append('mes', mes);
      
      const response = await axios.post('/api/conta', formDataConta, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (Array.isArray(response.data)) {
        // Calcular o total das contas
        let total = 0;
        for (const item of response.data) {
          total += parseFloat(item.valor || '0');
        }
        
        return total;
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Erro ao buscar dados da conta:', error);
      throw error;
    }
  }, []);

  // Função para buscar dados do associado uma única vez
  const fetchAssociado = useCallback(async (cartaoParam: string) => {
    try {
      const formDataAssociado = new FormData();
      formDataAssociado.append('cartao', cartaoParam.trim());
      
      const associadoResponse = await axios.post('/api/localiza-associado', formDataAssociado, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!associadoResponse.data) {
        throw new Error('Dados do associado não encontrados');
      }

      return associadoResponse.data;
    } catch (error) {
      console.error('Erro ao buscar dados do associado:', error);
      throw error;
    }
  }, []);

  // Função principal para carregar todos os dados
  const loadSaldoData = useCallback(async () => {
    if (!cartao || !associadoData) {
      return;
    }
    
    try {
      setLoading(true);
      setErro("");
      
      // 1. Buscar mês corrente
      const { mesAtual, porcentagem } = await fetchMesCorrente(cartao) || { mesAtual: null, porcentagem: 0 };
      
      if (!mesAtual) {
        throw new Error('Mês corrente não disponível');
      }
      
      // 2. Buscar dados da conta com os dados do associado que já temos
      const total = await fetchConta(
        associadoData.matricula, 
        associadoData.empregador, 
        mesAtual
      );
      
      // 3. Calcular saldo
      const limite = parseFloat(associadoData.limite || '0');
      const saldo = limite - total;
      
      // 4. Atualizar o estado
      setSaldoData({
        saldo,
        limite,
        total,
        mesCorrente: mesAtual,
        porcentagem
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados de saldo:', error);
      if (error instanceof Error) {
        setErro(`Não foi possível carregar seus dados: ${error.message}`);
      } else {
        setErro('Não foi possível carregar seus dados. Tente novamente.');
      }
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  }, [cartao, associadoData, fetchMesCorrente, fetchConta]);

  // Função para buscar o histórico de solicitações
  const fetchHistoricoSolicitacoes = useCallback(async () => {
    if (!associadoData?.matricula) return;
    
    try {
      setLoadingHistorico(true);
      
      const formData = new FormData();
      formData.append('matricula', associadoData.matricula);
      formData.append('empregador', associadoData.empregador.toString());
      
      const response = await axios.post('/api/historico-antecipacao', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (Array.isArray(response.data)) {
        setUltimasSolicitacoes(response.data);
      } else {
        console.error('Formato de resposta inválido para histórico de solicitações');
        setUltimasSolicitacoes([]);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico de solicitações:', error);
      setUltimasSolicitacoes([]);
    } finally {
      setLoadingHistorico(false);
    }
  }, [associadoData]);

  // Carregar o cartão do usuário - apenas uma vez
  useEffect(() => {
    // Priorizar o cartão passado como prop
    const cartaoAtual = propCartao || session?.user?.cartao || '';
    
    if (cartaoAtual) {
      setCartao(cartaoAtual);
    } else if (typeof window !== 'undefined') {
      // Tentar obter do localStorage se não foi fornecido de outra forma
      const storedUser = localStorage.getItem('qrcred_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setCartao(parsedUser.cartao || '');
        } catch (e) {
          console.error('Erro ao ler dados do usuário do localStorage', e);
        }
      }
    }
  }, [propCartao, session]);

  // Carregar o associado quando tiver o cartão - apenas uma vez
  useEffect(() => {
    if (cartao && !associadoData) {
      const getAssociado = async () => {
        try {
          setIsInitialLoading(true);
          const data = await fetchAssociado(cartao);
          setAssociadoData(data);
        } catch (error) {
          console.error('Erro ao buscar dados do associado:', error);
          setErro('Não foi possível carregar seus dados. Tente novamente.');
          setIsInitialLoading(false);
        }
      };
      
      getAssociado();
    }
  }, [cartao, fetchAssociado, associadoData]);

  // Carregar dados de saldo e histórico quando o associado estiver disponível
  useEffect(() => {
    if (associadoData) {
      if (isInitialLoading) {
        loadSaldoData();
      }
      fetchHistoricoSolicitacoes();
    }
  }, [associadoData, loadSaldoData, isInitialLoading, fetchHistoricoSolicitacoes]);

  // Formatar o valor como moeda brasileira
  const formatarValor = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Manipular mudança no input de valor
  const handleValorChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Limpar qualquer formatação
    const valor = e.target.value.replace(/\D/g, '');
    
    // Converter para número
    const valorNumerico = parseFloat(valor) / 100;
    setValorSolicitado(valor);
    
    // Validar se o valor é válido
    if (valorNumerico > (saldoData?.saldo || 0)) {
      setErro(`Valor indisponível. Saldo restante: ${formatarValor(saldoData?.saldo || 0)}`);
      setValorFormatado("");
      setTaxa(0);
      setValorTotal(0);
    } else if (valorNumerico > 0) {
      setErro("");
      // Formatar o valor para exibição
      setValorFormatado(formatarValor(valorNumerico));
      
      // Calcular taxa
      const taxaCalculada = valorNumerico * (saldoData?.porcentagem || 0) / 100;
      setTaxa(taxaCalculada);
      
      // Calcular valor total
      setValorTotal(valorNumerico + taxaCalculada);
    } else {
      setErro("");
      setValorFormatado("");
      setTaxa(0);
      setValorTotal(0);
    }
  };

  // Manipular envio do formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!valorSolicitado || parseFloat(valorSolicitado) / 100 <= 0) {
      setErro("Digite o valor desejado");
      return;
    }
    
    if (!chavePix) {
      setErro("Digite a chave PIX para receber o valor");
      return;
    }

    if (!senha) {
      setErro("Digite sua senha para confirmar");
      return;
    }

    setLoading(true);
    try {
      const valorNumerico = parseFloat(valorSolicitado) / 100;
      
      const response = await axios.post('/api/antecipacao', {
        matricula: associadoData?.matricula,
        pass: senha,
        empregador: associadoData?.empregador,
        valor_pedido: valorNumerico.toFixed(2),
        taxa: taxa.toFixed(2),
        valor_descontar: valorTotal.toFixed(2),
        mes_corrente: saldoData?.mesCorrente,
        chave_pix: chavePix
      });

      if (response.data.success === false) {
        if (response.data.message.includes("Senha")) {
          setErro("Senha incorreta!");
        } else {
          setErro(response.data.message);
        }
      } else {
        // Salvar os valores confirmados antes de limpar o formulário
        setValorConfirmado(valorFormatado);
        setTaxaConfirmada(taxa);
        setTotalConfirmado(valorTotal);
        
        // Sucesso na solicitação
        setSolicitado(true);
        setSolicitacaoData(format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }));
        toast.success("Solicitação enviada para análise!");
        
        // Limpar apenas o formulário para novas entradas
        setValorSolicitado("");
        setChavePix("");
        setSenha("");
        setErro("");
        
        // Atualizar o histórico de solicitações
        await fetchHistoricoSolicitacoes();
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      setErro('Não foi possível processar sua solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Formatar status para exibição amigável
  const formatarStatus = (status: string | null | undefined | boolean) => {
    // Se for booleano, converter para string
    if (typeof status === 'boolean') {
      return status 
        ? <span className="text-green-600 font-medium flex items-center"><FaCheckCircle className="mr-1" /> Aprovada</span>
        : <span className="text-red-600 font-medium flex items-center"><FaTimesCircle className="mr-1" /> Recusada</span>;
    }
    
    // Se for nulo ou indefinido, retornar pendente
    if (!status) {
      return <span className="text-yellow-600 font-medium flex items-center"><FaHourglassHalf className="mr-1" /> Pendente</span>;
    }
    
    // Se for string, verificar os valores
    switch (status.toLowerCase()) {
      case 'aprovado':
      case 'aprovada':
      case 's':
      case 'sim':
        return <span className="text-green-600 font-medium flex items-center"><FaCheckCircle className="mr-1" /> Aprovada</span>;
      case 'recusado':
      case 'recusada':
      case 'n':
      case 'nao':
      case 'não':
        return <span className="text-red-600 font-medium flex items-center"><FaTimesCircle className="mr-1" /> Recusada</span>;
      case 'pendente':
      case 'analise':
      case 'análise':
        return <span className="text-yellow-600 font-medium flex items-center"><FaHourglassHalf className="mr-1" /> Em análise</span>;
      default:
        return <span className="text-yellow-600 font-medium flex items-center"><FaHourglassHalf className="mr-1" /> Pendente</span>;
    }
  };

  // Função para verificar se a solicitação está aprovada
  const isAprovada = (solicitacao: SolicitacaoAntecipacao) => {
    if (typeof solicitacao.status === 'boolean') {
      return solicitacao.status;
    }
    
    if (!solicitacao.status) {
      return false;
    }
    
    const statusLower = solicitacao.status.toLowerCase();
    return ['aprovado', 'aprovada', 's', 'sim'].includes(statusLower);
  };

  // Função para verificar se a solicitação está recusada
  const isRecusada = (solicitacao: SolicitacaoAntecipacao) => {
    if (typeof solicitacao.status === 'boolean') {
      return solicitacao.status === false;
    }
    
    if (!solicitacao.status) {
      return false;
    }
    
    const statusLower = solicitacao.status.toLowerCase();
    return ['recusado', 'recusada', 'n', 'nao', 'não'].includes(statusLower);
  };

  // Função para verificar se a solicitação está pendente
  const isPendente = (solicitacao: SolicitacaoAntecipacao) => {
    return !isAprovada(solicitacao) && !isRecusada(solicitacao);
  };
  
  // Filtrar solicitações
  const solicitacoesPendentes = ultimasSolicitacoes.filter(isPendente);
  const solicitacoesAprovadas = ultimasSolicitacoes.filter(isAprovada);
  const solicitacoesRecusadas = ultimasSolicitacoes.filter(isRecusada);

  if (isInitialLoading && !associadoData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Solicitação de Antecipação</h2>
        
        {/* Saldo Disponível */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-gray-600">Saldo Disponível:</h3>
            <button 
              onClick={() => loadSaldoData()}
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white transition-colors"
              title="Atualizar saldo"
              disabled={loading}
              type="button"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaArrowRotateLeft />}
            </button>
          </div>
          {erro && !valorSolicitado ? (
            <div className="text-red-500 mt-2">{erro}</div>
          ) : (
            <p className="text-2xl font-bold text-green-600">
              {saldoData ? formatarValor(saldoData.saldo) : 'Carregando...'}
            </p>
          )}
          {saldoData?.mesCorrente && (
            <p className="text-sm text-gray-500 mt-1">
              Referente ao mês: {saldoData.mesCorrente}
            </p>
          )}
        </div>
        
        {/* Status de Solicitações */}
        {ultimasSolicitacoes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-medium text-gray-700">Status de Solicitações</h3>
              <button 
                onClick={() => fetchHistoricoSolicitacoes()}
                className="text-blue-600 p-1 rounded hover:bg-blue-50"
                title="Atualizar histórico"
                disabled={loadingHistorico}
                type="button"
              >
                {loadingHistorico ? <FaSpinner className="animate-spin" /> : <FaArrowRotateLeft />}
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {loadingHistorico ? (
                <div className="flex justify-center py-4">
                  <FaSpinner className="animate-spin text-blue-600" />
                </div>
              ) : ultimasSolicitacoes.length === 0 ? (
                <p className="text-gray-500 text-center py-2">Nenhuma solicitação encontrada</p>
              ) : (
                <div className="space-y-3">
                  {/* Solicitações Mais Recentes (limitando a 3) */}
                  {ultimasSolicitacoes.slice(0, 3).map((solicitacao) => (
                    <div 
                      key={solicitacao.id} 
                      className={`p-3 rounded-lg border ${
                        isAprovada(solicitacao) 
                          ? 'bg-green-50 border-green-200' 
                          : isRecusada(solicitacao)
                            ? 'bg-red-50 border-red-200'
                            : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">
                            {Number(solicitacao.valor_solicitado).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </div>
                          <div className="text-xs text-gray-600">
                            {format(new Date(solicitacao.data_solicitacao), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatarStatus(solicitacao.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {ultimasSolicitacoes.length > 3 && (
                    <button
                      onClick={() => fetchHistoricoSolicitacoes()}
                      className="text-blue-600 text-sm hover:underline w-full text-center py-1"
                      type="button"
                    >
                      Ver mais solicitações
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {solicitado ? (
          /* Resumo da Solicitação */
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Solicitação Enviada</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Valor: </span>
                {valorConfirmado}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Taxa: </span>
                {formatarValor(taxaConfirmada)}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Total a Descontar: </span>
                {formatarValor(totalConfirmado)}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Solicitado em: </span>
                {solicitacaoData}
              </p>
            </div>
            <div className="mt-4 flex flex-col space-y-2">
              <p className="text-blue-600 text-sm">
                Sua solicitação está em análise. Em breve você receberá o resultado.
              </p>
              <button
                onClick={() => setSolicitado(false)}
                className="mt-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                type="button"
              >
                Nova Solicitação
              </button>
            </div>
          </div>
        ) : (
          /* Formulário de Solicitação */
          <form onSubmit={handleSubmit}>
            {/* Campo de Valor */}
            <div className="mb-4">
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                Valor Desejado
              </label>
              <input
                type="text"
                id="valor"
                placeholder="R$ 0,00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                onChange={handleValorChange}
                value={valorSolicitado ? (parseFloat(valorSolicitado) / 100).toFixed(2).replace('.', ',') : ''}
                disabled={loading}
              />
              {valorFormatado && (
                <div className="mt-2 text-sm text-gray-600">
                  Valor: {valorFormatado}
                </div>
              )}
            </div>
            
            {/* Simulação de Taxa e Valor Total */}
            {valorFormatado && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Simulação:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm text-gray-600">Taxas :</p>
                  <p className="text-sm text-gray-800 font-medium">{formatarValor(taxa)}</p>
                  <p className="text-sm text-gray-600">Total a Descontar:</p>
                  <p className="text-sm text-gray-800 font-medium">{formatarValor(valorTotal)}</p>
                </div>
              </div>
            )}
            
            {/* Chave PIX */}
            <div className="mb-4">
              <label htmlFor="chave-pix" className="block text-sm font-medium text-gray-700 mb-1">
                Chave PIX para Recebimento
              </label>
              <input
                type="text"
                id="chave-pix"
                placeholder="CPF, E-mail, Celular ou Chave Aleatória"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {/* Senha */}
            <div className="mb-6">
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha (para confirmar)
              </label>
              <input
                type="password"
                id="senha"
                placeholder="Digite sua senha"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {/* Mensagem de Erro */}
            {erro && valorSolicitado && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                {erro}
              </div>
            )}
            
            {/* Botão de Envio */}
            <button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Processando...
                </span>
              ) : (
                "Solicitar Antecipação"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 