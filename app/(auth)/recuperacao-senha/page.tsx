'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaEnvelope, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import Button from '@/app/components/Button';
import Header from '@/app/components/Header';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function RecuperacaoSenha() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEnviarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Por favor, informe o nome de usuário');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/convenio/recuperacao-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: username }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Código de recuperação enviado com sucesso!');
        router.push(`/validar-codigo?username=${username}`);
      } else {
        toast.error(data.message || 'Erro ao enviar código de recuperação');
      }
    } catch (error) {
      console.error('Erro ao enviar código de recuperação:', error);
      toast.error('Ocorreu um erro ao solicitar a recuperação de senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoltar = () => {
    router.push('/login');
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
        title="Recuperação de Senha" 
        showBackButton
        onBackClick={handleVoltar}
      />
      
      <main className="flex-1 container max-w-md mx-auto px-4 py-8">
        <div className="bg-card-bg border border-card-border rounded-lg p-6 shadow-md">
          <form onSubmit={handleEnviarCodigo} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">Esqueceu sua senha?</h2>
              <p className="text-foreground mb-4">
                Informe seu nome de usuário para receber um código de recuperação por e-mail.
              </p>
              
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nome de usuário"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-gray-700 text-foreground"
              />
            </div>
            
            <div className="space-y-3">
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                rightIcon={<FaEnvelope />}
              >
                Enviar Código
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