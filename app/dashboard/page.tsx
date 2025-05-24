'use client';

import dynamic from 'next/dynamic';
import { FaInfoCircle } from 'react-icons/fa';
import { useTranslations, useLanguage } from '@/app/contexts/LanguageContext';
import { useState, useEffect } from 'react';

// Importar dinamicamente o DashboardContent, desabilitando SSR para ele
const DashboardContent = dynamic(() => import('./DashboardContent'), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="mt-2 sm:mt-0 text-sm text-gray-600">
          <div className="flex items-center">
            <span>Carregando...</span>
          </div>
        </div>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-3">
          <h2 className="sr-only">Saldo do Cartão</h2>
        </section>
        <section className="lg:col-span-3 bg-white p-4 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Dicas de Uso</h2>
        </section>
      </main>
    </div>
  )
});

export default function DashboardPage() {
  return <DashboardContent />;
} 