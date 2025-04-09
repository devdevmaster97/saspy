'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '@/app/utils/constants';

interface Estado {
  sigla: string;
  nome: string;
}

interface Cidade {
  id: string;
  nome: string;
}

export default function CadastroForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
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
    whatsapp: false,
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
  const [cepLoading, setCepLoading] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);

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
        console.error('Erro ao buscar estados:', error);
      }
    };

    fetchEstados();
  }, []);

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
          console.error('Erro ao buscar cidades:', error);
        }
      } else {
        setCidades([]);
      }
    };

    fetchCidades();
  }, [formData.uf]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let finalValue = value;
    
    // Formatação para campos específicos
    if (name === 'cpf') {
      // Remove caracteres não numéricos
      finalValue = value.replace(/\D/g, '');
      // Limita a 11 dígitos
      finalValue = finalValue.substring(0, 11);
    } else if (name === 'celular' || name === 'telefoneResidencial') {
      // Remove caracteres não numéricos
      finalValue = value.replace(/\D/g, '');
      // Limita a 11 dígitos (com DDD)
      finalValue = finalValue.substring(0, 11);
    } else if (name === 'cep') {
      // Remove caracteres não numéricos
      finalValue = value.replace(/\D/g, '');
      // Limita a 8 dígitos
      finalValue = finalValue.substring(0, 8);
      
      // Se tiver 8 dígitos, busca o CEP
      if (finalValue.length === 8 && finalValue !== formData.cep) {
        buscarCep(finalValue);
      }
    }
    
    // Caso especial para o campo UF - resetar cidade
    if (name === 'uf') {
      setFormData({
        ...formData,
        uf: finalValue,
        cidade: ''
      });
    } else {
      // Atualizar estado
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : finalValue,
      });
    }
  };

  // Função para buscar informações do CEP
  const buscarCep = async (cep: string) => {
    if (cep.length !== 8) return;
    
    setCepLoading(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (!response.data.erro) {
        setFormData(prev => ({
          ...prev,
          endereco: response.data.logradouro || prev.endereco,
          bairro: response.data.bairro || prev.bairro,
          cidade: response.data.localidade || prev.cidade,
          uf: response.data.uf || prev.uf
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setStatusType('');

    try {
      // Validações básicas
      if (!formData.nome || !formData.cpf || !formData.email || !formData.celular) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      if (formData.cpf.length !== 11) {
        throw new Error('CPF deve conter 11 dígitos');
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
      cadastroData.append('C_nome_assoc', formData.nome);
      cadastroData.append('C_cpf_assoc', formData.cpf);
      cadastroData.append('C_rg_assoc', formData.rg);
      if (dataNascimentoFormatada) {
        cadastroData.append('C_nascimento', dataNascimentoFormatada);
      }
      
      // Contato
      cadastroData.append('C_Email_assoc', formData.email);
      cadastroData.append('C_cel_assoc', formData.celular);
      cadastroData.append('C_telres', formData.telefoneResidencial);
      cadastroData.append('SwitchCelular', formData.whatsapp ? 'true' : 'false');
      
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
        setStatusMessage('Cadastro realizado com sucesso! Você será redirecionado para confirmar a assinatura digital para desbloqueio do cartão convênio.');
        setStatusType('success');
        
        // Limpar formulário
        setFormData({
          nome: '',
          cpf: '',
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
          whatsapp: false,
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

  // Formatar CPF para exibição
  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Formatar telefone para exibição
  const formatTelefone = (telefone: string) => {
    if (!telefone) return '';
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 mb-4">
        <div className="flex items-center mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mr-3">
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-center text-gray-800">Cadastro de Associado</h1>
        </div>

        {statusMessage && (
          <div className={`mb-6 p-4 rounded-md ${
            statusType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className="flex items-center">
              {statusType === 'success' ? (
                <FaCheckCircle className="mr-2" />
              ) : (
                <FaExclamationTriangle className="mr-2" />
              )}
              <span>{statusMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados pessoais */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Seu nome completo"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apenas números"
                  disabled={loading}
                  required
                />
                {formData.cpf && (
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: {formatCPF(formData.cpf)}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="rg" className="block text-sm font-medium text-gray-700 mb-1">
                  RG
                </label>
                <input
                  type="text"
                  id="rg"
                  name="rg"
                  value={formData.rg}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Número do RG"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento
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
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Informações de Contato</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="seu@email.com"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="celular" className="block text-sm font-medium text-gray-700 mb-1">
                  Celular *
                </label>
                <input
                  type="text"
                  id="celular"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="DDD + número"
                  disabled={loading}
                  required
                />
                {formData.celular && (
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: {formatTelefone(formData.celular)}
                  </p>
                )}
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      id="whatsapp"
                      name="whatsapp"
                      checked={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm text-gray-600">Este celular tem WhatsApp</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="telefoneResidencial" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone Residencial
                </label>
                <input
                  type="text"
                  id="telefoneResidencial"
                  name="telefoneResidencial"
                  value={formData.telefoneResidencial}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="DDD + número"
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
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apenas números"
                  disabled={loading}
                />
                {cepLoading && <p className="text-xs text-blue-600 mt-1 flex items-center"><FaSpinner className="animate-spin mr-1" /> Buscando CEP...</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Rua, Avenida, etc."
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Número"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  id="complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apto, Bloco, etc."
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Bairro"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="uf" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="uf"
                  name="uf"
                  value={formData.uf}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Selecione um estado</option>
                  {estados.map((estado) => (
                    <option key={estado.sigla} value={estado.sigla}>
                      {estado.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <select
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || !formData.uf}
                >
                  <option value="">Selecione uma cidade</option>
                  {cidades.map((cidade) => (
                    <option key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-between gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
            >
              Voltar para Login
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Processando...
                </span>
              ) : (
                'Cadastrar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 