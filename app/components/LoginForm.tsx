'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { FaLock, FaCreditCard, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { FaSpinner as FaSpinner6 } from 'react-icons/fa6';
import { useTheme } from '@/app/contexts/ThemeContext';

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

interface LoginFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function LoginForm({ onSubmit, loading }: LoginFormProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const [associadoNome, setAssociadoNome] = useState('Login do Usuário');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Função para lidar com a troca de cartão
  const handleTrocarCartao = () => {
    setReadOnly(false);
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

  if (!isMounted) {
    return null;
  }

  // Classes baseadas no tema
  const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const borderClass = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const inputBgClass = theme === 'dark' ? 'bg-gray-700' : 'bg-transparent';
  const inputTextClass = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const inputIconClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-400';
  const debugBgClass = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
  const debugTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const placeholderClass = theme === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-500';

  return (
    <div className={`w-full max-w-md p-6 ${bgClass} rounded-lg shadow-lg`}>
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold ${textClass}`}>{associadoNome}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div className="space-y-1">
          <div className={`flex items-center border ${borderClass} rounded-md px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700' : ''}`}>
            <FaCreditCard className={inputIconClass + " mr-2"} />
            <input
              type="text"
              placeholder="Número do Cartão"
              className={`flex-1 outline-none ${inputTextClass} ${placeholderClass} ${inputBgClass}`}
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
          <div className={`flex items-center border ${borderClass} rounded-md px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700' : ''}`}>
            <FaLock className={inputIconClass + " mr-2"} />
            <input
              type="password"
              placeholder="Senha"
              className={`flex-1 outline-none ${inputTextClass} ${placeholderClass} ${inputBgClass}`}
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
          <div className={`p-2 ${debugBgClass} ${debugTextClass} rounded text-xs overflow-auto max-h-40`}>
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

        <div className="text-center">
          <a 
            href="#" 
            className={`text-sm ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
            onClick={(e) => {
              e.preventDefault();
              router.push('/esqueci-senha');
            }}
          >
            Esqueci minha senha
          </a>
        </div>
      </form>
    </div>
  );
} 