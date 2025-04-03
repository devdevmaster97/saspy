'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaBuilding, FaFileAlt } from 'react-icons/fa';
import Logo from '../components/Logo';
import UpdateChecker from '../components/UpdateChecker';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

// Interfaces para tipos de Window em ambientes específicos
interface ReactNativeWindow extends Window {
  ReactNativeWebView?: {
    postMessage: (message: string) => void;
  };
}

interface AndroidWindow extends Window {
  Android?: {
    exitApp: () => void;
  };
}

interface WebkitWindow extends Window {
  webkit?: {
    messageHandlers?: {
      exitApp?: {
        postMessage: (message: string) => void;
      };
    };
  };
}

export default function MenuPage() {
  const router = useRouter();
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
    // Em uma aplicação real, você obteria a versão do package.json ou de uma variável de ambiente
    setAppVersion('1.0.0');
  }, []);

  const handleUserCardClick = () => {
    router.push('/dashboard');
  };

  const handleConvenioCardClick = () => {
    router.push('/convenio/login');
  };

  const handlePoliticaPrivacidadeClick = () => {
    router.push('/politica-privacidade');
  };

  // Classes dinâmicas com base no tema
  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-600';
  const headingClass = theme === 'dark' ? 'text-white' : 'text-gray-900';

  if (!isMounted) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  return (
    <div className={`min-h-screen ${bgClass} flex flex-col items-center justify-center transition-colors`}>
      {/* Adicionar o controle de tema no canto superior direito */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="mb-8">
          <Logo />
          <h1 className={`text-2xl font-bold text-center mt-4 mb-2 ${headingClass}`}>Bem-vindo ao QRCred</h1>
          <p className={`text-center ${textClass}`}>O que você deseja fazer hoje?</p>
        </div>

        {/* Cards de Opção */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
          {/* Card do Usuário */}
          <button
            onClick={handleUserCardClick}
            className={`p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow flex flex-col items-center space-y-3 ${cardClass}`}
          >
            <div className={theme === 'dark' ? 'bg-blue-900 p-3 rounded-full' : 'bg-blue-100 p-3 rounded-full'}>
              <FaUser className={theme === 'dark' ? 'text-blue-400 text-xl' : 'text-blue-600 text-xl'} />
            </div>
            <h2 className={`font-semibold text-lg ${headingClass}`}>Área do Usuário</h2>
            <p className={`text-sm text-center ${textClass}`}>
              Acesse suas informações e transações
            </p>
          </button>

          {/* Card do Convênio */}
          <button
            onClick={handleConvenioCardClick}
            className={`p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow flex flex-col items-center space-y-3 ${cardClass}`}
          >
            <div className={theme === 'dark' ? 'bg-green-900 p-3 rounded-full' : 'bg-green-100 p-3 rounded-full'}>
              <FaBuilding className={theme === 'dark' ? 'text-green-400 text-xl' : 'text-green-600 text-xl'} />
            </div>
            <h2 className={`font-semibold text-lg ${headingClass}`}>Área do Convênio</h2>
            <p className={`text-sm text-center ${textClass}`}>
              Gerencie seus convênios e operações
            </p>
          </button>
        </div>
        
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4 mb-3">
            <button 
              onClick={handlePoliticaPrivacidadeClick}
              className={theme === 'dark' ? 'text-blue-400 hover:underline text-sm' : 'text-blue-600 hover:underline text-sm'}
            >
              Política de Privacidade
            </button>
          </div>
          <p className={theme === 'dark' ? 'text-gray-400 text-xs mt-2' : 'text-gray-500 text-xs mt-2'}>
            Versão: {appVersion}
          </p>
        </div>
      </main>

      {/* Verificador de atualizações */}
      <UpdateChecker />
    </div>
  );
} 