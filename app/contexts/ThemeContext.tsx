'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

// Criar contexto com valores padrão
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

// Hook personalizado para facilitar o uso do contexto
export const useTheme = () => useContext(ThemeContext);

// Componente provider para envolver a aplicação
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Estado para armazenar o tema atual
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Função para alternar entre temas
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Aplicar classe no elemento HTML para o Tailwind
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Inicializar tema do localStorage ou da preferência do sistema
  useEffect(() => {
    setMounted(true);
    
    // Verificar tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Se tem um tema salvo, usar ele
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
      
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } 
    // Se não tem, verificar preferência do sistema
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (prefersDark) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    }
  }, []);

  // Para evitar problemas de hidratação, só renderizar após a montagem
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 