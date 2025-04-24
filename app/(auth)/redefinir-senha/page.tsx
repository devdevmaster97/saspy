'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheck } from 'react-icons/fa';
import Button from '@/app/components/Button';
import Header from '@/app/components/Header';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function RedefinirSenha() {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || '';
  const token = searchParams.get('token') || '';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMostrarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  const toggleMostrarConfirmacao = () => {
    setMostrarConfirmacao(!mostrarConfirmacao);
  };

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senha.trim()) {
      toast.error('Por favor, informe a nova senha');
      return;
    }
    
    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (!username || !token) {
      toast.error('Informações de recuperação inválidas');
      router.push('/recuperacao-senha');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/convenio/redefinir-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          usuario: username, 
          senha: senha,
          codigo: token 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Senha redefinida com sucesso!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(data.message || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toast.error('Ocorreu um erro ao redefinir a senha');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVoltar = () => {
    router.push('/validar-codigo');
  };
  
  if (!isMounted) {
    return null;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Header 
        title="Redefinir Senha" 
        showBackButton
        onBackClick={handleVoltar}
      />
      
      <main className="flex-1 container max-w-md mx-auto px-4 py-8">
        <div className="bg-card-bg border border-card-border rounded-lg p-6 shadow-md">
          <form onSubmit={handleRedefinirSenha} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Criar nova senha</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="senha" className="block text-sm font-medium mb-1 text-foreground">
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-foreground"
                    placeholder="Digite a nova senha"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    onClick={toggleMostrarSenha}
                    tabIndex={-1}
                  >
                    {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmarSenha" className="block text-sm font-medium mb-1 text-foreground">
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    id="confirmarSenha"
                    type={mostrarConfirmacao ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-foreground"
                    placeholder="Confirme a nova senha"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    onClick={toggleMostrarConfirmacao}
                    tabIndex={-1}
                  >
                    {mostrarConfirmacao ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                rightIcon={<FaCheck />}
              >
                Redefinir Senha
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleVoltar}
                leftIcon={<FaArrowLeft />}
              >
                Voltar
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 