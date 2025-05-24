'use client';

import { FaStore } from 'react-icons/fa';
import ConveniosContent from '@/app/components/dashboard/ConveniosContent';
import { useTranslations } from '@/app/contexts/LanguageContext';

export default function ConveniosPage() {
  const translations = useTranslations('ConveniosPage');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {translations.page_title || 'Convênios'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-blue-600 flex items-center">
          <FaStore className="text-white text-2xl mr-3" />
          <h2 className="text-xl font-bold text-white">
            {translations.partner_network_title || 'Rede de Convênios'}
          </h2>
        </div>

        <div className="p-4">
          <ConveniosContent />
        </div>
      </div>
    </div>
  );
} 