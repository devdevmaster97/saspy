'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isMounted, setIsMounted] = useState(false);

  // Verificar o tema salvo no localStorage ao inicializar
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('qrcred_theme') as Theme;
      
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Verificar preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    }
  }, []);

  // Aplicar o tema ao documento HTML toda vez que ele mudar
  useEffect(() => {
    if (!isMounted) return;
    
    if (typeof window !== 'undefined') {
      const html = window.document.documentElement;
      
      // Remover qualquer classe de tema anterior
      html.classList.remove('light-theme', 'dark-theme');
      
      // Definir o atributo data-theme para estilização CSS
      html.setAttribute('data-theme', theme);
      
      // Salvar no localStorage
      localStorage.setItem('qrcred_theme', theme);

      // Aplicar classe ao body também para compatibilidade com alguns componentes
      document.body.setAttribute('data-theme', theme);
    }
  }, [theme, isMounted]);

  // Função para alternar entre temas
  const toggleTheme = () => {
    setTheme(currentTheme => currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar o tema
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  
  return context;
}; 