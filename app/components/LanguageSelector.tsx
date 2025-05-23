'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getDictionary } from '../dictionaries';

interface Dictionary {
  common: {
    select_language: string;
  };
}

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary(language);
      setDictionary(dict);
    };
    loadDictionary();
  }, [language]);

  if (!dictionary) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4">
      <label className="text-sm font-medium text-gray-700">
        {dictionary.common.select_language}:
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => setLanguage('pt-BR')}
          className={`px-4 py-2 rounded-md transition-all ${
            language === 'pt-BR'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🇧🇷 Português
        </button>
        <button
          onClick={() => setLanguage('es')}
          className={`px-4 py-2 rounded-md transition-all ${
            language === 'es'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🇪🇸 Español
        </button>
      </div>
    </div>
  );
} 