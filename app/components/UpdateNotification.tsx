'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function UpdateNotification() {
  useEffect(() => {
    // Escuta mensagens do Service Worker
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data?.type === 'UPDATE_AVAILABLE') {
        toast.success(
          (t) => (
            <div className="flex flex-col gap-2">
              <p>Nova versão disponível!</p>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  window.location.reload();
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
      }
    });
  }, []);

  return null;
} 