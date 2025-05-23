'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Language = 'pt-BR' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [language, setLanguageState] = useState<Language>('pt-BR');

  useEffect(() => {
    // Recuperar idioma do localStorage na inicialização
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
      // Atualizar o idioma na URL
      const newPath = `/${savedLanguage}${pathname}`;
      router.push(newPath);
    } else {
      // Detectar idioma do navegador
      const browserLang = navigator.language;
      const defaultLang: Language = browserLang.startsWith('es') ? 'es' : 'pt-BR';
      setLanguageState(defaultLang);
      localStorage.setItem('language', defaultLang);
      // Atualizar o idioma na URL
      const newPath = `/${defaultLang}${pathname}`;
      router.push(newPath);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Atualizar o idioma na URL
    const newPath = `/${lang}${pathname}`;
    router.push(newPath);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 