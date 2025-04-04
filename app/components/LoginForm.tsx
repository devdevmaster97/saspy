'use client';

import { useState, useEffect, Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { FaLock, FaCreditCard, FaSpinner, FaEnvelope, FaPhone, FaWhatsapp, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { FaSpinner as FaSpinner6 } from 'react-icons/fa6';
import { Dialog, Transition } from '@headlessui/react';

// Esquema de validação para o formulário de login
const loginSchema = z.object({
  cartao: z.string().min(1, 'Cartão é obrigatório'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

// Tipo para os dados do formulário de login
type LoginFormData = z.infer<typeof loginSchema>;

// Interface para os dados do usuário da resposta do servidor
interface UserData {
  matricula: string;
  nome: string;
  empregador: string;
  cod_cart: string;
  limite: string;
  cpf: string;
  email: string;
  cel: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  celwatzap: string;
  nome_divisao: string;
  situacao: string;
}

// Interface para os cartões salvos
interface SavedCard {
  numero: string;
  nome?: string;
}

interface LoginFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function LoginForm({ onSubmit, loading }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const [associadoNome, setAssociadoNome] = useState('Login do Usuário');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showSavedCards, setShowSavedCards] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  
  // Estados para recuperação de senha
  const [esqueciSenhaModal, setEsqueciSenhaModal] = useState(false);
  const [metodoRecuperacao, setMetodoRecuperacao] = useState<string | null>(null);
  const [cartaoRecuperacao, setCartaoRecuperacao] = useState('');
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState('');
  const [destinoMascarado, setDestinoMascarado] = useState('');
  
  // Estados para validação do código
  const [etapaRecuperacao, setEtapaRecuperacao] = useState<'solicitacao' | 'codigo' | 'nova_senha'>('solicitacao');
  const [codigoRecuperacao, setCodigoRecuperacao] = useState('');
  const [tokenRecuperacao, setTokenRecuperacao] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [enviandoNovaSenha, setEnviandoNovaSenha] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Carregar cartões salvos no carregamento do componente
  useEffect(() => {
    const loadSavedCards = () => {
      const storedCards = localStorage.getItem('qrcred_saved_cards');
      if (storedCards) {
        try {
          const parsedCards = JSON.parse(storedCards) as SavedCard[];
          setSavedCards(parsedCards);
          if (parsedCards.length > 0) {
            setShowSavedCards(true);
          }
        } catch (error) {
          console.error('Erro ao carregar cartões salvos:', error);
        }
      }
    };

    loadSavedCards();
  }, []);

  // Função para selecionar um cartão salvo
  const handleSelectCard = (card: SavedCard) => {
    setValue('cartao', card.numero);
    setShowSavedCards(false);
    setAssociadoNome(card.nome ? `Olá, ${card.nome}` : 'Login do Usuário');
  };

  // Função para lidar com a troca de cartão
  const handleTrocarCartao = () => {
    setReadOnly(false);
    setShowSavedCards(true);
    setAssociadoNome('Login do Usuário');
  };

  // Função para processar o login
  const onSubmitForm = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setDebugInfo('');

      // Limpar o cartão de possíveis formatações
      const cartaoLimpo = data.cartao.replace(/\D/g, '').trim();
      const senhaLimpa = data.senha.trim();
      
      // Para fins de diagnóstico
      console.log('Tentando login com cartão (original):', data.cartao);
      console.log('Tentando login com cartão (limpo):', cartaoLimpo);
      
      // Criar FormData para enviar
      const formData = new FormData();
      formData.append('cartao', cartaoLimpo);
      formData.append('senha', senhaLimpa);
      
      // Tentar primeira abordagem: direto para a API local
      try {
        const response = await axios.post('/api/login', formData);
        console.log('Resposta da API local:', response.data);
        
        if (response.data && response.data.situacao) {
          processarResposta(response.data, cartaoLimpo);
        } else {
          // Se não tiver situacao, tentar abordagem alternativa
          throw new Error('Resposta sem situação');
        }
      } catch (localError) {
        console.error('Erro na API local, tentando diretamente:', localError);
        
        // Segunda abordagem: diretamente para o backend
        const urlSearchParams = new URLSearchParams();
        urlSearchParams.append('cartao', cartaoLimpo);
        urlSearchParams.append('senha', senhaLimpa);
        
        const response = await axios.post(
          'https://qrcred.makecard.com.br/localiza_associado_app_2.php',
          urlSearchParams.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        console.log('Resposta direta do backend:', response.data);
        processarResposta(response.data, cartaoLimpo);
      }
    } catch (error: unknown) {
      console.error('Erro na autenticação:', error);
      setErrorMessage('Erro de conexão. Verifique sua internet.');
      if (error instanceof Error) {
        setDebugInfo(error.message);
      } else {
        setDebugInfo(String(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar o cartão na lista de cartões salvos
  const saveCardToLocalStorage = (card: string, nome?: string) => {
    try {
      // Obter cartões salvos
      const storedCards = localStorage.getItem('qrcred_saved_cards');
      let cards: SavedCard[] = [];
      
      if (storedCards) {
        cards = JSON.parse(storedCards);
      }
      
      // Verificar se o cartão já existe
      const cardExists = cards.some(c => c.numero === card);
      
      // Se não existir, adicionar
      if (!cardExists) {
        cards.push({ numero: card, nome });
        
        // Limitar a 5 cartões salvos
        if (cards.length > 5) {
          cards.shift();
        }
        
        localStorage.setItem('qrcred_saved_cards', JSON.stringify(cards));
      } else if (nome) {
        // Atualizar nome se necessário
        const updatedCards = cards.map(c => 
          c.numero === card ? { ...c, nome } : c
        );
        localStorage.setItem('qrcred_saved_cards', JSON.stringify(updatedCards));
      }
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
    }
  };

  // Função para processar a resposta do servidor
  const processarResposta = (data: Partial<UserData>, cartaoOriginal: string) => {
    // Processamento da resposta
    const resultado = data.situacao;
    console.log('Situação retornada:', resultado);
    
    // Converter para número para garantir a comparação correta
    const situacaoNum = Number(resultado);
    
    if (situacaoNum === 1) {
      // Antes de prosseguir, mostrar o objeto para diagnóstico
      console.log('Dados recebidos:', data);
      
      // Salvar o cartão utilizado
      saveCardToLocalStorage(cartaoOriginal, data.nome);
      
      // Armazenar dados do usuário 
      localStorage.setItem('qrcred_user', JSON.stringify({
        matricula: data.matricula || '',
        nome: data.nome || '',
        empregador: data.empregador || '',
        cartao: data.cod_cart || cartaoOriginal,
        limite: data.limite || '',
        cpf: data.cpf || '',
        email: data.email || '',
        cel: data.cel || '',
        cep: data.cep || '',
        endereco: data.endereco || '',
        numero: data.numero || '',
        bairro: data.bairro || '',
        cidade: data.cidade || '',
        estado: data.uf || '',
        celzap: data.celwatzap || '',
        nome_divisao: data.nome_divisao || '',
      }));

      // Redirecionar para o dashboard
      router.push('/dashboard');
    } else if (situacaoNum === 6) {
      setErrorMessage('Senha incorreta');
    } else if (situacaoNum === 2 || situacaoNum === 3) {
      setErrorMessage('Cartão não encontrado');
    } else if (situacaoNum === 0) {
      setErrorMessage('Cartão bloqueado');
    } else {
      setErrorMessage(`Erro ao fazer login (código: ${resultado})`);
      setDebugInfo(JSON.stringify(data));
    }
  };

  // Função para lidar com o envio do formulário de recuperação de senha
  const handleRecuperarSenha = async () => {
    if (!cartaoRecuperacao) {
      setMensagemRecuperacao('Por favor, informe o número do cartão');
      return;
    }
    
    if (!metodoRecuperacao) {
      setMensagemRecuperacao('Por favor, selecione um método de recuperação');
      return;
    }
    
    setEnviandoRecuperacao(true);
    setMensagemRecuperacao('');
    
    try {
      // Preparar os dados para enviar
      const formData = new FormData();
      formData.append('cartao', cartaoRecuperacao);
      formData.append('metodo', metodoRecuperacao);
      
      // Chamar a API de recuperação de senha
      const response = await fetch('/api/recuperacao-senha', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Atualizar mensagem e mostrar campo para código
        setMensagemRecuperacao(result.message);
        setDestinoMascarado(result.destino);
        
        // Se estiver em ambiente de desenvolvimento, mostrar o código recebido
        if (result.codigoTemp) {
          setMensagemRecuperacao(prev => 
            `${prev} [AMBIENTE DEV: Use o código ${result.codigoTemp}]`
          );
          setCodigoRecuperacao(result.codigoTemp);
        }
        
        // Mover para próxima etapa (validação de código)
        setTimeout(() => {
          setEtapaRecuperacao('codigo');
        }, 1500);
      } else {
        setMensagemRecuperacao(result.message || 'Erro ao solicitar recuperação de senha.');
      }
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      setMensagemRecuperacao('Erro ao solicitar recuperação de senha. Tente novamente mais tarde.');
    } finally {
      setEnviandoRecuperacao(false);
    }
  };

  // Função para validar o código de recuperação
  const handleValidarCodigo = async () => {
    if (!codigoRecuperacao || codigoRecuperacao.length < 6) {
      setMensagemRecuperacao('Por favor, informe o código de verificação completo');
      return;
    }
    
    setEnviandoCodigo(true);
    setMensagemRecuperacao('');
    
    try {
      // Preparar os dados para enviar
      const formData = new FormData();
      formData.append('cartao', cartaoRecuperacao);
      formData.append('codigo', codigoRecuperacao);
      
      // Chamar a API de validação do código
      const response = await fetch('/api/validar-codigo', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Salvar o token e avançar para a próxima etapa
        setTokenRecuperacao(result.token);
        setMensagemRecuperacao('Código validado com sucesso. Agora defina sua nova senha.');
        // Mover para a etapa final (nova senha)
        setTimeout(() => {
          setEtapaRecuperacao('nova_senha');
          setMensagemRecuperacao('');
        }, 1500);
      } else {
        setMensagemRecuperacao(result.message || 'Código inválido ou expirado.');
      }
    } catch (error) {
      console.error('Erro ao validar código:', error);
      setMensagemRecuperacao('Erro ao validar código. Tente novamente.');
    } finally {
      setEnviandoCodigo(false);
    }
  };

  // Função para definir a nova senha
  const handleDefinirNovaSenha = async () => {
    if (!novaSenha) {
      setMensagemRecuperacao('Por favor, informe a nova senha');
      return;
    }
    
    if (novaSenha.length < 4) {
      setMensagemRecuperacao('A senha deve ter pelo menos 4 caracteres');
      return;
    }
    
    if (novaSenha !== confirmacaoSenha) {
      setMensagemRecuperacao('As senhas não coincidem');
      return;
    }
    
    setEnviandoNovaSenha(true);
    setMensagemRecuperacao('');
    
    try {
      // Preparar os dados para enviar
      const formData = new FormData();
      formData.append('cartao', cartaoRecuperacao);
      formData.append('senha', novaSenha);
      formData.append('token', tokenRecuperacao);
      
      // Chamar a API de redefinição de senha
      const response = await fetch('/api/redefinir-senha', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMensagemRecuperacao(result.message || 'Senha redefinida com sucesso!');
        
        // Após 3 segundos, fechar o modal e limpar os campos
        setTimeout(() => {
          setEsqueciSenhaModal(false);
          resetarFormularioRecuperacao();
          // Preencher o campo de cartão no formulário de login
          setValue('cartao', cartaoRecuperacao);
        }, 3000);
      } else {
        setMensagemRecuperacao(result.message || 'Erro ao redefinir senha.');
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setMensagemRecuperacao('Erro ao redefinir senha. Tente novamente mais tarde.');
    } finally {
      setEnviandoNovaSenha(false);
    }
  };

  // Função para resetar o formulário de recuperação
  const resetarFormularioRecuperacao = () => {
    setEtapaRecuperacao('solicitacao');
    setCartaoRecuperacao('');
    setMetodoRecuperacao(null);
    setCodigoRecuperacao('');
    setTokenRecuperacao('');
    setNovaSenha('');
    setConfirmacaoSenha('');
    setMensagemRecuperacao('');
    setDestinoMascarado('');
  };

  // Função para abrir o modal de recuperação de senha
  const abrirModalRecuperacao = (e: React.MouseEvent) => {
    e.preventDefault();
    setEsqueciSenhaModal(true);
    resetarFormularioRecuperacao();
  };

  // Função para voltar para a etapa anterior no fluxo de recuperação
  const voltarEtapaRecuperacao = () => {
    if (etapaRecuperacao === 'nova_senha') {
      setEtapaRecuperacao('codigo');
    } else if (etapaRecuperacao === 'codigo') {
      setEtapaRecuperacao('solicitacao');
    }
    setMensagemRecuperacao('');
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{associadoNome}</h2>
      </div>

      {showSavedCards && savedCards.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">Cartões Recentes</h3>
          <div className="space-y-2">
            {savedCards.map((card, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectCard(card)}
                className="w-full flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center">
                  <FaCreditCard className="text-blue-500 mr-2" />
                  <span>{card.numero}</span>
                </span>
                {card.nome && <span className="text-sm text-gray-500">{card.nome}</span>}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowSavedCards(false)}
              className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md shadow transition duration-200"
            >
              Usar Outro Cartão
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        {!showSavedCards && (
          <>
            <div className="space-y-1">
              <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <FaCreditCard className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Número do Cartão"
                  className="flex-1 outline-none bg-transparent"
                  readOnly={readOnly}
                  maxLength={10}
                  {...register('cartao')}
                />
              </div>
              {errors.cartao && (
                <p className="text-sm text-red-500">{errors.cartao.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center border rounded-md px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <FaLock className="text-gray-400 mr-2" />
                <input
                  type="password"
                  placeholder="Senha"
                  className="flex-1 outline-none bg-transparent"
                  maxLength={20}
                  {...register('senha')}
                />
              </div>
              {errors.senha && (
                <p className="text-sm text-red-500">{errors.senha.message}</p>
              )}
            </div>

            {errorMessage && (
              <div className="p-2 bg-red-100 text-red-700 rounded text-center">
                {errorMessage}
              </div>
            )}
            
            {debugInfo && (
              <div className="p-2 bg-gray-100 text-gray-700 rounded text-xs overflow-auto max-h-40">
                <strong>Info Diagnóstico:</strong> {debugInfo}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <FaSpinner6 className="animate-spin h-5 w-5" />
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
            
            {readOnly && (
              <button
                type="button"
                onClick={handleTrocarCartao}
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md shadow transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Trocar Cartão
              </button>
            )}
            
            {savedCards.length > 0 && !readOnly && (
              <button
                type="button"
                onClick={() => setShowSavedCards(true)}
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md shadow transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Cartões Recentes
              </button>
            )}
            
            <div className="text-center">
              <a 
                href="#" 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={abrirModalRecuperacao}
              >
                Esqueci minha senha
              </a>
            </div>
          </>
        )}
      </form>

      {/* Modal de Recuperação de Senha */}
      <Transition.Root show={esqueciSenhaModal} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={() => setEsqueciSenhaModal(false)}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                {/* Cabeçalho do modal */}
                <div>
                  <div className="text-center">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      {etapaRecuperacao === 'solicitacao' && 'Recuperação de Senha'}
                      {etapaRecuperacao === 'codigo' && 'Digite o código de verificação'}
                      {etapaRecuperacao === 'nova_senha' && 'Defina sua nova senha'}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {etapaRecuperacao === 'solicitacao' && 'Digite o número do seu cartão e escolha como deseja receber o código de recuperação.'}
                        {etapaRecuperacao === 'codigo' && `Um código de verificação foi enviado para ${destinoMascarado || 'seu contato cadastrado'}. Por favor, digite-o abaixo.`}
                        {etapaRecuperacao === 'nova_senha' && 'Crie uma nova senha para sua conta. A senha deve ter pelo menos 4 caracteres.'}
                      </p>
                    </div>
                  </div>

                  {/* Etapa 1: Solicitação do código */}
                  {etapaRecuperacao === 'solicitacao' && (
                    <div className="mt-4">
                      <label htmlFor="cartao-recuperacao" className="block text-sm font-medium text-gray-700">
                        Número do Cartão
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                          <FaCreditCard className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          id="cartao-recuperacao"
                          value={cartaoRecuperacao}
                          onChange={(e) => setCartaoRecuperacao(e.target.value.replace(/\D/g, ''))}
                          className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                          placeholder="Digite o número do cartão"
                          maxLength={10}
                        />
                      </div>
                    
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Método de Recuperação
                        </label>
                        <div className="mt-2 space-y-2">
                          <div 
                            className={`flex items-center p-3 border rounded-md cursor-pointer ${metodoRecuperacao === 'email' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                            onClick={() => setMetodoRecuperacao('email')}
                          >
                            <FaEnvelope className={`mr-3 ${metodoRecuperacao === 'email' ? 'text-blue-500' : 'text-gray-400'}`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900">E-mail</p>
                              <p className="text-xs text-gray-500">Enviar código para o e-mail cadastrado</p>
                            </div>
                          </div>
                          
                          <div 
                            className={`flex items-center p-3 border rounded-md cursor-pointer ${metodoRecuperacao === 'sms' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                            onClick={() => setMetodoRecuperacao('sms')}
                          >
                            <FaPhone className={`mr-3 ${metodoRecuperacao === 'sms' ? 'text-blue-500' : 'text-gray-400'}`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900">SMS</p>
                              <p className="text-xs text-gray-500">Enviar código via SMS para o celular cadastrado</p>
                            </div>
                          </div>
                          
                          <div 
                            className={`flex items-center p-3 border rounded-md cursor-pointer ${metodoRecuperacao === 'whatsapp' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                            onClick={() => setMetodoRecuperacao('whatsapp')}
                          >
                            <FaWhatsapp className={`mr-3 ${metodoRecuperacao === 'whatsapp' ? 'text-blue-500' : 'text-gray-400'}`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                              <p className="text-xs text-gray-500">Enviar código via WhatsApp</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etapa 2: Validação do código */}
                  {etapaRecuperacao === 'codigo' && (
                    <div className="mt-4">
                      <label htmlFor="codigo-recuperacao" className="block text-sm font-medium text-gray-700">
                        Código de verificação
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="codigo-recuperacao"
                          value={codigoRecuperacao}
                          onChange={(e) => setCodigoRecuperacao(e.target.value.replace(/[^\d]/g, ''))}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md text-center tracking-widest"
                          placeholder="Digite o código de 6 dígitos"
                          maxLength={6}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Digite o código de 6 dígitos enviado para {metodoRecuperacao === 'email' ? 'seu e-mail' : metodoRecuperacao === 'sms' ? 'seu celular via SMS' : 'seu WhatsApp'}.
                      </p>
                    </div>
                  )}

                  {/* Etapa 3: Nova senha */}
                  {etapaRecuperacao === 'nova_senha' && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="nova-senha" className="block text-sm font-medium text-gray-700">
                          Nova senha
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            id="nova-senha"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Mínimo de 4 caracteres"
                            minLength={4}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="confirmar-senha" className="block text-sm font-medium text-gray-700">
                          Confirmar senha
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            id="confirmar-senha"
                            value={confirmacaoSenha}
                            onChange={(e) => setConfirmacaoSenha(e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Digite a senha novamente"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Mensagem de feedback */}
                  {mensagemRecuperacao && (
                    <div className={`mt-3 p-3 rounded-md text-sm ${mensagemRecuperacao.includes('sucesso') || mensagemRecuperacao.includes('validado') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      <div className="flex">
                        <FaInfoCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span>{mensagemRecuperacao}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Botões de ação */}
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  {etapaRecuperacao === 'solicitacao' && (
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleRecuperarSenha}
                      disabled={enviandoRecuperacao || !cartaoRecuperacao || !metodoRecuperacao}
                    >
                      {enviandoRecuperacao ? (
                        <><FaSpinner className="animate-spin h-5 w-5 mr-2" /> Enviando...</>
                      ) : (
                        "Enviar Código"
                      )}
                    </button>
                  )}

                  {etapaRecuperacao === 'codigo' && (
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleValidarCodigo}
                      disabled={enviandoCodigo || !codigoRecuperacao || codigoRecuperacao.length < 6}
                    >
                      {enviandoCodigo ? (
                        <><FaSpinner className="animate-spin h-5 w-5 mr-2" /> Verificando...</>
                      ) : (
                        "Verificar Código"
                      )}
                    </button>
                  )}

                  {etapaRecuperacao === 'nova_senha' && (
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleDefinirNovaSenha}
                      disabled={enviandoNovaSenha || !novaSenha || novaSenha !== confirmacaoSenha || novaSenha.length < 4}
                    >
                      {enviandoNovaSenha ? (
                        <><FaSpinner className="animate-spin h-5 w-5 mr-2" /> Salvando...</>
                      ) : (
                        "Salvar Nova Senha"
                      )}
                    </button>
                  )}

                  {/* Botão de cancelar/voltar */}
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={etapaRecuperacao === 'solicitacao' ? () => setEsqueciSenhaModal(false) : voltarEtapaRecuperacao}
                  >
                    {etapaRecuperacao === 'solicitacao' ? 'Cancelar' : 'Voltar'}
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
} 