'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaUser, FaStore } from 'react-icons/fa';
import MenuCard from '../components/MenuCard';
import Logo from '../components/Logo';
import UpdateChecker from '../components/UpdateChecker';

export default function MenuPage() {
  const router = useRouter();
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    // Em uma aplicação real, você obteria a versão do package.json ou de uma variável de ambiente
    setAppVersion('1.0.0');
  }, []);

  const handleUserCardClick = () => {
    router.push('/login');
  };

  const handleConvenioCardClick = () => {
    router.push('/convenio');
  };

  const handlePoliticaPrivacidadeClick = () => {
    router.push('/politica-privacidade');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-center">
          <div className="text-white text-2xl font-bold">
            QRCred<span className="text-green-400">.</span>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
          <MenuCard 
            icon={<FaUser />} 
            title="Área do Usuário" 
            onClick={handleUserCardClick} 
          />
          <MenuCard 
            icon={<FaStore />} 
            title="Área do Convênio" 
            onClick={handleConvenioCardClick} 
          />
        </div>
        
        <div className="mt-12 text-center">
          <button 
            onClick={handlePoliticaPrivacidadeClick}
            className="text-blue-600 hover:underline text-sm"
          >
            Política de Privacidade
          </button>
          <p className="text-gray-500 text-xs mt-2">
            Versão: {appVersion}
          </p>
        </div>
      </main>

      {/* Verificador de atualizações */}
      <UpdateChecker />
    </div>
  );
} 