'use client';

import Image from 'next/image';
import { useLanguage } from '../contexts/LanguageContext';

export function CompactLanguageSelector() {
  const { locale, setLocale } = useLanguage();

  const languages = [
    {
      code: 'pt-BR',
      name: 'PT',
      flag: '/flags/br.svg'
    },
    {
      code: 'es',
      name: 'ES',
      flag: '/flags/es.svg'
    }
  ] as const;

  const handleLanguageChange = (newLocale: typeof languages[number]['code']) => {
    setLocale(newLocale);
  };

  return (
    <div className="flex items-center justify-center space-x-4">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`group flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 ${
            locale === lang.code ? 'bg-gray-100' : ''
          }`}
        >
          <div className="w-5 h-5 relative overflow-hidden rounded-full border border-gray-200">
            <Image
              src={lang.flag}
              alt={lang.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xs font-medium text-gray-600">{lang.name}</span>
        </button>
      ))}
    </div>
  );
} 