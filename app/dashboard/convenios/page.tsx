'use client';

import { FaStore } from 'react-icons/fa';
import ConveniosContent from '@/app/components/dashboard/ConveniosContent';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useState, useEffect } from 'react';

export default function ConveniosPage() {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Classes baseadas no tema
  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const headerBgClass = theme === 'dark' ? 'bg-blue-800' : 'bg-blue-600';

  return (
    <div className={`space-y-6 ${bgClass}`}>
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${textPrimaryClass}`}>Convênios</h1>
      </div>

      <div className={`${cardBgClass} rounded-lg shadow overflow-hidden`}>
        <div className={`p-4 ${headerBgClass} flex items-center`}>
          <FaStore className="text-white text-2xl mr-3" />
          <h2 className="text-xl font-bold text-white">Rede de Convênios</h2>
        </div>

        <div className="p-4">
          <ConveniosContent />
        </div>
      </div>
    </div>
  );
} 