'use client';

import { useEffect, useState } from 'react';
import { FaApple, FaTimes } from 'react-icons/fa';

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export default function IOSInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Detecta se é iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Detecta se já está instalado como PWA
    const isStandaloneMode = (navigator as NavigatorWithStandalone).standalone || 
      (document.referrer.includes('android-app://')) ||
      window.matchMedia('(display-mode: standalone)').matches;

    setIsIOS(isIOSDevice);
    setIsStandalone(isStandaloneMode);
  }, []);

  if (!isIOS || isStandalone || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 shadow-lg z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaApple className="text-2xl" />
          <div>
            <p className="font-semibold">Instale o QRCred</p>
            <p className="text-sm text-gray-300">Para uma experiência melhor, instale o app na sua tela inicial</p>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          <FaTimes />
        </button>
      </div>
      
      <div className="mt-2 text-sm text-gray-300">
        <p>Para instalar:</p>
        <ol className="list-decimal list-inside ml-2">
          <li>Toque no botão Compartilhar <span className="text-xs">(ícone de quadrado com seta para cima)</span></li>
          <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
          <li>Toque em "Adicionar"</li>
        </ol>
      </div>
    </div>
  );
} 