import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

type Language = 'pt-BR' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>('pt-BR');

  useEffect(() => {
    // Recuperar idioma do localStorage na inicialização
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
      router.push(router.pathname, router.pathname, { locale: savedLanguage });
    } else {
      // Detectar idioma do navegador
      const browserLang = navigator.language;
      const defaultLang: Language = browserLang.startsWith('es') ? 'es' : 'pt-BR';
      setLanguageState(defaultLang);
      localStorage.setItem('language', defaultLang);
      router.push(router.pathname, router.pathname, { locale: defaultLang });
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    router.push(router.pathname, router.pathname, { locale: lang });
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