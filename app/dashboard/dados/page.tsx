'use client';

import MeusDadosContent from '@/app/components/dashboard/MeusDadosContent';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useState, useEffect } from 'react';

export default function DadosPage() {
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
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';

  return (
    <div className={`container mx-auto px-4 py-8 ${bgClass}`}>
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-2xl font-bold ${textClass}`}>Meus Dados</h1>
      </div>
      <div className={`${cardBgClass} rounded-lg shadow`}>
        <MeusDadosContent />
      </div>
    </div>
  );
} 