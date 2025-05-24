'use client';

import { useTranslations } from '@/app/contexts/LanguageContext';
import AntecipacaoContent from '@/app/components/dashboard/AntecipacaoContent';

export default function AntecipacaoPage() {
  const t = useTranslations('AntecipacaoPage');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.page_title || 'Antecipação'}</h1>
      </div>
      <div className="bg-white rounded-lg shadow">
        <AntecipacaoContent />
      </div>
    </div>
  );
} 