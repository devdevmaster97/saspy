'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import Header from '@/app/components/Header';
import { useTranslations } from '@/app/contexts/LanguageContext';

interface Categoria {
  codigo: string;
  nome: string;
}

interface Estado {
  sigla: string;
  nome: string;
}

interface Cidade {
  id: string;
  nome: string;
}

export default function CadastroConvenio() {
  const t = useTranslations('ConvenioCadastro');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [formData, setFormData] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    telefone: '',
    celular: '',
    email: '',
    responsavel: '',
    categoria: '',
    ruc: ''
  });

  const handleVoltar = () => {
    router.push('/convenio/login');
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('/api/convenio/categorias');
        const data = await response.json();
        if (data.success) {
          setCategorias(data.data);
        }
      } catch (error) {
        console.error(t.error_loading_categories, error);
      }
    };

    const fetchEstados = async () => {
      try {
        const response = await fetch('/api/convenio/estados');
        const data = await response.json();
        if (data.success) {
          setEstados(data.data);
        }
      } catch (error) {
        console.error(t.error_loading_states, error);
      }
    };

    fetchCategorias();
    fetchEstados();
  }, []);

  useEffect(() => {
    const fetchCidades = async () => {
      if (formData.uf) {
        try {
          const response = await fetch(`/api/convenio/cidades?uf=${formData.uf}`);
          const data = await response.json();
          if (data.success) {
            setCidades(data.data);
          }
        } catch (error) {
          console.error(t.error_loading_cities, error);
        }
      }
    };

    fetchCidades();
  }, [formData.uf]);

  const handleBuscarCep = async () => {
    // Código postal do Paraguai tem 4 dígitos
    if (formData.cep.length === 4) {
      try {
        // Base de dados de códigos postais do Paraguai para teste
        const codigosParaguai: { [key: string]: any } = {
          '1001': { // Asunción Centro
            cidade: 'Asunción',
            uf: 'AS',
            bairro: 'Centro'
          },
          '1209': { // San Roque, Asunción
            cidade: 'Asunción',
            uf: 'AS',
            bairro: 'San Roque'
          },
          '1425': { // Recoleta, Asunción
            cidade: 'Asunción',
            uf: 'AS',
            bairro: 'Recoleta'
          },
          '1536': { // Villa Morra, Asunción
            cidade: 'Asunción',
            uf: 'AS',
            bairro: 'Villa Morra'
          },
          '2160': { // San Lorenzo
            cidade: 'San Lorenzo',
            uf: 'CN',
            bairro: 'Centro'
          },
          '2300': { // Luque
            cidade: 'Luque',
            uf: 'CN',
            bairro: 'Centro'
          },
          '2640': { // Lambaré
            cidade: 'Lambaré',
            uf: 'CN',
            bairro: 'Centro'
          },
          '2740': { // Fernando de la Mora
            cidade: 'Fernando de la Mora',
            uf: 'CN',
            bairro: 'Centro'
          },
          '7000': { // Ciudad del Este
            cidade: 'Ciudad del Este',
            uf: 'AP',
            bairro: 'Centro'
          },
          '7220': { // Hernandarias
            cidade: 'Hernandarias',
            uf: 'AP',
            bairro: 'Centro'
          },
          '6000': { // Encarnación
            cidade: 'Encarnación',
            uf: 'IT',
            bairro: 'Centro'
          }
        };

        const dadosCep = codigosParaguai[formData.cep];
        if (dadosCep) {
          setFormData(prev => ({
            ...prev,
            bairro: dadosCep.bairro,
            cidade: dadosCep.cidade,
            uf: dadosCep.uf
          }));
          toast.success('Código postal encontrado!');
        } else {
          toast.success('Código postal não encontrado em nossa base. Preencha os dados manualmente.');
        }
      } catch (error) {
        console.error(t.error_loading_cep, error);
        toast.error('Erro ao buscar código postal');
      }
    }
  };

  // Função para formatar código postal (máscara de 4 dígitos)
  const formatarCodigoPostal = (valor: string) => {
    // Remove tudo que não for dígito
    const apenasNumeros = valor.replace(/\D/g, '');
    // Limita a 4 dígitos
    return apenasNumeros.substring(0, 4);
  };

  // Função para lidar com mudanças nos campos com formatação
  const handleInputChange = (campo: string, valor: string) => {
    let valorFormatado = valor;

    if (campo === 'cep') {
      valorFormatado = formatarCodigoPostal(valor);
    } else if (campo === 'ruc') {
      // Remove caracteres não numéricos e limita o tamanho
      valorFormatado = valor.replace(/\D/g, '').substring(0, 11);
    }

    setFormData(prev => ({
      ...prev,
      [campo]: valorFormatado
    }));

    // Se é CEP e completou 4 dígitos, busca automaticamente
    if (campo === 'cep' && valorFormatado.length === 4) {
      setTimeout(() => {
        handleBuscarCep();
      }, 500);
    }
  };

  const validateForm = () => {
    const camposObrigatorios = [
      'razaoSocial',
      'nomeFantasia',
      'cep',
      'endereco',
      'numero',
      'bairro',
      'cidade',
      'uf',
      'celular',
      'email',
      'responsavel',
      'categoria'
    ];

    for (const campo of camposObrigatorios) {
      if (!formData[campo as keyof typeof formData]) {
        toast.error(t.field_required.replace('{field}', campo));
        return false;
      }
    }

    if (!formData.ruc) {
      toast.error(t.ruc_required);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const response = await fetch('/api/convenio/cadastro', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t.success_message);
        router.push('/convenio/login');
      } else {
        toast.error(data.message || t.error_message);
      }
    } catch {
      toast.error(t.generic_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title={t.page_title} showBackButton onBackClick={handleVoltar} />
      
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                {t.form_title}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados Principais */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="razaoSocial" className="block text-sm font-medium text-gray-700">
                      {t.company_name_label}
                    </label>
                    <input
                      type="text"
                      id="razaoSocial"
                      value={formData.razaoSocial}
                      onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="nomeFantasia" className="block text-sm font-medium text-gray-700">
                      {t.trade_name_label}
                    </label>
                    <input
                      type="text"
                      id="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="ruc" className="block text-sm font-medium text-gray-700">
                      {t.ruc_label}
                    </label>
                    <input
                      type="text"
                      id="ruc"
                      value={formData.ruc}
                      onChange={(e) => handleInputChange('ruc', e.target.value)}
                      placeholder="Solo números"
                      maxLength={11}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
                      {t.category_label}
                    </label>
                    <select
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">{t.category_placeholder}</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.codigo} value={categoria.codigo}>
                          {categoria.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Endereço */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="cep" className="block text-sm font-medium text-gray-700">
                      {t.cep_label}
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => handleInputChange('cep', e.target.value)}
                        placeholder="0000"
                        maxLength={4}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleBuscarCep}
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {t.search_button}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                      {t.address_label}
                    </label>
                    <input
                      type="text"
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
                      {t.number_label}
                    </label>
                    <input
                      type="text"
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="complemento" className="block text-sm font-medium text-gray-700">
                      {t.complement_label}
                    </label>
                    <input
                      type="text"
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
                      {t.neighborhood_label}
                    </label>
                    <input
                      type="text"
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="uf" className="block text-sm font-medium text-gray-700">
                      {t.state_label}
                    </label>
                    <select
                      id="uf"
                      value={formData.uf}
                      onChange={(e) => setFormData({ ...formData, uf: e.target.value, cidade: '' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">{t.state_placeholder}</option>
                      {estados.map((estado) => (
                        <option key={estado.sigla} value={estado.sigla}>
                          {estado.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
                      {t.city_label}
                    </label>
                    <select
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={!formData.uf}
                    >
                      <option value="">{t.city_placeholder}</option>
                      {cidades.map((cidade) => (
                        <option key={cidade.id} value={cidade.nome}>
                          {cidade.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contato */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                      {t.phone_label}
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="celular" className="block text-sm font-medium text-gray-700">
                      {t.mobile_label}
                    </label>
                    <input
                      type="tel"
                      id="celular"
                      value={formData.celular}
                      onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      {t.email_label}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700">
                      {t.responsible_label}
                    </label>
                    <input
                      type="text"
                      id="responsavel"
                      value={formData.responsavel}
                      onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="pt-5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin h-5 w-5" />
                    ) : (
                      t.submit_button
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 