'use client';

import MeusDadosContent from '@/app/components/dashboard/MeusDadosContent';
import AuthGuard from '@/app/components/auth/AuthGuard';
import { useTranslations } from '@/app/contexts/LanguageContext';

export default function DadosPage() {
  const translations = useTranslations('MeusDadosPage');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {translations.page_title || 'Meus Dados'}
        </h1>
      </div>
      <div className="bg-white rounded-lg shadow">
        <AuthGuard>
          <MeusDadosContent />
        </AuthGuard>
      </div>
    </div>
  );
} 