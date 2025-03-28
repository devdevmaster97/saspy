'use client';

import { useEffect, useState } from 'react';
import { FaDownload } from 'react-icons/fa';

interface UpdateCheckerProps {
  onUpdateAvailable?: () => void;
}

export default function UpdateChecker({ onUpdateAvailable }: UpdateCheckerProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de verificação de atualização
    // Em produção, isso seria uma chamada para um serviço real
    const checkForUpdates = async () => {
      try {
        setLoading(true);
        // Aqui você faria uma chamada real para verificar atualizações
        // Por exemplo, consultando o Firebase Remote Config
        
        // Simulação: não há atualização disponível
        const hasUpdate = false; // Substituir por lógica real
        setUpdateAvailable(hasUpdate);
        
        if (hasUpdate && onUpdateAvailable) {
          onUpdateAvailable();
        }
        
      } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
      } finally {
        setLoading(false);
      }
    };

    checkForUpdates();
  }, [onUpdateAvailable]);

  if (loading || !updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center">
      <FaDownload className="mr-2" />
      <div>
        <p className="font-semibold">Nova versão disponível!</p>
        <p className="text-sm">Clique para atualizar o aplicativo</p>
      </div>
    </div>
  );
} 