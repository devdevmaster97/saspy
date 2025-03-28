'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function UpdateNotification() {
  // Estado para controlar se há uma atualização disponível
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  // Função para forçar a atualização da aplicação
  const forceUpdate = async () => {
    try {
      // Limpar caches do navegador
      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('qrcred-')) {
              return caches.delete(cacheName);
            }
          })
        );
      }
      
      // Desregistrar os service workers atuais
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      
      // Recarregar a página
      window.location.reload();
    } catch (error) {
      console.error('Erro ao forçar atualização:', error);
      // Recarregar mesmo em caso de erro
      window.location.reload();
    }
  };
  
  // Verificar se há atualizações manualmente
  const checkForUpdates = async () => {
    try {
      const response = await fetch('/version.json?t=' + new Date().getTime(), { cache: 'no-store' });
      if (response.ok) {
        const currentCache = localStorage.getItem('app_version');
        const data = await response.json();
        
        if (!currentCache || currentCache !== data.version) {
          setUpdateAvailable(true);
          localStorage.setItem('app_version', data.version);
          
          // Mostrar notificação de atualização
          showUpdateNotification(data.notes || 'Nova versão disponível!');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  };
  
  // Mostrar notificação de atualização
  const showUpdateNotification = (message = 'Nova versão disponível!') => {
    toast.success(
      (t) => (
        <div className="flex flex-col gap-2">
          <p>{message}</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              forceUpdate();
              toast.dismiss(t.id);
            }}
          >
            Atualizar agora
          </button>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center'
      }
    );
  };

  useEffect(() => {
    // Verificar atualizações quando o componente montar
    checkForUpdates();
    
    // Agendar verificação periódica (a cada 30 minutos)
    const intervalId = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    // Escuta mensagens do Service Worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_AVAILABLE') {
        setUpdateAvailable(true);
        showUpdateNotification();
      }
    };
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      // Verificar se há service workers registrados
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          // Enviar mensagem para o service worker verificar atualizações
          registration.active?.postMessage({
            type: 'CHECK_UPDATES'
          });
        }
      });
    }
    
    // Monitorar mudanças de conexão para verificar atualizações quando o usuário estiver online
    window.addEventListener('online', checkForUpdates);
    
    // Verificar atualizações quando a aplicação volta a ficar visível
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    });
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', checkForUpdates);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, []);

  return null;
} 