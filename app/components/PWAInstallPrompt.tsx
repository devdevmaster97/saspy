'use client';

import { useEffect, useState } from 'react';
import { FaDownload } from 'react-icons/fa';

// Declaração de tipo personalizada para o Window
declare global {
  interface Window {
    deferredPrompt?: any;
  }
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Verifica se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      console.log('App já está instalado');
      return;
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verifica se o evento já foi disparado
    if (window.deferredPrompt) {
      console.log('deferredPrompt já existe');
      setDeferredPrompt(window.deferredPrompt);
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('deferredPrompt não está disponível');
      return;
    }

    try {
      console.log('Iniciando instalação...');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Resultado da instalação:', outcome);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } catch (error) {
      console.error('Erro durante a instalação:', error);
    }
  };

  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-colors z-50"
    >
      <FaDownload />
      <span>Instalar App</span>
    </button>
  );
} 