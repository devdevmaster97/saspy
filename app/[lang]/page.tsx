'use client';

import { LanguageSelector } from '../components/LanguageSelector';
import { getDictionary } from '../dictionaries';
import { useEffect, useState } from 'react';

interface Dictionary {
  login: {
    title: string;
    subtitle: string;
  };
}

export default function Home({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary(lang);
      setDictionary(dict);
    };
    loadDictionary();
  }, [lang]);

  if (!dictionary) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{dictionary.login.title}</h1>
          <p className="mt-2 text-gray-600">{dictionary.login.subtitle}</p>
        </div>
        
        <LanguageSelector />
        
        {/* Resto do conteúdo da página */}
      </div>
    </main>
  );
} 