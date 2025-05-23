import { LanguageSelector } from './components/LanguageSelector';
import { useTranslation } from 'next-i18next';

export default function Home() {
  const { t } = useTranslation('common');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('login.title')}</h1>
          <p className="mt-2 text-gray-600">{t('login.subtitle')}</p>
        </div>
        
        <LanguageSelector />
        
        {/* Resto do conteúdo da página */}
      </div>
    </main>
  );
}
