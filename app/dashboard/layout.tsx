'use client';

import { useEffect, useState } from 'react';
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
  const translations = useTranslations('DashboardLayout');

  useEffect(() => {
    // Verificar se o usuário está logado
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('saspy_user');
        
        if (!storedUser) {
          // Redirecionar para login se não estiver logado
          window.location.href = '/login';
          return;
        }
        
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
        } catch (error) {
          console.error(translations.console_error_user_data_processing || 'Erro ao processar dados do usuário:', error);
          window.location.href = '/login';
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-pulse text-2xl text-gray-500">{translations.loading_text || 'Carregando...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {userData && (
        <Sidebar 
          userName={userData.nome} 
          cardNumber={userData.cartao}
          company={userData.nome_divisao}
        />
      )}
      
      <main className="lg:pl-64 pt-16 pb-20">
        <div className="p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 