'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaArrowLeft, FaUser, FaUserPlus } from 'react-icons/fa6';

export default function ConvenioInicialContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleVoltar = () => {
    router.push('/dashboard');
  };

  const handleLogin = () => {
    setLoading(true);
    router.push('/convenio/login');
  };

  const handleCadastro = () => {
    setLoading(true);
    router.push('/convenio/cadastro');
  };

  return (
    <div className="space-y-6">
      {/* Botão Voltar */}
      <button
        onClick={handleVoltar}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        disabled={loading}
      >
        <FaArrowLeft className="mr-2" />
        Voltar
      </button>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Área do Convênio</h2>
        <p className="text-gray-600 mb-8">Escolha uma opção para continuar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-blue-500 group"
        >
          <FaUser className="w-16 h-16 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Já sou cadastrado</h3>
          <p className="text-gray-600 text-center">Acesse sua conta existente</p>
        </button>

        <button
          onClick={handleCadastro}
          disabled={loading}
          className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-blue-500 group"
        >
          <FaUserPlus className="w-16 h-16 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Não sou cadastrado</h3>
          <p className="text-gray-600 text-center">Crie uma nova conta</p>
        </button>
      </div>
    </div>
  );
} 