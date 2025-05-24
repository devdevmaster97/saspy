'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimes, FaBarcode, FaBuilding, FaIdCard } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '@/app/utils/constants';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaEnvelope, FaPhone, FaHome, FaCity, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { useTranslations } from '@/app/contexts/LanguageContext';

interface Estado {
  sigla: string;
  nome: string;
}

interface Cidade {
  id: string;
  nome: string;
}

interface Empregador {
  id: string;
  nome: string;
}
//teste
export default function CadastroForm() {
  const router = useRouter();
  const translations = useTranslations('AssociateRegistration');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    celular: '',
    telefoneResidencial: '',
    rg: '',
    dataNascimento: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    C_codigo_assoc: '',
    C_empregador_assoc: '',
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
  const [cepLoading, setCepLoading] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [empregadores, setEmpregadores] = useState<Empregador[]>([]);
  const [carregandoEmpregadores, setCarregandoEmpregadores] = useState(false);
  const [empregadorSearch, setEmpregadorSearch] = useState('');
  const [showEmpregadorDropdown, setShowEmpregadorDropdown] = useState(false);

  useEffect(() => {
    // Carregar estados quando o componente montar
    const fetchEstados = async () => {
      try {
        const response = await fetch('/api/convenio/estados');
        const data = await response.json();
        if (data.success) {
          setEstados(data.data);
        }
      } catch (error) {
        console.error(translations.error_loading_states || 'Erro ao buscar estados:', error);
        toast.error(translations.error_loading_states || 'Erro ao buscar estados');
      }
    };

    fetchEstados();
  }, [translations]);

  useEffect(() => {
    // Carregar cidades quando o estado mudar
    const fetchCidades = async () => {
      if (formData.uf) {
        try {
          const response = await fetch(`/api/convenio/cidades?uf=${formData.uf}`);
          const data = await response.json();
          if (data.success) {
            setCidades(data.data);
          }
        } catch (error) {
          console.error(translations.error_loading_cities || 'Erro ao buscar cidades:', error);
          toast.error(translations.error_loading_cities || 'Erro ao buscar cidades');
        }
      } else {
        setCidades([]);
      }
    };

    fetchCidades();
  }, [formData.uf, translations]);

  useEffect(() => {
    // Buscar lista de empregadores ao carregar o componente
    buscarEmpregadores();
  }, []);

  // Função para buscar a lista de empregadores
  const buscarEmpregadores = async () => {
    setCarregandoEmpregadores(true);
    try {
      const response = await axios.get('/api/empregadores');
      
      // Diferentes possíveis estruturas de resposta da API
      if (response.data && Array.isArray(response.data)) {
        setEmpregadores(response.data);
      } else if (response.data && response.data.empregadores && Array.isArray(response.data.empregadores)) {
        setEmpregadores(response.data.empregadores);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setEmpregadores(response.data.data);
      } else if (response.data && typeof response.data === 'object') {
        try {
          const empregadoresArray = Object.entries(response.data).map(([id, nome]) => ({
            id,
            nome: typeof nome === 'string' ? nome : String(nome)
          }));
          
          if (empregadoresArray.length > 0) {
            setEmpregadores(empregadoresArray);
          } else {
            throw new Error('Array de empregadores vazio');
          }
        } catch (parseError) {
          console.error('Erro ao processar objeto de empregadores:', parseError);
          toast.error(translations.invalid_data_format || 'Formato de dados inválido');
        }
      } else {
        console.error('Formato de resposta inválido:', response.data);
        toast.error(translations.error_loading_employers || 'Erro ao carregar a lista de empregadores');
      }
    } catch (error) {
      console.error('Erro ao buscar empregadores:', error);
      toast.error(translations.error_loading_employers || 'Não foi possível carregar a lista de empregadores');
    } finally {
      setCarregandoEmpregadores(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let finalValue = value;
    
    // Formatação para campos específicos
    if (name === 'celular' || name === 'telefoneResidencial') {
      // Remove caracteres não numéricos
      finalValue = value.replace(/\D/g, '');
      // Limita a 11 dígitos (com DDD)
      finalValue = finalValue.substring(0, 11);
    } else if (name === 'cep') {
      // Remove caracteres não numéricos
      finalValue = value.replace(/\D/g, '');
      // Limita a 4 dígitos (código postal paraguaio)
      finalValue = finalValue.substring(0, 4);
      
      // Se tiver 4 dígitos, busca o código postal
      if (finalValue.length === 4 && finalValue !== formData.cep) {
        setTimeout(() => {
          buscarCep(finalValue);
        }, 500);
      }
    }
    
    // Atualizar estado
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : finalValue,
    });
  };

  // Efeito adicional para lidar com a mudança de UF e carregamento de cidades
  useEffect(() => {
    if (formData.uf) {
      // Indicar visualmente que estamos carregando
      setCidades([]);
      
      console.log(`Iniciando carregamento de cidades para UF: ${formData.uf}`);
      
      // Forçar carregamento de cidades
      const carregarCidades = async () => {
        try {
          const url = `/api/convenio/cidades?uf=${formData.uf}`;
          console.log('Fazendo requisição para:', url);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
          
          console.log('Status da resposta:', response.status);
          
          if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Dados recebidos:', data);
          
          if (data.success && Array.isArray(data.data)) {
            console.log(`Cidades carregadas para UF ${formData.uf}:`, data.data.length);
            setCidades(data.data || []);
            
            // Se recebemos dados vazios, mas com success true
            if (data.data.length === 0) {
              console.warn('Lista de cidades vazia recebida do servidor');
            }
          } else {
            console.error('Formato de resposta inválido ou erro reportado:', data);
            setCidades([]);
            
            // Tentar um fallback para browser mobile que pode ter problemas com CORS
            fetchCidadesFallback(formData.uf);
          }
        } catch (error) {
          console.error('Erro ao buscar cidades:', error);
          setCidades([]);
          
          // Tentar um fallback
          fetchCidadesFallback(formData.uf);
        }
      };
      
      // Método alternativo para dispositivos móveis que podem ter problemas
      const fetchCidadesFallback = async (uf: string) => {
        console.log('Tentando método alternativo para carregar cidades...');
        try {
          // Lista de cidades para os estados mais comuns (fallback)
          const cidadesPorUF: Record<string, any[]> = {
            SP: [
              { id: '1', nome: 'São Paulo' },
              { id: '2', nome: 'Campinas' },
              { id: '3', nome: 'Santos' },
              { id: '4', nome: 'Ribeirão Preto' },
              { id: '5', nome: 'São José dos Campos' },
              // Adicione mais cidades conforme necessário
            ],
            RJ: [
              { id: '1', nome: 'Rio de Janeiro' },
              { id: '2', nome: 'Niterói' },
              { id: '3', nome: 'Duque de Caxias' },
              { id: '4', nome: 'Nova Iguaçu' },
              // Adicione mais cidades conforme necessário
            ],
            MG: [
              { id: '1', nome: 'Belo Horizonte' },
              { id: '2', nome: 'Uberlândia' },
              { id: '3', nome: 'Contagem' },
              { id: '4', nome: 'Juiz de Fora' },
              // Adicione mais cidades conforme necessário
            ],
            // Adicione mais estados conforme necessário
          };
          
          // Se temos um fallback para este estado, use-o
          if (cidadesPorUF[uf]) {
            console.log(`Usando lista de fallback para ${uf}`);
            setCidades(cidadesPorUF[uf]);
          } else {
            // Tentar buscar do IBGE diretamente
            const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`;
            console.log('Tentando IBGE diretamente:', url);
            
            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();
              const cidadesProcessadas = data.map((c: any) => ({
                id: c.id,
                nome: c.nome
              })).sort((a: any, b: any) => a.nome.localeCompare(b.nome));
              
              console.log(`Recebidas ${cidadesProcessadas.length} cidades do IBGE diretamente`);
              setCidades(cidadesProcessadas);
            }
          }
        } catch (fallbackError) {
          console.error('Erro no método alternativo:', fallbackError);
        }
      };
      
      carregarCidades();
    } else {
      setCidades([]);
    }
  }, [formData.uf]);

  // Função para buscar informações do CEP
  const buscarCep = async (cep: string) => {
    // Código postal do Paraguai tem 4 dígitos
    if (cep.length === 4) {
      setCepLoading(true);
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

        const dadosCep = codigosParaguai[cep];
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
        console.error('Erro ao buscar código postal:', error);
        toast.error('Erro ao buscar código postal');
      } finally {
        setCepLoading(false);
      }
    }
  };

  // Função para buscar CEP manualmente pelo botão
  const handleBuscarCep = () => {
    if (formData.cep.length === 4) {
      buscarCep(formData.cep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setStatusType('');

    try {
      // Validações básicas
      if (!formData.nome || !formData.email || !formData.celular) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      if (formData.celular.length !== 11) {
        throw new Error('Celular deve conter 11 dígitos');
      }

      // Formatar data de nascimento se fornecida (YYYY-MM-DD para DD/MM/YYYY)
      let dataNascimentoFormatada = '';
      if (formData.dataNascimento) {
        const parts = formData.dataNascimento.split('-');
        if (parts.length === 3) {
          dataNascimentoFormatada = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }

      // Preparar dados para API
      const cadastroData = new FormData();
      
      // Campos obrigatórios para a API
      cadastroData.append('operation', 'Add'); // Operação de inclusão
      
      // Dados pessoais
      cadastroData.append('C_codigo_assoc', formData.C_codigo_assoc);
      cadastroData.append('C_nome_assoc', formData.nome);
      cadastroData.append('C_rg_assoc', formData.rg);
      if (dataNascimentoFormatada) {
        cadastroData.append('C_nascimento', dataNascimentoFormatada);
      }
      
      // Empregador
      if (formData.C_empregador_assoc) {
        cadastroData.append('C_empregador_assoc', formData.C_empregador_assoc);
      }
      
      // Contato
      cadastroData.append('C_Email_assoc', formData.email);
      cadastroData.append('C_cel_assoc', formData.celular);
      cadastroData.append('C_telres', formData.telefoneResidencial);
      
      // Endereço
      cadastroData.append('C_cep_assoc', formData.cep);
      cadastroData.append('C_endereco_assoc', formData.endereco);
      cadastroData.append('C_numero_assoc', formData.numero);
      cadastroData.append('C_complemento_assoc', formData.complemento);
      cadastroData.append('C_bairro_assoc', formData.bairro);
      cadastroData.append('C_cidade_assoc', formData.cidade);
      cadastroData.append('C_uf_assoc', formData.uf);
      
      // Campos complementares com valores padrão
      cadastroData.append('C_obs', 'CADASTRO REALIZADO PELO PRÓPRIO ASSOCIADO VIA APLICATIVO WEB');
      
      // Data atual para data de filiação
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      cadastroData.append('C_datacadastro_assoc', formattedDate);

      // Enviar para a API
      console.log('Enviando dados para cadastro:', Object.fromEntries(cadastroData));
      
      const response = await fetch('/api/associado-cadastro', {
        method: 'POST',
        body: cadastroData
      });

      const result = await response.json();
      console.log('Resposta da API:', result);

      if (result.success) {
        setStatusType('success');
        // Mostrar o modal de sucesso
        setShowSuccessModal(true);
        
        // Limpar formulário
        setFormData({
          nome: '',
          email: '',
          celular: '',
          telefoneResidencial: '',
          rg: '',
          dataNascimento: '',
          cep: '',
          endereco: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          uf: '',
          C_codigo_assoc: '',
          C_empregador_assoc: '',
        });
        
        // Redirecionar para a página de assinatura digital após alguns segundos
        setTimeout(() => {
          window.location.href = 'https://app.zapsign.com.br/verificar/doc/31ef234f-66c4-4ca4-8298-b504b15e90a3';
        }, 5000);
      } else {
        setStatusMessage(result.message || 'Ocorreu um erro ao processar o cadastro. Tente novamente.');
        setStatusType('error');
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setStatusMessage(err.message || 'Ocorreu um erro ao processar o cadastro.');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  // Formatar telefone para exibição
  const formatTelefone = (telefone: string) => {
    if (!telefone) return '';
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  const handleEmpregadorSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmpregadorSearch(e.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 mb-4">
        <div className="flex items-center mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mr-3">
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-center text-gray-800">{translations.page_title || 'Cadastro de Associado'}</h1>
        </div>

        {statusMessage && statusType === 'error' && (
          <div className="mb-6 p-4 rounded-md bg-red-100 text-red-800">
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              <span>{statusMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados pessoais */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">{translations.name_label || 'Dados Pessoais'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                
                  <label
                    htmlFor="C_codigo_assoc"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {translations.employer_code_label || 'Código ou matricula do funcionário'}
                  </label>
                  <input
                    type="text"
                    id="C_codigo_assoc"
                    name="C_codigo_assoc"
                    value={formData.C_codigo_assoc}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                    placeholder={translations.employer_code_placeholder || 'Digite o código'}
                  />
              
              </div>
              
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.name_label || 'Nome Completo'} *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={translations.name_placeholder || 'Seu nome completo'}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="C_empregador_assoc" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.employer_label || 'Empregador'}
                </label>
                <select
                  id="C_empregador_assoc"
                  name="C_empregador_assoc"
                  value={formData.C_empregador_assoc}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                  disabled={loading || carregandoEmpregadores}
                >
                  <option value="">{translations.employer_placeholder || 'Selecione um empregador'}</option>
                  {empregadores.map((empregador) => (
                    <option key={empregador.id} value={empregador.id}>
                      {empregador.nome}
                    </option>
                  ))}
                </select>
                {carregandoEmpregadores && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <FaSpinner className="animate-spin mr-1" /> 
                    {translations.loading_button || 'Carregando'}...
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="rg" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.rg_label || 'C.I.'}
                </label>
                <input
                  type="text"
                  id="rg"
                  name="rg"
                  value={formData.rg}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={translations.rg_placeholder || 'Número do C.I.'}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.birthdate_label || 'Data de Nascimento'}
                </label>
                <input
                  type="date"
                  id="dataNascimento"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">{translations.email_label || 'Informações de Contato'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.email_label || 'E-mail'} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={translations.email_placeholder || 'seu@email.com'}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="celular" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.cellphone_label || 'Celular'} *
                </label>
                <input
                  type="text"
                  id="celular"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={translations.cellphone_placeholder || 'DDD + número'}
                  disabled={loading}
                  required
                />
                {formData.celular && (
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: {formatTelefone(formData.celular)}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="telefoneResidencial" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.phone_label || 'Telefone Residencial'}
                </label>
                <input
                  type="text"
                  id="telefoneResidencial"
                  name="telefoneResidencial"
                  value={formData.telefoneResidencial}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={translations.phone_placeholder || 'DDD + número'}
                  disabled={loading}
                />
                {formData.telefoneResidencial && (
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: {formatTelefone(formData.telefoneResidencial)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">{translations.address_label || 'Endereço'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.zipcode_label || 'Código Postal'}
                </label>
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    maxLength={4}
                    className="block w-full border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0000"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleBuscarCep}
                    disabled={formData.cep.length !== 4 || cepLoading}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cepLoading ? (
                      <FaSpinner className="animate-spin h-4 w-4" />
                    ) : (
                      'Buscar'
                    )}
                  </button>
                </div>
                {cepLoading && <p className="text-xs text-blue-600 mt-1 flex items-center"><FaSpinner className="animate-spin mr-1" /> Buscando código postal...</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.address_label || 'Endereço'}
                </label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={translations.address_placeholder || 'Rua, Avenida, etc.'}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.number_label || 'Número'}
                </label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={translations.number_placeholder || 'Número'}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.complement_label || 'Complemento'}
                </label>
                <input
                  type="text"
                  id="complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={translations.complement_placeholder || 'Apto, Bloco, etc.'}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.neighborhood_label || 'Bairro'}
                </label>
                <input
                  type="text"
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={translations.neighborhood_placeholder || 'Bairro'}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="uf" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.state_label || 'Estado'}
                </label>
                <select
                  id="uf"
                  name="uf"
                  value={formData.uf}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">{translations.state_placeholder || 'Selecione um estado'}</option>
                  {estados.map((estado) => (
                    <option key={estado.sigla} value={estado.sigla}>
                      {estado.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.city_label || 'Cidade'}
                </label>
                <select
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || !formData.uf}
                >
                  <option value="">{translations.city_placeholder || 'Selecione uma cidade'}</option>
                  {cidades && cidades.length > 0 ? (
                    cidades.map((cidade) => (
                      <option key={cidade.id} value={cidade.nome}>
                        {cidade.nome}
                      </option>
                    ))
                  ) : formData.uf ? (
                    <option value="">{translations.loading_button || 'Carregando'}...</option>
                  ) : null}
                </select>
                {formData.uf && cidades.length === 0 && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <FaSpinner className="animate-spin mr-1" /> 
                    {translations.loading_button || 'Carregando'}...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-between gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
            >
              {translations.back_button || 'Voltar para Login'}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  {translations.loading_button || 'Processando...'}
                </span>
              ) : (
                translations.submit_button || 'Cadastrar'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-600">{translations.success_modal_title || 'Cadastro Realizado'}</h3>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-6 flex flex-col items-center text-center">
              <FaCheckCircle className="text-green-500 text-5xl mb-4" />
              <p className="text-gray-800 text-lg">
                {translations.success_modal_title || 'Cadastro realizado com sucesso!'}
              </p>
              <p className="text-gray-600 mt-2">
                {translations.success_modal_message || 'Você será redirecionado para confirmar a assinatura digital para desbloqueio do cartão convênio.'}
              </p>
              <div className="mt-4 text-sm text-gray-500">
                Redirecionando em 5 segundos...
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => {
                  window.location.href = 'https://app.zapsign.com.br/verificar/doc/31ef234f-66c4-4ca4-8298-b504b15e90a3';
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline"
              >
                {translations.success_modal_button || 'Ir para assinatura digital'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 