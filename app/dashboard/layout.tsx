'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/dashboard/Sidebar';
import { useTranslations } from '@/app/contexts/LanguageContext';

interface UserData {
  nome: string;
  cartao: string;
  nome_divisao: string;
  [key: string]: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const translations = useTranslations('DashboardLayout');

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Verificar se está no lado do cliente
        if (typeof window === 'undefined') return;

        const storedUser = localStorage.getItem('saspy_user');
        
        if (!storedUser) {
          if (isMounted) {
            router.replace('/login');
          }
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        
        if (isMounted) {
          setUserData(parsedUser);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(translations.console_error_user_data_processing || 'Erro ao processar dados do usuário:', error);
        if (isMounted) {
          router.replace('/login');
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, translations]);

  // Mostra o loading apenas se estiver carregando
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-pulse text-2xl text-gray-500">
          {translations.loading_text || 'Carregando...'}
        </div>
      </div>
    );
  }

  // Se não tiver dados do usuário, não renderiza nada (será redirecionado)
  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar 
        userName={userData.nome} 
        cardNumber={userData.cartao}
        company={userData.nome_divisao}
      />
      
      <main className="lg:pl-64 pt-16 pb-20">
        <div className="p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 