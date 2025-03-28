'use client';

import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa6';

export default function ConvenioPage() {
  const router = useRouter();

  const handleVoltar = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Botão Voltar */}
        <button
          onClick={handleVoltar}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <FaArrowLeft className="mr-2" />
          Voltar
        </button>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              Área do Convênio
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <button
                onClick={() => router.push('/convenio/login')}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Já sou cadastrado
              </button>

              <button
                onClick={() => router.push('/convenio/cadastro')}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Novo cadastro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 