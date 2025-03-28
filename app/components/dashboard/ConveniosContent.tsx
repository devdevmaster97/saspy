'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';

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
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar convênios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={ordenacao}
          onChange={(e) => setOrdenacao(e.target.value as OrdenacaoTipo)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="alfabetica">Ordem Alfabética</option>
          <option value="recentes">Mais Recentes</option>
          <option value="destaque">Em Destaque</option>
        </select>
      </div>

      {/* Lista de Convênios Agrupados */}
      <div className="space-y-8">
        {Object.entries(conveniosAgrupados).map(([categoria, convenios]) => (
          <div key={categoria} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-blue-600 p-4">
              <h2 className="text-xl font-bold text-white">{categoria}</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {convenios.map((convenio) => (
                <div key={convenio.codigo} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {convenio.nomefantasia}
                      </h3>
                      <p className="text-sm text-gray-600">{convenio.razaosocial}</p>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p className="flex items-center">
                      <FaMapMarkerAlt className="mr-2" />
                      {convenio.endereco}, {convenio.numero} - {convenio.bairro}, {convenio.cidade} - {convenio.cep}
                    </p>
                    {(convenio.telefone || convenio.cel) && (
                      <p className="flex items-center">
                        <FaPhone className="mr-2" />
                        {convenio.telefone} {convenio.cel && `/ ${convenio.cel}`}
                      </p>
                    )}
                    {convenio.email && (
                      <p className="flex items-center">
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