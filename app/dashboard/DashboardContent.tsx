'use client';

import SaldoCard from '@/app/components/dashboard/SaldoCard';
import { FaInfoCircle } from 'react-icons/fa';
import { useTranslations, useLanguage } from '@/app/contexts/LanguageContext';

export default function DashboardContent() {
  const translations = useTranslations('Dashboard');
  const { locale } = useLanguage();

  if (!translations || Object.keys(translations).length === 0 || !locale) {
    return (
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="mt-2 sm:mt-0 text-sm text-gray-600">
            <div className="flex items-center">
              <FaInfoCircle className="mr-1" />
              <span>Carregando conteúdo...</span>
            </div>
          </div>
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-3">
            <h2 className="sr-only">Saldo do Cartão</h2>
            {/* Loader para SaldoCard se necessário */}
          </section>
          <section className="lg:col-span-3 bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Dicas de Uso</h2>
            {/* Loader para Dicas se necessário */}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{translations.page_title || 'Dashboard'}</h1>
        <div className="mt-2 sm:mt-0 text-sm text-gray-600">
          <div className="flex items-center">
            <FaInfoCircle className="mr-1" />
            <span>{translations.last_update || 'Última atualização:'} {new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'pt-BR')}</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-3">
          <h2 className="sr-only">{translations.card_balance_title || 'Saldo do Cartão'}</h2>
          <SaldoCard />
        </section>

        <section className="lg:col-span-3 bg-white p-4 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">{translations.usage_tips_title || 'Dicas de Uso'}</h2>
          
          <div className="space-y-3">
            <article className="p-3 bg-blue-50 rounded-md border border-blue-100">
              <h3 className="font-medium text-blue-800">{translations.tip1_title || 'Controle seus gastos'}</h3>
              <p className="text-sm text-gray-600">
                {translations.tip1_description || 'Acompanhe seus gastos regularmente para manter o controle financeiro.'}
              </p>
            </article>
            
            <article className="p-3 bg-green-50 rounded-md border border-green-100">
              <h3 className="font-medium text-green-800">{translations.tip2_title || 'Confira novos convênios'}</h3>
              <p className="text-sm text-gray-600">
                {translations.tip2_description || 'Novos convênios são adicionados frequentemente. Confira a lista completa.'}
              </p>
            </article>
            
            <article className="p-3 bg-purple-50 rounded-md border border-purple-100">
              <h3 className="font-medium text-purple-800">{translations.tip3_title || 'Use o QR Code para pagamentos rápidos'}</h3>
              <p className="text-sm text-gray-600">
                {translations.tip3_description || 'Seu QR Code pode ser usado para pagamentos rápidos em estabelecimentos parceiros.'}
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
} 