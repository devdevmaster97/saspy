'use client';

import { useTheme } from '@/app/contexts/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
      className={`p-2 rounded-full transition-colors ${className} ${
        theme === 'light'
          ? 'text-gray-700 hover:bg-gray-200'
          : 'text-yellow-200 hover:bg-gray-700'
      }`}
    >
      {theme === 'light' ? <FaMoon className="w-5 h-5" /> : <FaSun className="w-5 h-5" />}
    </button>
  );
} 