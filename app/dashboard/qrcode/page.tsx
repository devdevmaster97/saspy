'use client';

import QrCodeContent from '@/app/components/dashboard/QrCodeContent';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QrCodePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação apenas com localStorage
    const checkAuthWithLocalStorage = () => {
      try {
        const storedUser = localStorage.getItem('qrcred_user');
        if (storedUser) {
          setIsAuthenticated(true);
        } else {
          // Se não há usuário no localStorage, redireciona para login
          router.push('/login');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthWithLocalStorage();
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Não renderiza nada, o redirecionamento já foi tratado
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">QR Code do Cartão</h1>
      </div>
      <div className="bg-white rounded-lg shadow">
        <QrCodeContent />
      </div>
    </div>
  );
} 