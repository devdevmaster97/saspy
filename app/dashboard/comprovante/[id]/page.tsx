'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaCalendarAlt, FaStore, FaMoneyBillWave, FaShareAlt, FaArrowLeft, FaCreditCard, FaUser, FaReceipt } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTheme } from '@/app/contexts/ThemeContext';

interface LancamentoInfo {
  data: string;
  hora: string;
  valor: string;
  descricao: string;
  nome: string;
  matricula: string;
  cartao: string;
  parcela: string;
  mes: string;
  codigo: string;
}

export default function ComprovantePage() {
  const router = useRouter();
  const params = useParams();
  const [lancamento, setLancamento] = useState<LancamentoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Recuperar dados do localStorage baseado no ID
    if (params.id) {
      try {
        const lancamentoData = localStorage.getItem(`lancamento_${params.id}`);
        
        if (lancamentoData) {
          setLancamento(JSON.parse(lancamentoData));
        } else {
          console.error('Dados do lançamento não encontrados');
        }
      } catch (error) {
        console.error('Erro ao recuperar dados do lançamento:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [params.id]);

  // Função para voltar à página anterior
  const handleVoltar = () => {
    router.back();
  };

  // Função para compartilhar o comprovante
  const handleCompartilhar = () => {
    if (!lancamento) return;

    // Formatar valor monetário
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(lancamento.valor));

    // Formatar data
    let dataFormatada = lancamento.data;
    try {
      const dataParts = lancamento.data.split('/');
      if (dataParts.length === 3) {
        const dataObj = new Date(
          parseInt(dataParts[2]), 
          parseInt(dataParts[1]) - 1, 
          parseInt(dataParts[0])
        );
        dataFormatada = format(dataObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      }
    } catch (e) {
      console.error('Erro ao formatar data:', e);
    }

    // Texto do comprovante
    const texto = `
📝 COMPROVANTE DE LANÇAMENTO QR CRED

📅 Data: ${dataFormatada}
🕒 Hora: ${lancamento.hora}
🏪 Estabelecimento: ${lancamento.descricao}
💲 Valor: ${valorFormatado}
👤 Cliente: ${lancamento.nome}
💳 Cartão: ${lancamento.cartao}
📊 Parcela: ${lancamento.parcela}
🗓️ Referência: ${lancamento.mes}
🔢 Código: ${lancamento.codigo}

✅ QR Cred - Seu crédito na palma da mão
    `.trim();

    // Usar a API de compartilhamento se disponível, ou copiar para a área de transferência
    if (navigator.share) {
      navigator.share({
        title: 'Comprovante QR Cred',
        text: texto
      }).catch(error => {
        console.error('Erro ao compartilhar:', error);
        copyToClipboard(texto);
      });
    } else {
      copyToClipboard(texto);
    }
  };

  // Função para copiar para a área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Comprovante copiado para a área de transferência!');
      })
      .catch(err => {
        console.error('Falha ao copiar texto: ', err);
        // Fallback para navegadores que não suportam clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          alert('Comprovante copiado para a área de transferência!');
        } catch (err) {
          console.error('Falha ao copiar texto: ', err);
        }
        document.body.removeChild(textArea);
      });
  };

  if (!isMounted) {
    return null;
  }

  // Classes baseadas no tema
  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';
  const labelClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const highlightBgClass = theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50';
  const highlightBorderClass = theme === 'dark' ? 'border-blue-800' : 'border-blue-100';
  const highlightTextClass = theme === 'dark' ? 'text-blue-300' : 'text-blue-700';
  const secondaryHighlightClass = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const headerBgClass = theme === 'dark' ? 'bg-blue-800' : 'bg-blue-600';

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 transition-colors ${bgClass}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!lancamento) {
    return (
      <div className={`${cardBgClass} rounded-lg shadow-md p-6 text-center transition-colors`}>
        <div className="text-red-500 mb-4 text-xl">
          <FaReceipt className="inline-block mr-2" size={24} />
          Comprovante não encontrado
        </div>
        <p className={`${textSecondaryClass} mb-6`}>
          Não foi possível recuperar os dados deste lançamento.
        </p>
        <button 
          onClick={handleVoltar}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaArrowLeft className="inline-block mr-2" />
          Voltar ao Extrato
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-colors ${bgClass}`}>
      <header className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${textPrimaryClass}`}>Comprovante</h1>
        <button 
          onClick={handleVoltar}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <FaArrowLeft className="mr-2" />
          Voltar ao Extrato
        </button>
      </header>

      <main className={`${cardBgClass} rounded-lg shadow-md overflow-hidden transition-colors`}>
        <div className={`p-4 ${headerBgClass} text-white`}>
          <h2 className="text-xl font-bold flex items-center">
            <FaReceipt className="mr-2" />
            Comprovante de Lançamento
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Cartão com informações principais */}
          <div className={`${highlightBgClass} rounded-lg p-4 border ${highlightBorderClass} transition-colors`}>
            <div className="text-center mb-4">
              <div className={`text-2xl font-bold ${highlightTextClass}`}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(parseFloat(lancamento.valor))}
              </div>
              <div className={`${secondaryHighlightClass} font-medium`}>{lancamento.descricao}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start">
                <FaCalendarAlt className={`mt-1 mr-2 ${secondaryHighlightClass}`} />
                <div>
                  <div className={`text-sm ${labelClass}`}>Data</div>
                  <div className={`font-medium ${textPrimaryClass}`}>{lancamento.data}</div>
                </div>
              </div>
              <div className="flex items-start">
                <FaMoneyBillWave className={`mt-1 mr-2 ${secondaryHighlightClass}`} />
                <div>
                  <div className={`text-sm ${labelClass}`}>Parcela</div>
                  <div className={`font-medium ${textPrimaryClass}`}>{lancamento.parcela}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detalhes do lançamento */}
          <div className={`border ${borderClass} rounded-lg divide-y divide-${borderClass} transition-colors`}>
            <div className="p-4 flex items-start">
              <FaStore className={`mt-1 mr-3 ${textSecondaryClass}`} />
              <div>
                <div className={`text-sm ${labelClass}`}>Estabelecimento</div>
                <div className={`font-medium ${textPrimaryClass}`}>{lancamento.descricao}</div>
              </div>
            </div>
            
            <div className="p-4 flex items-start">
              <FaUser className={`mt-1 mr-3 ${textSecondaryClass}`} />
              <div>
                <div className={`text-sm ${labelClass}`}>Cliente</div>
                <div className={`font-medium ${textPrimaryClass}`}>{lancamento.nome}</div>
                <div className={`text-sm ${textSecondaryClass}`}>Matrícula: {lancamento.matricula}</div>
              </div>
            </div>
            
            <div className="p-4 flex items-start">
              <FaCreditCard className={`mt-1 mr-3 ${textSecondaryClass}`} />
              <div>
                <div className={`text-sm ${labelClass}`}>Cartão</div>
                <div className={`font-medium ${textPrimaryClass}`}>{lancamento.cartao}</div>
              </div>
            </div>
            
            <div className="p-4 flex items-start">
              <FaCalendarAlt className={`mt-1 mr-3 ${textSecondaryClass}`} />
              <div>
                <div className={`text-sm ${labelClass}`}>Data e Hora</div>
                <div className={`font-medium ${textPrimaryClass}`}>{lancamento.data} às {lancamento.hora}</div>
                <div className={`text-sm ${textSecondaryClass}`}>Referência: {lancamento.mes}</div>
              </div>
            </div>
            
            <div className="p-4 flex items-start">
              <FaReceipt className={`mt-1 mr-3 ${textSecondaryClass}`} />
              <div>
                <div className={`text-sm ${labelClass}`}>Código da Transação</div>
                <div className={`font-medium ${textPrimaryClass}`}>{lancamento.codigo}</div>
              </div>
            </div>
          </div>

          {/* Botão para compartilhar */}
          <button
            onClick={handleCompartilhar}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
          >
            <FaShareAlt className="mr-2" />
            Compartilhar Comprovante
          </button>
        </div>
      </main>
    </div>
  );
} 