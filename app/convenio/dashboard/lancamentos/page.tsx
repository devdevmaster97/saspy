'use client';

import { useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';

export default function LancamentosPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Lançamentos</h1>
          <button
            onClick={() => router.push('/convenio/dashboard/lancamentos/novo')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Novo Lançamento
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Para visualizar a listagem completa de lançamentos, acesse o menu Relatórios.
            </p>
            <button
              onClick={() => router.push('/convenio/dashboard/relatorios')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Ir para Relatórios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 