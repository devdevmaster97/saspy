'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';
import { useTheme } from '@/app/contexts/ThemeContext';

interface Convenio {
  codigo: string;
  razaosocial: string;
  nomefantasia: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
  telefone: string;
  cel: string;
  latitude: string;
  longitude: string;
  email: string;
  nome_categoria: string;
  codigo_categoria: string;
  destaque?: boolean;
}

type OrdenacaoTipo = 'recentes' | 'alfabetica' | 'destaque';

export default function ConveniosContent() {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoTipo>('alfabetica');
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Buscar convênios
  const fetchConvenios = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/convenios');

      if (Array.isArray(response.data)) {
        setConvenios(response.data);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.error('Erro ao buscar convênios:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(`Não foi possível carregar os convênios: ${error.response.data.error || error.message}`);
      } else {
        setError('Não foi possível carregar os convênios. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConvenios();
  }, []);

  // Ordenar convênios
  const ordenarConvenios = (convenios: Convenio[]) => {
    switch (ordenacao) {
      case 'recentes':
        return [...convenios].reverse();
      case 'alfabetica':
        return [...convenios].sort((a, b) => a.nomefantasia.localeCompare(b.nomefantasia));
      case 'destaque':
        return [...convenios].sort((a, b) => {
          if (a.destaque && !b.destaque) return -1;
          if (!a.destaque && b.destaque) return 1;
          return a.nomefantasia.localeCompare(b.nomefantasia);
        });
      default:
        return convenios;
    }
  };

  // Filtrar e agrupar convênios
  const conveniosFiltradosEAgrupados = () => {
    let filtrados = convenios;

    // Aplicar busca
    if (searchTerm) {
      filtrados = filtrados.filter(conv => 
        conv.nomefantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.razaosocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.nome_categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    filtrados = ordenarConvenios(filtrados);

    // Agrupar por categoria
    return filtrados.reduce((acc, conv) => {
      if (!acc[conv.nome_categoria]) {
        acc[conv.nome_categoria] = [];
      }
      acc[conv.nome_categoria].push(conv);
      return acc;
    }, {} as Record<string, Convenio[]>);
  };

  if (!isMounted) {
    return null;
  }

  // Classes para temas
  const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const hoverBgClass = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const headerBgClass = theme === 'dark' ? 'bg-blue-800' : 'bg-blue-600';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-300';
  const divideBorderClass = theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200';
  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const iconClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-400';
  const inputBgClass = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const inputBorderClass = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const inputFocusClass = theme === 'dark' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500';
  const selectBgClass = theme === 'dark' ? 'bg-gray-700' : 'bg-white';
  const selectTextClass = theme === 'dark' ? 'text-white' : 'text-gray-900';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchConvenios}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const conveniosAgrupados = conveniosFiltradosEAgrupados();

  return (
    <div className="space-y-6">
      {/* Barra de Pesquisa e Ordenação */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${iconClass}`} />
          <input
            type="text"
            placeholder="Buscar convênios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border ${inputBorderClass} rounded-lg focus:outline-none ${inputFocusClass} ${inputBgClass} ${textPrimaryClass}`}
          />
        </div>
        <select
          value={ordenacao}
          onChange={(e) => setOrdenacao(e.target.value as OrdenacaoTipo)}
          className={`px-4 py-2 border ${inputBorderClass} rounded-lg focus:outline-none ${inputFocusClass} ${selectBgClass} ${selectTextClass}`}
        >
          <option value="alfabetica">Ordem Alfabética</option>
          <option value="recentes">Mais Recentes</option>
          <option value="destaque">Em Destaque</option>
        </select>
      </div>

      {/* Lista de Convênios Agrupados */}
      <div className="space-y-8">
        {Object.entries(conveniosAgrupados).map(([categoria, convenios]) => (
          <div key={categoria} className={`${bgClass} rounded-lg shadow overflow-hidden`}>
            <div className={`p-4 ${headerBgClass}`}>
              <h2 className="text-xl font-bold text-white">{categoria}</h2>
            </div>
            <div className={`divide-y ${divideBorderClass}`}>
              {convenios.map((convenio) => (
                <div key={convenio.codigo} className={`p-4 ${hoverBgClass}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-lg font-semibold ${textPrimaryClass}`}>
                        {convenio.nomefantasia}
                      </h3>
                      <p className={`text-sm ${textSecondaryClass}`}>{convenio.razaosocial}</p>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className={`flex items-center ${textSecondaryClass}`}>
                      <FaMapMarkerAlt className="mr-2" />
                      {convenio.endereco}, {convenio.numero} - {convenio.bairro}, {convenio.cidade} - {convenio.cep}
                    </p>
                    {(convenio.telefone || convenio.cel) && (
                      <p className={`flex items-center ${textSecondaryClass}`}>
                        <FaPhone className="mr-2" />
                        {convenio.telefone} {convenio.cel && `/ ${convenio.cel}`}
                      </p>
                    )}
                    {convenio.email && (
                      <p className={`flex items-center ${textSecondaryClass}`}>
                        <FaEnvelope className="mr-2" />
                        {convenio.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 