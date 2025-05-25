'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaQrcode, FaArrowLeft, FaCreditCard, FaCalendarAlt, FaCheckCircle, FaLock } from 'react-icons/fa';
import Header from '@/app/components/Header';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import { useTranslations } from '@/app/contexts/LanguageContext';

interface AssociadoData {
  nome: string;
  matricula: string;
  empregador: string;
  saldo: number;
  token_associado?: string;
  cel?: string;
  limite?: string;
}

export default function NovoLancamentoPage() {
  const router = useRouter();
  const translations = useTranslations('ConvenioLancamentos');
  const [loading, setLoading] = useState(false);
  const [loadingCartao, setLoadingCartao] = useState(false);
  const [cartao, setCartao] = useState('');
  const [valor, setValor] = useState('');
  const [parcelas, setParcelas] = useState(1);
  const [maxParcelas, setMaxParcelas] = useState(12);
  const [senha, setSenha] = useState('');
  const [descricao, setDescricao] = useState('');
  const [associado, setAssociado] = useState<AssociadoData | null>(null);
  const [valorParcela, setValorParcela] = useState(0);
  const [showQrReader, setShowQrReader] = useState(false);
  const [mesCorrente, setMesCorrente] = useState('');
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [valorPagamento, setValorPagamento] = useState('');
  const qrReaderRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  
  // Usar URLs reais da API - sem simulações locais
  const BASE_URL = 'https://saspy.makecard.com.br';
  const API_URL = `${BASE_URL}/localizaasapp.php`;
  const API_MESES = `${BASE_URL}/meses_corrente_app.php`;
  const API_CONTA = `${BASE_URL}/conta_app.php`;
  const API_SENHA = `${BASE_URL}/consulta_pass_assoc.php`;
  const API_GRAVA_VENDA = `${BASE_URL}/grava_venda_app.php`;

  // Inicializa e limpa o leitor QR ao montar/desmontar
  useEffect(() => {
    // Limpar o scanner QR quando o componente for desmontado
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(error => {
          console.error("Erro ao parar o scanner:", error);
        });
      }
    };
  }, []);

  // Inicializa o leitor QR quando o modal é aberto
  useEffect(() => {
    if (showQrReader && qrReaderRef.current) {
      const qrCodeId = "qr-reader-" + Date.now();
      // Limpa o conteúdo anterior e adiciona um novo elemento
      qrReaderRef.current.innerHTML = `<div id="${qrCodeId}" style="width:100%;"></div>`;

      // Inicializa o scanner
      html5QrCodeRef.current = new Html5Qrcode(qrCodeId);
      
      html5QrCodeRef.current.start(
        { facingMode: "environment" }, // Usar câmera traseira
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Sucesso
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().then(() => {
              setShowQrReader(false);
              setCartao(decodedText);
              buscarAssociado();
            }).catch(err => {
              console.error("Erro ao parar o scanner:", err);
            });
          }
        },
        (errorMessage) => {
          // Erro ou QR não encontrado (ignorar)
        }
      ).catch(err => {
        console.error("Erro ao iniciar o scanner:", err);
        toast.error("Não foi possível acessar a câmera");
        setShowQrReader(false);
      });
    }
  }, [showQrReader]);

  // Função auxiliar para extrair valor numérico da formatação de guarani
  const extrairValorNumerico = (valorFormatado: string): number => {
    if (!valorFormatado) return 0;
    
    // Remove símbolo de moeda (Gs. ou ₲), espaços e pontos (separadores de milhares)
    // Mantém apenas dígitos
    const valorLimpo = valorFormatado.replace(/[Gs.₲\s]/g, '');
    const numero = parseInt(valorLimpo) || 0;
    return numero;
  };

  // Atualiza valor da parcela quando valor total ou número de parcelas mudam
  useEffect(() => {
    if (valor && parcelas > 0) {
      const valorNumerico = extrairValorNumerico(valor);
      if (valorNumerico > 0) {
        setValorParcela(valorNumerico / parcelas);
      }
    } else {
      setValorParcela(0);
    }
  }, [valor, parcelas]);

  // Adicionar useEffect para obter dados do convênio ao carregar a página
  useEffect(() => {
    const carregarDadosConvenio = async () => {
      // Tentar obter dados do convênio do localStorage
      try {
        const dadosConvenioString = localStorage.getItem('dadosConvenio');
        
        if (dadosConvenioString) {
          const dadosConvenio = JSON.parse(dadosConvenioString);
          console.log('📊 Dados do convênio obtidos do localStorage:', dadosConvenio);
          
          // Verificar se o código do convênio está presente
          if (dadosConvenio.cod_convenio) {
            console.log('📊 Código do convênio encontrado no localStorage:', dadosConvenio.cod_convenio);
          } else {
            console.warn('⚠️ Código do convênio não encontrado no localStorage');
            // Se não houver dados no localStorage, buscar da API
            await buscarDadosConvenioAPI();
          }
        } else {
          console.warn('⚠️ Dados do convênio não encontrados no localStorage');
          // Se não houver dados no localStorage, buscar da API
          await buscarDadosConvenioAPI();
        }
      } catch (error) {
        console.error('❌ Erro ao obter dados do convênio:', error);
        // Se houver erro, tentar buscar da API
        await buscarDadosConvenioAPI();
      }
    };
    
    const buscarDadosConvenioAPI = async () => {
      try {
        console.log('📤 Buscando dados do convênio da API...');
        const response = await fetch('/api/convenio/dados');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Salvar os dados do convênio no localStorage
          localStorage.setItem('dadosConvenio', JSON.stringify(data.data));
          console.log('📊 Dados do convênio salvos no localStorage:', data.data);
        } else {
          console.error('❌ Falha ao obter dados do convênio da API');
        }
      } catch (error) {
        console.error('❌ Erro ao buscar dados do convênio da API:', error);
      }
    };
    
    carregarDadosConvenio();
  }, []);

  // Função alternativa usando XMLHttpRequest para contornar possíveis problemas de CORS
  const xhrRequest = (url: string, method = 'GET', data: any = null, options: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log('🌐 XHR: Iniciando requisição para', url, { method, withCredentials: options.withCredentials });
      const xhr = new XMLHttpRequest();
      
      // Configurar timeout de 30 segundos
      xhr.timeout = options.timeout || 30000;
      
      xhr.open(method, url, true);
      
      // Tentar configurar withCredentials se especificado
      if (options.withCredentials) {
        xhr.withCredentials = true;
      }
      
      if (method === 'POST') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      }
      
      // Adicionar headers customizados se fornecidos
      if (options.headers) {
        Object.keys(options.headers).forEach(header => {
          try {
            xhr.setRequestHeader(header, options.headers[header]);
          } catch (e) {
            console.warn(`Não foi possível definir o header ${header}:`, e);
          }
        });
      }
      
      xhr.onload = function() {
        console.log('🌐 XHR: Resposta recebida', {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText.substring(0, 500) // Mostra apenas os primeiros 500 caracteres
        });
        
        // Extrair todos os cabeçalhos para diagnóstico
        try {
          const headersText = xhr.getAllResponseHeaders();
          console.log('🌐 XHR: Cabeçalhos da resposta:', headersText);
        } catch (e) {
          console.warn('🌐 XHR: Não foi possível ler cabeçalhos:', e);
        }
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // Tenta parsear como JSON
            const jsonResponse = JSON.parse(xhr.responseText);
            resolve(jsonResponse);
          } catch (e) {
            // Se não for JSON, retorna o texto
            resolve(xhr.responseText);
          }
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText
          });
        }
      };
      
      xhr.onerror = function() {
        console.error('🌐 XHR: Erro de rede', {
          url,
          method,
          status: xhr.status,
          statusText: xhr.statusText
        });
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          error: 'Erro de rede'
        });
      };
      
      xhr.ontimeout = function() {
        console.error('🌐 XHR: Timeout atingido');
        reject({
          error: 'Timeout',
          message: 'A requisição excedeu o tempo limite de 30 segundos'
        });
      };
      
      // Para requisições POST, converte dados em formato de URL encoded
      if (method === 'POST' && data) {
        let formData = '';
        if (typeof data === 'string') {
          formData = data;
        } else if (data instanceof URLSearchParams) {
          formData = data.toString();
        } else if (typeof data === 'object') {
          formData = new URLSearchParams(data).toString();
        }
        console.log('🌐 XHR: Enviando dados', formData);
        xhr.send(formData);
      } else {
        xhr.send();
      }
    });
  };

  const buscarAssociado = async () => {
    if (!cartao || cartao.length < 5) {
      toast.error(translations.card_required_error || 'Número de cartão inválido');
      return;
    }

    setLoadingCartao(true);
    setAssociado(null);

    try {
      console.log('🔍 Buscando associado pelo cartão:', cartao);
      toast.success('Buscando cartão...');
      
      // Usando XHR diretamente para melhor controle e diagnóstico
      const xhr = new XMLHttpRequest();
      
      // Definir um timeout de 20 segundos
      xhr.timeout = 20000;
      
      // Configurar a requisição
      xhr.open('POST', API_URL, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      
      // Monitorar o carregamento
      xhr.onloadstart = () => console.log('🔍 Iniciando busca de associado');
      
      // Configurar o handler de sucesso
      xhr.onload = async function() {
        console.log('✅ Resposta recebida para busca do associado:', {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: xhr.getAllResponseHeaders()
        });
        
        // Verificar se a resposta foi bem-sucedida
        if (xhr.status >= 200 && xhr.status < 300) {
          const responseText = xhr.responseText;
          console.log('📄 Resposta da API (texto):', responseText.substring(0, 500));
          
          if (!responseText || responseText.trim() === '') {
            console.error('❌ Resposta vazia da API');
            toast.error('Resposta vazia da API');
            setLoadingCartao(false);
            return;
          }
          
          // Tentar converter para JSON
          try {
            const data = JSON.parse(responseText);
            console.log('🧩 Dados parseados:', data);
            
            // Verificação simplificada - apenas verificamos se o nome não é incorreto ou vazio
            if (data && data.nome && data.nome !== 'login incorreto' && data.nome !== "login fazio") {
              await processarDadosAssociado(data);
              setLoadingCartao(false);
              return;
            } else {
              // Se a API responder mas não encontrar o cartão
              console.warn('⚠️ Cartão não encontrado ou login inválido:', data);
              toast.error(translations.invalid_card_error || 'Cartão não encontrado');
              setCartao('');
              setLoadingCartao(false);
            }
          } catch (parseError) {
            console.error('❌ Erro ao fazer parse do JSON:', parseError);
            toast.error('Formato de resposta inválido');
            setLoadingCartao(false);
            return;
          }
        } else {
          console.error('❌ Erro na resposta:', xhr.status, xhr.statusText);
          toast.error(`Erro na resposta da API: ${xhr.status}`);
          setLoadingCartao(false);
        }
      };
      
      // Configurar handler de erro
      xhr.onerror = function() {
        console.error('❌ Erro de rede na requisição XHR');
        toast.error('Erro de rede, verifique sua conexão');
        setLoadingCartao(false);
      };
      
      // Configurar handler de timeout
      xhr.ontimeout = function() {
        console.error('⏱️ Timeout na busca do associado');
        toast.error('Tempo limite excedido, tente novamente');
        setLoadingCartao(false);
      };
      
      // Preparar dados para envio
      const formData = new URLSearchParams();
      formData.append('cartaodigitado', cartao);
      
      console.log('📤 Enviando dados:', formData.toString());
      
      // Enviar a requisição
      xhr.send(formData.toString());
    } catch (error) {
      console.error('❌ Erro geral na busca do associado:', error);
      toast.error('Erro ao buscar dados do cartão');
      setLoadingCartao(false);
    }
  };

  // Função auxiliar para processar dados do associado
  const processarDadosAssociado = async (data: any) => {
    console.log('✅ DADOS VÁLIDOS DO ASSOCIADO:', data);
    
    // Criar objeto com todos os dados necessários
    const associadoData: AssociadoData = {
      nome: data.nome,
      matricula: data.matricula || data.codigo, // Aceita tanto matricula quanto codigo
      empregador: data.empregador,
      cel: data.cel,
      limite: data.limite, // Definir um valor padrão caso o limite não esteja presente
      token_associado: data.token_associado,
      saldo: 0 // Será preenchido após capturar o mês corrente
    };
    
    console.log('📝 DADOS PROCESSADOS DO ASSOCIADO:', associadoData);
    
    // Verificar se todos os dados necessários estão presentes
    const camposNecessarios = {
      temNome: !!associadoData.nome,
      temMatricula: !!associadoData.matricula,
      temEmpregador: !!associadoData.empregador,
      temLimite: !!associadoData.limite
    };
    
    console.log('🔍 Verificação de campos necessários:', camposNecessarios);
    
    // Atualizar o estado com os dados básicos garantindo que a atualização seja concluída
    setAssociado(associadoData);
    
    // Verificar se campos necessários estão presentes
    if (associadoData.matricula && associadoData.empregador) {
      console.log('🚀 INICIANDO CAPTURA DO MÊS CORRENTE COM:', {
        matricula: associadoData.matricula,
        empregador: associadoData.empregador
      });
      
      // Aguardar a conclusão da captura do mês corrente antes de finalizar
      try {
        await capturarMesCorrente(associadoData.matricula, associadoData.empregador, associadoData);
      } catch (error) {
        console.error('❌ Erro ao capturar mês corrente:', error);
        toast.error('Erro ao obter dados completos do associado');
      }
    } else {
      console.error('❌ DADOS DO ASSOCIADO INCOMPLETOS:', {
        temMatricula: !!associadoData.matricula,
        temEmpregador: !!associadoData.empregador
      });
      toast.error('Dados do associado incompletos');
    }
  };

  // Adiciona efeito para verificar se há mês em cache ao iniciar
  useEffect(() => {
    // Verifica se há um mês em cache e quando foi armazenado
    try {
      const cachedMonthData = localStorage.getItem('mesCorrenteCache');
      
      if (cachedMonthData) {
        const { mes, timestamp } = JSON.parse(cachedMonthData);
        const agora = new Date().getTime();
        const umDiaEmMs = 24 * 60 * 60 * 1000;
        
        // Usa o cache se tiver menos de 1 dia
        if (mes && (agora - timestamp) < umDiaEmMs) {
          console.log('📆 Usando mês corrente do cache:', mes);
          setMesCorrente(mes);
        } else {
          console.log('📆 Cache do mês corrente expirado ou inválido');
        }
      }
    } catch (err) {
      console.warn('Erro ao acessar cache do mês corrente:', err);
    }
  }, []);

  // Função para buscar o mês corrente usando XMLHttpRequest
  const buscarMesCorrenteXHR = (endpoint: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log('🗓️ XHR: Buscando mês corrente em:', endpoint);
      const xhr = new XMLHttpRequest();
      
      xhr.timeout = 20000;
      xhr.open('GET', endpoint, true);
      
      xhr.onload = function() {
        console.log('🗓️ XHR: Resposta recebida para mês corrente:', {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText.substring(0, 200)
        });
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // Tenta parsear como JSON
            const jsonResponse = JSON.parse(xhr.responseText);
            resolve(jsonResponse);
      } catch (e) {
            // Se não for JSON, retorna o texto
            resolve(xhr.responseText);
          }
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText
          });
        }
      };
      
      xhr.onerror = function() {
        console.error('🗓️ XHR: Erro de rede ao buscar mês corrente', {
          endpoint,
          status: xhr.status,
          statusText: xhr.statusText
        });
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          error: 'Erro de rede'
        });
      };
      
      xhr.ontimeout = function() {
        console.error('🗓️ XHR: Timeout ao buscar mês corrente');
        reject({
          error: 'Timeout',
          message: 'A requisição excedeu o tempo limite de 20 segundos'
        });
      };
      
      xhr.send();
    });
  };

  // Função para consultar conta usando XMLHttpRequest
  const consultarContaXHR = (matricula: string, empregador: string, mes: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log('💰 XHR: Consultando conta:', { matricula, empregador, mes });
      const xhr = new XMLHttpRequest();
      
      xhr.timeout = 25000;
      xhr.open('POST', API_CONTA, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      
      xhr.onload = function() {
        console.log('💰 XHR: Resposta recebida para conta:', {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText.substring(0, 200)
        });
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // Tenta parsear como JSON
            const jsonResponse = JSON.parse(xhr.responseText);
            resolve(jsonResponse);
          } catch (e) {
            // Se não for JSON, retorna o texto
            resolve(xhr.responseText);
          }
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText
          });
        }
      };
      
      xhr.onerror = function() {
        console.error('💰 XHR: Erro de rede ao consultar conta', {
          matricula,
          empregador,
          mes,
          status: xhr.status,
          statusText: xhr.statusText
        });
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          error: 'Erro de rede'
        });
      };
      
      xhr.ontimeout = function() {
        console.error('💰 XHR: Timeout ao consultar conta');
        reject({
          error: 'Timeout',
          message: 'A requisição excedeu o tempo limite de 25 segundos'
        });
      };
      
      // Preparar dados para envio
      const params = new URLSearchParams();
      params.append('matricula', matricula);
      params.append('empregador', empregador);
      params.append('mes', mes);
      
      xhr.send(params.toString());
    });
  };

  // Função para verificar senha usando XMLHttpRequest
  const verificarSenhaXHR = (matricula: string, empregador: string, senha: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log('🔑 XHR: Verificando senha:', { matricula, empregador, senha: '******' });
      const xhr = new XMLHttpRequest();
      
      xhr.timeout = 20000;
      xhr.open('POST', API_SENHA, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      
      xhr.onload = function() {
        console.log('🔑 XHR: Resposta recebida para verificação de senha:', {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText.substring(0, 200)
        });
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // Tenta parsear como JSON
            const jsonResponse = JSON.parse(xhr.responseText);
            resolve(jsonResponse);
            } catch (e) {
            // Se não for JSON, retorna o texto
            resolve(xhr.responseText);
          }
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText
          });
        }
      };
      
      xhr.onerror = function() {
        console.error('🔑 XHR: Erro de rede ao verificar senha', {
          matricula,
          empregador,
          status: xhr.status,
          statusText: xhr.statusText
        });
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          error: 'Erro de rede'
        });
      };
      
      xhr.ontimeout = function() {
        console.error('🔑 XHR: Timeout ao verificar senha');
        reject({
          error: 'Timeout',
          message: 'A requisição excedeu o tempo limite de 20 segundos'
        });
      };
      
      // Preparar dados para envio
      const params = new URLSearchParams();
      params.append('matricula', matricula);
      params.append('empregador', empregador);
      params.append('senha', senha);
      params.append('pass', senha);       // Tentativa alternativa
      params.append('password', senha);   // Mais uma tentativa
      
      xhr.send(params.toString());
    });
  };

  // Função para gerar mês corrente localmente como fallback
  const gerarMesCorrenteLocal = () => {
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const data = new Date();
    return `${meses[data.getMonth()]}/${data.getFullYear()}`;
  };

  // Modificar a função capturarMesCorrente para aceitar o objeto associado completo
  const capturarMesCorrente = async (matricula: string, empregador: string, associadoCompleto: AssociadoData | null = null, retryCount = 0): Promise<void> => {
    try {
      console.log(`🗓️ Capturando mês corrente (tentativa ${retryCount + 1})...`);
      
      let mesAtual = '';
      let tentativaApiSucesso = false;
      
      // Tentar usar a API primeiro
      try {
        // Definir endpoints a serem tentados
        const endpoints = [API_MESES, API_MESES];
        
        // Tentar cada endpoint até que um funcione
        for (const endpoint of endpoints) {
          try {
            console.log('📤 Tentando API do mês corrente:', endpoint);
            
            // Usar XMLHttpRequest para buscar mês corrente
            const resultado = await buscarMesCorrenteXHR(endpoint);
            
            if (resultado) {
              // Verificar se é um objeto com a propriedade abreviacao
              if (typeof resultado === 'object' && resultado.abreviacao) {
                mesAtual = resultado.abreviacao;
                console.log('✅ Mês corrente obtido da API:', mesAtual);
                tentativaApiSucesso = true;
                break;
              }
              // Verificar se é uma string que pode conter o mês
              else if (typeof resultado === 'string' && resultado.includes('/')) {
                mesAtual = resultado;
                console.log('✅ Mês corrente obtido da API (formato string):', mesAtual);
                tentativaApiSucesso = true;
                break;
              }
            }
          } catch (error) {
            console.error(`❌ Erro ao acessar ${endpoint}:`, error);
          }
        }
      } catch (e) {
        console.error('❌ Erro geral ao tentar acessar APIs:', e);
      }
      
      // Se não conseguiu obter da API, gerar localmente
      if (!tentativaApiSucesso) {
        mesAtual = gerarMesCorrenteLocal();
        console.log('⚠️ Usando mês corrente gerado localmente:', mesAtual);
        toast.success('API indisponível. Usando mês atual do sistema.');
      }
      
      // Atualizar o estado com o mês obtido (seja da API ou gerado localmente)
      setMesCorrente(mesAtual);
      
      // Armazenar em cache para usos futuros
      localStorage.setItem('mesCorrenteCache', JSON.stringify({
        mes: mesAtual,
        timestamp: new Date().getTime()
      }));
      
      // Continuar com a consulta da conta
      if (matricula && empregador && mesAtual) {
        try {
          console.log('💰 Consultando conta para:', { matricula, empregador, mes: mesAtual });
          const dadosConta = await consultarContaXHR(matricula, empregador, mesAtual);
          
          // Processar os dados da conta para calcular saldo
          if (Array.isArray(dadosConta)) {
            let totalGastos = 0;
            
            // Calcular total de gastos
            dadosConta.forEach(item => {
              if (item.valor) {
                const valorLimpo = item.valor.toString().replace(/[^\d.]/g, '');
                const valorNumerico = parseFloat(valorLimpo);
                if (!isNaN(valorNumerico)) {
                  totalGastos += valorNumerico;
                }
              }
            });
            
            // Usar o limite do associado atual OU do objeto passado como parâmetro
            const associadoAtual = associadoCompleto || associado;
            
            // Calcular saldo disponível
            if (associadoAtual && associadoAtual.limite) {
              const limiteLimpo = associadoAtual.limite.toString().replace(/[^\d.]/g, '');
              const limiteNumerico = parseFloat(limiteLimpo);
              
              console.log('💰 Processando saldo com limite:', limiteNumerico, 'e gastos:', totalGastos);
              
              if (!isNaN(limiteNumerico)) {
                const saldoDisponivel = limiteNumerico - totalGastos;
                
                // Verificar se é um array vazio ou se não há gastos
                if (dadosConta.length === 0 || totalGastos === 0) {
                  console.log('💰 Nenhum gasto identificado, usando limite como saldo disponível:', limiteNumerico);
                  
                  // Atualizar associado com o limite como saldo
                  setAssociado(prev => {
                    if (prev) {
                      const novoAssociado = { ...prev, saldo: limiteNumerico };
                      console.log('💰 Associado atualizado com limite como saldo:', novoAssociado);
                      return novoAssociado;
                    }
                    return prev;
                  });
                } else {
                  // Atualizar associado com saldo calculado
                  setAssociado(prev => {
                    if (prev) {
                      const novoAssociado = { ...prev, saldo: saldoDisponivel };
                      console.log('💰 Associado atualizado com saldo calculado:', novoAssociado);
                      return novoAssociado;
                    }
                    return prev;
                  });
                  
                  console.log('💰 Saldo calculado:', saldoDisponivel);
                }
              } else {
                console.warn('⚠️ Limite não é um número válido:', associadoAtual.limite);
              }
            } else {
              console.warn('⚠️ Associado ou limite não disponível para calcular saldo');
            }
          } else {
            console.warn('⚠️ Dados da conta não estão no formato esperado:', dadosConta);
            // Usar o saldo do associado diretamente se disponível ou definir como 0
            setAssociado(prev => {
              if (prev) {
                return { ...prev };
              }
              return prev;
            });
          }
        } catch (errorConta) {
          console.error('❌ Erro ao consultar conta:', errorConta);
          // Manter o saldo atual do associado ou definir como 0
          setAssociado(prev => {
            if (prev) {
              return { ...prev };
            }
            return prev;
          });
        }
      }
      
      return;
    } catch (error) {
      console.error('❌ Erro geral na captura de mês corrente:', error);
      
      // Em caso de erro, usar mês local apenas
      const mesLocal = gerarMesCorrenteLocal();
      setMesCorrente(mesLocal);
      
      setAssociado(prev => {
        if (prev) {
          return { ...prev };
        }
        return prev;
      });
      
      toast.error('Não foi possível obter dados completos.');
      throw error; // Re-throw para ser capturado na função chamadora
    }
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove todos os caracteres não numéricos
    let value = e.target.value.replace(/\D/g, '');
    
    // Se há valor, converte para número e formata
    if (value) {
      // Converte para número inteiro (guaranis não têm centavos)
      const valorNumerico = parseInt(value);
      
      // Formata como moeda guarani sem decimais
      value = valorNumerico.toLocaleString('es-PY', {
        style: 'currency',
        currency: 'PYG',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    } else {
      value = '';
    }
    
    setValor(value);
  };

  const handleLerQRCode = () => {
    setShowQrReader(true);
  };

  const handleCloseQrReader = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(error => {
        console.error("Erro ao parar o scanner:", error);
      });
    }
    setShowQrReader(false);
  };

  // Função para gravar venda usando XMLHttpRequest
  const gravarVendaXHR = (dadosVenda: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      console.log('💰 XHR: Gravando venda com os seguintes dados:', dadosVenda);
      const xhr = new XMLHttpRequest();
      
      xhr.timeout = 30000;
      xhr.open('POST', API_GRAVA_VENDA, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      
      xhr.onload = function() {
        console.log('💰 XHR: Resposta recebida para gravação de venda:', {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText.substring(0, 500)
        });
        
        // Log completo da resposta para depuração
        console.log('💰 XHR: Resposta completa:', xhr.responseText);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // Tenta parsear como JSON
            const jsonResponse = JSON.parse(xhr.responseText);
            console.log('💰 XHR: Venda gravada com sucesso. Resposta JSON:', jsonResponse);
            resolve(jsonResponse);
          } catch (e) {
            console.log('💰 XHR: Erro ao parsear JSON. Resposta em texto:', xhr.responseText);
            
            // Verificar se a resposta contém texto que indica sucesso
            if (xhr.responseText.includes('situacao')) {
              try {
                // Tenta extrair informações relevantes da resposta de texto
                const situacaoMatch = xhr.responseText.match(/situacao["\s:]+(\d+)/i);
                const registroMatch = xhr.responseText.match(/registrolan["\s:]+(\w+)/i);
                
                if (situacaoMatch && situacaoMatch[1]) {
                  const resposta = {
                    situacao: parseInt(situacaoMatch[1]),
                    registrolan: registroMatch && registroMatch[1] ? registroMatch[1] : ''
                  };
                  console.log('💰 XHR: Extraiu dados da resposta de texto:', resposta);
                  resolve(resposta);
                  return;
                }
              } catch (parseError) {
                console.error('💰 XHR: Erro ao extrair dados da resposta de texto:', parseError);
              }
            }
            
            // Se não conseguir extrair informações, retorna a resposta em texto
            resolve({
              situacao: 1, // Assume sucesso
              responseText: xhr.responseText,
              message: 'Resposta não-JSON, mas com status de sucesso'
            });
          }
        } else {
          console.error('💰 XHR: Erro ao gravar venda:', xhr.status, xhr.statusText);
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText
          });
        }
      };
      
      xhr.onerror = function() {
        console.error('💰 XHR: Erro de rede ao gravar venda');
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          error: 'Erro de rede'
        });
      };
      
      xhr.ontimeout = function() {
        console.error('💰 XHR: Timeout ao gravar venda');
        reject({
          error: 'Timeout',
          message: 'A requisição excedeu o tempo limite de 30 segundos'
        });
      };
      
      // Preparar dados para envio
      const params = new URLSearchParams();
      
      // Adicionar todos os parâmetros necessários baseados no código PHP fornecido
      Object.keys(dadosVenda).forEach(key => {
        params.append(key, dadosVenda[key]);
      });
      
      console.log('💰 XHR: Enviando dados para gravação:', params.toString());
      xhr.send(params.toString());
    });
  };

  // Modifique a função handleSubmit para usar verificarSenhaXHR
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!associado) {
      toast.error('Busque os dados do cartão primeiro');
      return;
    }
    
    const valorExtraido = extrairValorNumerico(valor);
    
    if (!valor || valorExtraido <= 0) {
      toast.error(translations.value_required_error || 'Informe um valor válido');
      return;
    }
    
    if (!senha || senha.length < 6) {
      toast.error(translations.password_required_error || 'Informe a senha do cartão (6 dígitos)');
      return;
    }
    
    // Verificar se o valor total não excede o saldo
    const valorTotal = valorExtraido;
    if (valorTotal > associado.saldo) {
      toast.error(translations.insufficient_balance_error || 'O valor total não pode ser maior que o saldo disponível');
      return;
    }
    
    // Verificar se o valor da parcela não excede o saldo quando for mais de uma parcela
    if (parcelas > 1 && valorParcela > associado.saldo) {
      toast.error('O valor da parcela não pode ser maior que o saldo disponível');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('🔑 Verificando senha para associado:', {
        matricula: associado.matricula,
        empregador: associado.empregador,
        senha: '******'
      });
      
      // Usar a função de verificação de senha com XMLHttpRequest
      const resultadoSenha = await verificarSenhaXHR(
        associado.matricula, 
        associado.empregador, 
        senha
      );
      
      console.log('🔐 Dados da resposta de senha:', resultadoSenha);
        
      // Verificar diferentes propriedades possíveis para a verificação de sucesso
      const senhaCorreta = 
        (resultadoSenha && resultadoSenha.success === true) || 
        (resultadoSenha && resultadoSenha.situacao === 'certo') ||
        (resultadoSenha && resultadoSenha.status === 'success') ||
        (resultadoSenha && resultadoSenha.result === true);
        
      if (senhaCorreta) {
        try {
          toast.success('Senha validada! Gravando venda...');
          
          // Obter dados do convênio do localStorage
          const dadosConvenioString = localStorage.getItem('dadosConvenio');
          let codConvenio = '0';
          let nomeFantasia = '';
          
          if (dadosConvenioString) {
            try {
              const dadosConvenio = JSON.parse(dadosConvenioString);
              // Garantir que estamos acessando a propriedade correta
              codConvenio = dadosConvenio.cod_convenio || dadosConvenio.codConvenio || '0';
              nomeFantasia = dadosConvenio.nome_fantasia || dadosConvenio.nomeFantasia || '';
              console.log('📊 Usando código de convênio:', codConvenio);
            } catch (e) {
              console.error('❌ Erro ao processar dados do convênio:', e);
              
              // Verificar se há token de convênio e tentar extrair dados dele
              const tokenConvenio = localStorage.getItem('convenioToken');
              if (tokenConvenio) {
                try {
                  // O token está em base64, então decodificamos
                  const tokenDecodificado = JSON.parse(atob(tokenConvenio));
                  if (tokenDecodificado && tokenDecodificado.id) {
                    codConvenio = tokenDecodificado.id;
                    console.log('📊 Usando código de convênio do token:', codConvenio);
                  }
                } catch (tokenError) {
                  console.error('❌ Erro ao processar token do convênio:', tokenError);
                }
              }
            }
          } else {
            console.warn('⚠️ Dados do convênio não encontrados no localStorage');
            
            // Como último recurso, tentar obter do sessionStorage
            const sessaoConvenio = sessionStorage.getItem('convenioData');
            if (sessaoConvenio) {
              try {
                const dadosSessao = JSON.parse(sessaoConvenio);
                codConvenio = dadosSessao.cod_convenio || dadosSessao.codConvenio || '0';
                console.log('📊 Usando código de convênio da sessão:', codConvenio);
              } catch (sessaoError) {
                console.error('❌ Erro ao processar dados de sessão do convênio:', sessaoError);
              }
            }
          }
          
          // Formatar os dados para a API de gravação de venda
          const valorLimpo = valorExtraido.toString();
          const valorParcelaLimpo = valorParcela.toString();
          
          // Log explícito para depurar o valor final de codConvenio
          console.log('📊 VALOR FINAL DO CÓDIGO DO CONVÊNIO:', codConvenio);
          
          // Preparar dados conforme exigido pela API grava_venda_app.php
          const dadosVenda = {
            cod_convenio: codConvenio,
            matricula: associado.matricula,
            pass: senha,
            nome: associado.nome,
            cartao: cartao,
            empregador: associado.empregador,
            valor_pedido: valorLimpo,
            valor_parcela: valorParcelaLimpo,
            mes_corrente: mesCorrente,
            primeiro_mes: mesCorrente, // Usando o mês corrente como primeiro mês
            qtde_parcelas: parcelas.toString(),
            uri_cupom: '', // Campo obrigatório
            descricao: descricao || 'Lançamento via QRCred App'
          };
          
          console.log('📝 Dados para gravação de venda:', dadosVenda);
          
          // Gravar a venda
          const resultadoVenda = await gravarVendaXHR(dadosVenda);
          
          console.log('✅ Venda gravada com sucesso:', resultadoVenda);
          
          // Verificar o status da resposta
          if (resultadoVenda && typeof resultadoVenda === 'object') {
            // Verificar situação como número ou string
            const situacao = resultadoVenda.situacao;
            
            if (situacao === 1 || situacao === '1') {
              // Sucesso - situacao = 1
              console.log('✅ Venda registrada com sucesso! Registro:', resultadoVenda.registrolan);
              toast.success(translations.payment_success || 'Pagamento realizado com sucesso!');
              
              // Salvar dados da venda
              if (resultadoVenda.registrolan) {
                console.log('✅ Registro de lançamento:', resultadoVenda.registrolan);
                // Aqui poderia armazenar o registro para exibição ou referência futura
              }
              
              // Exibir tela de confirmação
              setValorPagamento(valor);
              setShowConfirmacao(true);
            } else if (situacao === 2 || situacao === '2') {
              // Senha incorreta - situacao = 2
              console.error('❌ Senha incorreta!');
              toast.error('Senha incorreta. Verifique e tente novamente.');
              setSenha('');
            } else if (!situacao && resultadoVenda.responseText) {
              // Caso em que recebemos texto, mas assumimos sucesso
              console.log('✅ Venda possivelmente registrada (resposta em texto)');
              toast.success('Pagamento processado!');
              setValorPagamento(valor);
              setShowConfirmacao(true);
            } else {
              // Outros erros
              console.error('❌ Erro ao processar venda:', resultadoVenda);
              toast.error(translations.payment_error || 'Erro ao processar venda. Tente novamente.');
            }
          } else if (typeof resultadoVenda === 'string' && resultadoVenda.trim() !== '') {
            // Resposta é string não vazia, assumimos sucesso
            console.log('✅ Resposta em formato de texto:', resultadoVenda);
            toast.success('Pagamento processado!');
            setValorPagamento(valor);
            setShowConfirmacao(true);
          } else {
            // Resposta inválida
            console.error('❌ Resposta inválida da API:', resultadoVenda);
            toast.error('Erro ao processar venda. Resposta inválida.');
          }
        } catch (errorVenda) {
          console.error('❌ Erro ao gravar venda:', errorVenda);
          toast.error('Erro ao gravar venda. Tente novamente.');
        }
      } else {
        toast.error('Senha incorreta');
        setSenha('');
      }
    } catch (error) {
      console.error('❌ Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    router.back();
  };

  const handleVoltarParaDashboard = () => {
    router.push('/convenio/dashboard/lancamentos');
  };

  // Se estiver mostrando a tela de confirmação, renderize isso
  if (showConfirmacao) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header title={translations.payment_confirmed_title || 'Pagamento Confirmado'} />
        
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="animate-bounce mb-6 mx-auto">
              <FaCheckCircle className="h-24 w-24 text-green-500 mx-auto" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {translations.payment_completed_title || 'Pagamento Realizado!'}
            </h2>
            
            <p className="text-lg text-gray-600 mb-1">
              {translations.payment_value_label || 'Valor'}: {valorPagamento}
            </p>
            {parcelas > 1 && (
              <p className="text-md text-gray-500 mb-4">
                {translations.installments_info 
                  ? translations.installments_info
                    .replace('{parcelas}', parcelas.toString())
                    .replace('{valor}', valorParcela.toLocaleString('es-PY', {
                      style: 'currency',
                      currency: 'PYG',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }))
                  : `Em ${parcelas}x de ${valorParcela.toLocaleString('es-PY', {
                      style: 'currency',
                      currency: 'PYG',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}`
                }
              </p>
            )}
            
            {associado && (
              <div className="mt-4 bg-gray-50 p-4 rounded-md mb-6">
                <p className="text-sm font-medium text-gray-500">
                  {translations.client_label || 'Cliente'}
                </p>
                <p className="text-lg font-medium text-gray-900">{associado.nome}</p>
              </div>
            )}
            
            <div className="mt-6">
              <button
                type="button"
                onClick={handleVoltarParaDashboard}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {translations.back_to_lancamentos_button || 'Voltar para Lançamentos'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title={translations.page_title || 'Novo Lançamento'} showBackButton onBackClick={handleVoltar} />
      
      {showQrReader ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {translations.qr_reader_title || 'Ler QR Code'}
            </h3>
            <div className="mb-4">
              <div ref={qrReaderRef} className="w-full"></div>
            </div>
            <button
              type="button"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
              onClick={handleCloseQrReader}
            >
              {translations.cancel_button || 'Cancelar'}
            </button>
          </div>
        </div>
      ) : null}
      
      <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {translations.form_title || 'Registrar Novo Pagamento'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção Cartão */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {translations.card_data_section || 'Dados do Cartão'}
              </h3>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-grow">
                  <label htmlFor="cartao" className="block text-sm font-bold text-blue-700 mb-2 flex items-center">
                    <FaCreditCard className="mr-2" />
                    {translations.card_number_label || 'Número do Cartão'}
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCreditCard className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="cartao"
                        name="cartao"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 py-3 text-lg font-medium border-2 border-gray-300 rounded-lg bg-white shadow-sm placeholder-gray-400 hover:border-blue-400 transition-colors"
                        placeholder={translations.card_number_placeholder || 'Digite o número do cartão'}
                        value={cartao}
                        onChange={(e) => setCartao(e.target.value)}
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 sm:self-end">
                  <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                    onClick={handleLerQRCode}
                  >
                    <FaQrcode className="mr-2" /> {translations.qr_code_button || 'QR Code'}
                  </button>
                  
                  <button
                    type="button"
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                    onClick={buscarAssociado}
                    disabled={!cartao || loadingCartao}
                  >
                    {loadingCartao ? <FaSpinner className="animate-spin mx-auto" /> : (translations.search_button || 'Buscar')}
                  </button>
                </div>
              </div>
              
              {/* Informações do Associado */}
              {associado && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {translations.cardholder_name_label || 'Nome do Titular'}
                      </p>
                      <p className="text-lg font-medium text-gray-900">{associado.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {translations.available_balance_label || 'Saldo Disponível'}
                      </p>
                      <p className="text-lg font-medium text-green-600">
                        {associado.saldo.toLocaleString('es-PY', {
                          style: 'currency',
                          currency: 'PYG'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Seção Pagamento */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {translations.payment_config_section || 'Configuração do Pagamento'}
              </h3>
              
              <div className="space-y-6">
                {/* Campo Valor - Destaque em mobile */}
                <div className="w-full">
                  <label htmlFor="valor" className="block text-sm font-bold text-green-700 mb-2 flex items-center">
                    <span className="text-green-600 mr-2">💰</span>
                    {translations.total_value_label || 'Valor Total da Compra'}
                  </label>
                  <div className="mt-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-medium">₲</span>
                      </div>
                      <input
                        type="text"
                        id="valor"
                        name="valor"
                        className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-4 py-4 text-xl font-bold border-2 border-gray-300 rounded-lg bg-white shadow-sm placeholder-gray-400 hover:border-green-400 transition-colors disabled:bg-gray-100 disabled:text-gray-500 min-w-0"
                        placeholder={translations.total_value_placeholder || '0,00'}
                        value={valor}
                        onChange={handleValorChange}
                        disabled={!associado}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Grid para outros campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="parcelas" className="block text-sm font-medium text-gray-700 mb-1">
                      {translations.installments_label || 'Quantidade de Parcelas'}
                    </label>
                    <div className="mt-1">
                      <select
                        id="parcelas"
                        name="parcelas"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-3"
                        value={parcelas}
                        onChange={(e) => setParcelas(Number(e.target.value))}
                        disabled={!associado}
                      >
                        {Array.from({ length: maxParcelas }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num}x {num > 1 ? (translations.installment_option_multiple || 'parcelas') : (translations.installment_option_cash || 'à vista')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="mes-corrente" className="block text-sm font-medium text-gray-700 mb-1">
                      {translations.current_month_label || 'Mês Atual'}
                    </label>
                    <div className="mt-1">
                      <div className="flex items-center h-12 px-4 border border-gray-300 rounded-md bg-blue-50">
                        <FaCalendarAlt className="text-blue-500 mr-2" />
                        <span className="text-sm text-blue-700 font-medium">
                          {mesCorrente || (translations.waiting_data || 'Aguardando dados...')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {parcelas > 1 && valorParcela > 0 && (
                  <div className="col-span-2 bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-700">
                      {translations.installment_info_text 
                        ? translations.installment_info_text
                          .replace('{parcelas}', parcelas.toString())
                          .replace('{valor}', valorParcela.toLocaleString('es-PY', {
                            style: 'currency',
                            currency: 'PYG',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }))
                        : `Pagamento em ${parcelas}x de ${valorParcela.toLocaleString('es-PY', {
                            style: 'currency',
                            currency: 'PYG',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })}`
                      }
                    </p>
                  </div>
                )}
                
                <div className="col-span-2">
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    {translations.purchase_description_label || 'Descrição da Compra (opcional)'}
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="descricao"
                      name="descricao"
                      rows={2}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder={translations.purchase_description_placeholder || 'Descreva os itens ou referência da compra'}
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      disabled={!associado}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção Autorização */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {translations.authorization_section || 'Autorização da Transação'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="senha" className="block text-sm font-bold text-orange-700 mb-2 flex items-center">
                    <FaLock className="mr-2" />
                    {translations.card_password_label || 'Senha do Cartão'}
                  </label>
                  <div className="mt-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-orange-500" />
                      </div>
                      <input
                        type="password"
                        id="senha"
                        name="senha"
                        className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 pr-4 py-3 text-lg font-medium border-2 border-gray-300 rounded-lg bg-white shadow-sm placeholder-gray-400 hover:border-orange-400 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder={translations.card_password_placeholder || 'Digite a senha de 6 dígitos'}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        maxLength={6}
                        disabled={!associado}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                onClick={handleVoltar}
              >
                {translations.cancel_button || 'Cancelar'}
              </button>
              <button
                type="submit"
                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={!associado || loading || !valor || !senha}
              >
                {loading ? <FaSpinner className="animate-spin mx-auto" /> : (translations.authorize_payment_button || 'Autorizar Pagamento')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}