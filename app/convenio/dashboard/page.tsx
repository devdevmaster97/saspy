'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaReceipt, FaChartLine, FaUser, FaFileAlt, FaUndo } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useTranslations } from '@/app/contexts/LanguageContext';

interface DashboardData {
  totalLancamentos: number;
  totalVendas: number;
  totalEstornos: number;
  totalAssociados: number;
}

export default function DashboardPage() {
  const translations = useTranslations('ConvenioDashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalLancamentos: 0,
    totalVendas: 0,
    totalEstornos: 0,
    totalAssociados: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/convenio/dashboard');
        const data = await response.json();

        if (data.success) {
          setDashboardData(data.data);
        } else {
          toast.error(data.message || translations.error_loading_dashboard || 'Erro ao carregar dados do dashboard');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        toast.error(translations.connection_error || 'Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [translations]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{translations.dashboard_title || 'Dashboard'}</h1>
        <p className="mt-1 text-sm text-gray-600">{translations.overview_subtitle || 'Visão geral do seu convênio'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card de Lançamentos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FaReceipt className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">{translations.total_lancamentos_label || 'Total de Lançamentos'}</h2>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.totalLancamentos}</p>
            </div>
          </div>
        </div>

        {/* Card de Vendas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FaChartLine className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">{translations.total_vendas_label || 'Total de Vendas'}</h2>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.totalVendas}</p>
            </div>
          </div>
        </div>

        {/* Card de Estornos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <FaChartLine className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">{translations.total_estornos_label || 'Total de Estornos'}</h2>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.totalEstornos}</p>
            </div>
          </div>
        </div>

        {/* Card de Associados */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FaUser className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">{translations.total_associados_label || 'Total de Associados'}</h2>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.totalAssociados}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Ações Rápidas */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{translations.quick_actions_title || 'Ações Rápidas'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/convenio/dashboard/lancamentos" className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition duration-150">
            <FaReceipt className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-gray-700">{translations.novo_lancamento_label || 'Novo Lançamento'}</span>
          </Link>
          <Link href="/convenio/dashboard/relatorios" className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition duration-150">
            <FaChartLine className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-gray-700">{translations.relatorio_vendas_label || 'Relatório de Vendas'}</span>
          </Link>
          <Link href="/convenio/dashboard/estornos" className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition duration-150">
            <FaUndo className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-gray-700">{translations.estornos_label || 'Estornos'}</span>
          </Link>
          <Link href="/convenio/dashboard/meus-dados" className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition duration-150">
            <FaUser className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-gray-700">{translations.meus_dados_label || 'Meus Dados'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 