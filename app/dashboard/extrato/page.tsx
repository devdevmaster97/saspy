'use client';

import { useState, useEffect } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import ExtratoTabs from '@/app/components/dashboard/ExtratoTabs';
import { useTheme } from '@/app/contexts/ThemeContext';

export default function ExtratoPage() {
  const [cartao, setCartao] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();

  // Classes baseadas no tema
  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const bgCardClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const alertBgClass = theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-50';
  const alertBorderClass = theme === 'dark' ? 'border-yellow-800' : 'border-yellow-100';
  const alertTextClass = theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700';

  useEffect(() => {
    setIsClient(true);
    // Obter os dados do usuário do localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('qrcred_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setCartao(userData.cartao || '');
      }
    }
  }, []);

  // Somente renderize o componente ExtratoTabs no cliente
  if (!isClient) {
    return null;
  }

  return (
    <div className={`space-y-6 transition-colors ${bgClass}`}>
      <header className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${textPrimaryClass}`}>Extrato</h1>
      </header>

      <main className={`${bgCardClass} rounded-lg shadow overflow-hidden transition-colors`}>
        <section className="p-4 bg-blue-600 flex items-center">
          <FaClipboardList className="text-white text-2xl mr-3" />
          <h2 className="text-xl font-bold text-white">Extrato de Movimentações</h2>
        </section>

        <section className="pt-2">
          {cartao ? (
            <ExtratoTabs cartao={cartao} theme={theme} />
          ) : (
            <div className={`p-4 ${alertBgClass} border ${alertBorderClass} rounded-md ${alertTextClass}`}>
              Não foi possível identificar o cartão. Faça login novamente.
            </div>
          )}
        </section>
      </main>
    </div>
  );
} 