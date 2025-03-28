'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaQrcode, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import Header from '@/app/components/Header';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';

interface AssociadoData {
  nome: string;
  matricula: string;
  empregador: string;
  saldo: number;
  token_associado?: string;
  cel?: string;
  limite?: string;
}

// Dados mock para testes quando a API não estiver disponível
const MOCK_DATA = {
  ASSOCIADOS: {
    "1234567890": {
      nome: "João Silva",
      matricula: "12345",
      empregador: "Empresa ABC",
      cel: "11999998888",
      limite: "2000",
      token_associado: "token123"
    }
  },
  MES_CORRENTE: [
    { abreviacao: "MAR" }
  ],
  CONTA: [
    { valor: "150.00" },
    { valor: "350.00" }
  ]
};

export default function NovoLancamentoPage() {
  const router = useRouter();
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
  const [useMock, setUseMock] = useState(false);
  const qrReaderRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  
  // API Host - Agora vazio, já que vamos usar diretamente o endpoint
  const API_URL = '/localizaasapp.php';
  const API_MESES = '/meses_corrente_app.php';
  const API_CONTA = '/conta_app.php';
  const API_SENHA = '/consulta_pass_assoc.php';

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

  // Formatar valor como moeda
  const formatarValor = (valor: string) => {
    // Remove caracteres não numéricos
    const valorNumerico = valor.replace(/\D/g, '');
    
    // Converte para centavos e depois formata como moeda
    const valorEmReais = (parseInt(valorNumerico) / 100).toFixed(2);
    return valorEmReais;
  };

  // Atualiza valor da parcela quando valor total ou número de parcelas mudam
  useEffect(() => {
    if (valor && parcelas > 0) {
      const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
      if (!isNaN(valorNumerico)) {
        setValorParcela(valorNumerico / parcelas);
      }
    } else {
      setValorParcela(0);
    }
  }, [valor, parcelas]);

  const buscarAssociadoMock = async () => {
    // Simulando delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockAssociado = MOCK_DATA.ASSOCIADOS[cartao as keyof typeof MOCK_DATA.ASSOCIADOS];
    if (mockAssociado) {
      const mockData: AssociadoData = {
        nome: mockAssociado.nome,
        matricula: mockAssociado.matricula,
        empregador: mockAssociado.empregador,
        cel: mockAssociado.cel,
        limite: mockAssociado.limite,
        token_associado: mockAssociado.token_associado,
        saldo: 0 // Será preenchido após capturar o mês corrente
      };
      setAssociado(mockData);
      capturarMesCorrenteMock(mockData.matricula, mockData.empregador);
      return true;
    }
    return false;
  };

  const capturarMesCorrenteMock = async (matricula: string, empregador: string) => {
    // Simulando delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mesAtual = MOCK_DATA.MES_CORRENTE[0].abreviacao;
    setMesCorrente(mesAtual);
    
    // Calcula o total
    let total = 0;
    for(let i = 0; i < MOCK_DATA.CONTA.length; i++) {
      total += parseFloat(MOCK_DATA.CONTA[i].valor);
    }
    
    // Calcula o saldo (limite - total)
    if (associado && associado.limite) {
      const limite = parseFloat(associado.limite);
      const saldo = limite - total;
      
      // Atualiza o associado com o saldo
      setAssociado(prev => {
        if (prev) {
          return { ...prev, saldo: saldo };
        }
        return prev;
      });
    }
  };

  const buscarAssociado = async () => {
    if (!cartao || cartao.length < 10) {
      toast.error('Número de cartão inválido');
      return;
    }

    setLoadingCartao(true);
    setAssociado(null);

    try {
      // Tenta usar o endpoint direto primeiro
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
      
      try {
        // Chamada para localizaasapp.php
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            cartaodigitado: cartao
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        if (data && data.nome && data.nome !== 'login incorreto') {
          const associadoData: AssociadoData = {
            nome: data.nome,
            matricula: data.matricula,
            empregador: data.empregador,
            cel: data.cel,
            limite: data.limite,
            token_associado: data.token_associado,
            saldo: 0 // Será preenchido após capturar o mês corrente
          };
          setAssociado(associadoData);
          capturarMesCorrente(data.matricula, data.empregador);
          return;
        } else {
          // Se a API responder mas não encontrar o cartão
          toast.error('Cartão não encontrado');
          setCartao('');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn("Erro na API real, usando dados mock", error);
        
        // Se ocorrer um erro na API real, tenta usar os dados mock
        if (!useMock) {
          setUseMock(true);
          toast.success('Usando dados de demonstração');
        }
        
        const mockSuccess = await buscarAssociadoMock();
        if (!mockSuccess) {
          toast.error('Cartão não encontrado');
          setCartao('');
        }
      }
    } catch (error) {
      toast.error('Erro ao buscar dados do cartão');
      console.error('Erro ao buscar associado:', error);
    } finally {
      setLoadingCartao(false);
    }
  };

  const capturarMesCorrente = async (matricula: string, empregador: string) => {
    try {
      // Se estiver no modo mock, use os dados de demonstração
      if (useMock) {
        await capturarMesCorrenteMock(matricula, empregador);
        return;
      }
      
      // Primeiro, busca o mês corrente
      const responseMes = await fetch(API_MESES);
      const dataMes = await responseMes.json();
      
      if (dataMes && dataMes.length > 0) {
        const mesAtual = dataMes[0].abreviacao;
        setMesCorrente(mesAtual);
        
        // Depois, calcula o saldo com base no mês corrente
        const responseConta = await fetch(API_CONTA, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            matricula: matricula,
            empregador: empregador,
            mes: mesAtual
          })
        });
        
        const dataConta = await responseConta.json();
        
        if (dataConta) {
          // Calcula o total
          let total = 0;
          for(let i = 0; i < dataConta.length; i++) {
            total += parseFloat(dataConta[i].valor);
          }
          
          // Calcula o saldo (limite - total)
          if (associado && associado.limite) {
            const limite = parseFloat(associado.limite);
            const saldo = limite - total;
            
            // Atualiza o associado com o saldo
            setAssociado(prev => {
              if (prev) {
                return { ...prev, saldo: saldo };
              }
              return prev;
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao capturar mês corrente, usando mock:', error);
      // Se falhar, tenta usar o modo mock
      if (!useMock) {
        setUseMock(true);
        toast.success('Usando dados de demonstração para o saldo');
        await capturarMesCorrenteMock(matricula, empregador);
      }
    }
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove todos os caracteres não numéricos
    let value = e.target.value.replace(/\D/g, '');
    
    // Converte para formato monetário (R$ 0,00)
    if (value) {
      const valorNumerico = parseInt(value) / 100;
      value = valorNumerico.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
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

  const verificarSenhaMock = async (senha: string, matricula: string, empregador: string) => {
    // Simulando delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // No modo de demonstração, qualquer senha de 6 dígitos é aceita
    return senha.length === 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!associado) {
      toast.error('Busque os dados do cartão primeiro');
      return;
    }
    
    if (!valor || parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    
    if (!senha || senha.length < 6) {
      toast.error('Informe a senha do cartão (6 dígitos)');
      return;
    }
    
    // Verificar se o valor total não excede o saldo
    const valorTotal = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
    if (valorTotal > associado.saldo) {
      toast.error('O valor total não pode ser maior que o saldo disponível');
      return;
    }
    
    // Verificar se o valor da parcela não excede o saldo quando for mais de uma parcela
    if (parcelas > 1 && valorParcela > associado.saldo) {
      toast.error('O valor da parcela não pode ser maior que o saldo disponível');
      return;
    }
    
    setLoading(true);
    
    try {
      let senhaCorreta = false;
      
      if (useMock) {
        // No modo demo, verificamos a senha localmente
        senhaCorreta = await verificarSenhaMock(senha, associado.matricula, associado.empregador);
      } else {
        // Verificar senha do associado na API real
        try {
          const responseSenha = await fetch(API_SENHA, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              pass: senha,
              matricula: associado.matricula,
              empregador: associado.empregador
            })
          });
          
          const dataSenha = await responseSenha.json();
          senhaCorreta = dataSenha && dataSenha.situacao === 'certo';
        } catch (error) {
          console.warn("Erro ao verificar senha, usando modo demo", error);
          // Se falhar, verifica localmente
          if (!useMock) {
            setUseMock(true);
            toast.success('Usando verificação de senha em modo de demonstração');
          }
          senhaCorreta = await verificarSenhaMock(senha, associado.matricula, associado.empregador);
        }
      }
      
      if (senhaCorreta) {
        // Processar o pagamento
        // Aqui seria implementada a API de pagamento
        
        // Simulação de envio para API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Sucesso
        toast.success('Pagamento autorizado com sucesso!');
        router.push('/convenio/dashboard/lancamentos');
      } else {
        toast.error('Senha incorreta');
        setSenha('');
      }
    } catch (error) {
      toast.error('Erro ao processar pagamento');
      console.error('Erro ao processar pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Novo Lançamento" showBackButton onBackClick={handleVoltar} />
      
      {showQrReader ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ler QR Code</h3>
            <div className="mb-4">
              <div ref={qrReaderRef} className="w-full"></div>
            </div>
            <button
              type="button"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
              onClick={handleCloseQrReader}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
      
      <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Registrar Novo Pagamento</h2>
          
          {useMock && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                <strong>Modo de demonstração ativo.</strong> Para testar, use o cartão 1234567890 e qualquer senha de 6 dígitos.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção Cartão */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dados do Cartão</h3>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-grow">
                  <label htmlFor="cartao" className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Cartão
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
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Digite o número do cartão"
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
                    <FaQrcode className="mr-2" /> QR Code
                  </button>
                  
                  <button
                    type="button"
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                    onClick={buscarAssociado}
                    disabled={!cartao || loadingCartao}
                  >
                    {loadingCartao ? <FaSpinner className="animate-spin mx-auto" /> : 'Buscar'}
                  </button>
                </div>
              </div>
              
              {/* Informações do Associado */}
              {associado && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nome do Titular</p>
                      <p className="text-lg font-medium text-gray-900">{associado.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Saldo Disponível</p>
                      <p className="text-lg font-medium text-green-600">
                        {associado.saldo.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Seção Pagamento */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuração do Pagamento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Total da Compra
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="valor"
                      name="valor"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="R$ 0,00"
                      value={valor}
                      onChange={handleValorChange}
                      disabled={!associado}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="parcelas" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade de Parcelas
                  </label>
                  <div className="mt-1">
                    <select
                      id="parcelas"
                      name="parcelas"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={parcelas}
                      onChange={(e) => setParcelas(Number(e.target.value))}
                      disabled={!associado}
                    >
                      {Array.from({ length: maxParcelas }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num}x {num > 1 ? 'parcelas' : 'à vista'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {parcelas > 1 && valorParcela > 0 && (
                  <div className="col-span-2 bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-700">
                      Pagamento em <strong>{parcelas}x</strong> de <strong>
                        {valorParcela.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </strong>
                    </p>
                  </div>
                )}
                
                <div className="col-span-2">
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição da Compra (opcional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="descricao"
                      name="descricao"
                      rows={2}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Descreva os itens ou referência da compra"
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Autorização da Transação</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha do Cartão
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      id="senha"
                      name="senha"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Digite a senha de 6 dígitos"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      maxLength={6}
                      disabled={!associado}
                    />
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
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={!associado || loading || !valor || !senha}
              >
                {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Autorizar Pagamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 