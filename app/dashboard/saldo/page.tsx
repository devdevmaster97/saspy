'use client';

import SaldoCard from '@/app/components/dashboard/SaldoCard';
import { FaInfoCircle, FaLightbulb } from 'react-icons/fa';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useState, useEffect } from 'react';

export default function SaldoPage() {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  
  // Classes baseadas no tema
  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const bgCardClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-yellow-100';
  const alertBgClass = theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-50';
  const alertTextClass = theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800';
  const tipsBgClass = theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50';
  const tipsBorderClass = theme === 'dark' ? 'border-blue-800' : 'border-blue-100';
  const tipsTextClass = theme === 'dark' ? 'text-blue-300' : 'text-blue-800';
  
  return (
    <div className={`space-y-6 transition-colors ${bgClass}`}>
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className={`text-2xl font-bold ${textPrimaryClass}`}>Saldo</h1>
        <div className={`mt-2 sm:mt-0 text-sm ${textSecondaryClass}`}>
          <div className="flex items-center">
            <FaInfoCircle className="mr-1" />
            <span>Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </header>

      <main className="grid gap-6">
        <section>
          <h2 className="sr-only">Saldo do Cartão</h2>
          <SaldoCard />
        </section>
        
        <section className={`${bgCardClass} p-6 rounded-lg shadow transition-colors`}>
          <h2 className={`text-lg font-semibold ${textPrimaryClass} mb-4`}>Informações sobre seu saldo</h2>
          
          <div className={`space-y-4 ${textSecondaryClass}`}>
            <p>
              O saldo apresentado é baseado no limite disponível para o mês atual.
              O cálculo é feito subtraindo os gastos do período do seu limite total.
            </p>
            
            <article className={`p-3 ${alertBgClass} rounded-md border ${borderClass}`}>
              <h3 className={`font-medium ${alertTextClass}`}>Atenção</h3>
              <p className={`text-sm ${alertTextClass}`}>
                Algumas transações podem levar até 24 horas para serem processadas. 
                Para obter informações atualizadas, utilize o botão de atualização.
              </p>
            </article>
            
            <p>
              Se você tiver dúvidas sobre seus gastos, consulte a seção de &ldquo;Extrato&rdquo; 
              para ver detalhes de todas as suas transações.
            </p>
          </div>
        </section>
        
        <section className={`${bgCardClass} p-6 rounded-lg shadow transition-colors`}>
          <h2 className={`text-lg font-semibold ${textPrimaryClass} mb-4 flex items-center`}>
            <FaLightbulb className="mr-2 text-yellow-500" />
            Dicas de Uso
          </h2>
          
          <div className={`space-y-4 ${textSecondaryClass}`}>
            <p>
              Acompanhe regularmente seu saldo para melhor gerenciar seus gastos mensais.
              Configure lembretes para verificar seu saldo antes de realizar compras maiores.
            </p>
            
            <article className={`p-3 ${tipsBgClass} rounded-md border ${tipsBorderClass}`}>
              <h3 className={`font-medium ${tipsTextClass}`}>Planejamento financeiro</h3>
              <ul className={`text-sm ${tipsTextClass} mt-2 list-disc pl-5 space-y-1`}>
                <li>Defina um valor máximo para gastos semanais</li>
                <li>Reserve parte do limite para emergências</li>
                <li>Priorize compras essenciais no início do mês</li>
                <li>Acompanhe o extrato regularmente para identificar padrões de gastos</li>
              </ul>
            </article>
            
            <p>
              Para uma experiência ideal, mantenha seu cadastro sempre atualizado e 
              comunique ao suporte qualquer divergência identificada em sua fatura.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
} 