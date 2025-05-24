'use client';

import { useState, useEffect } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import ExtratoTabs from '@/app/components/dashboard/ExtratoTabs';
import { useTranslations } from '@/app/contexts/LanguageContext';

export default function ExtratoPage() {
  const [cartao, setCartao] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const translations = useTranslations('ExtractPage');

  useEffect(() => {
    setIsClient(true);
    // Obter os dados do usuário do localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('saspy_user');
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
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{translations.page_title || 'Extrato'}</h1>
      </header>

      <main className="bg-white rounded-lg shadow overflow-hidden">
        <section className="p-4 bg-blue-600 flex items-center">
          <FaClipboardList className="text-white text-2xl mr-3" />
          <h2 className="text-xl font-bold text-white">{translations.section_title || 'Extrato de Movimentações'}</h2>
        </section>

        <section className="pt-2">
          {cartao ? (
            <ExtratoTabs cartao={cartao} />
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md text-yellow-700">
              {translations.error_card_not_found || 'Não foi possível identificar o cartão. Faça login novamente.'}
            </div>
          )}
        </section>
      </main>
    </div>
  );
} 