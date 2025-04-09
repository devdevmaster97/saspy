'use client';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

export default function SmsTesterPage() {
  const [celular, setCelular] = useState('');
  const [mensagem, setMensagem] = useState('Teste de SMS do sistema QRCred');
  const [resultado, setResultado] = useState<any>(null);
  const [enviando, setEnviando] = useState(false);
  const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!celular) {
      alert('Informe o número do celular');
      return;
    }
    
    setEnviando(true);
    setResultado(null);
    setTipoMensagem(null);
    
    try {
      // Preparar os dados para o teste
      const formData = new FormData();
      formData.append('celular', celular);
      formData.append('mensagem', mensagem);
      
      // Chamar a API de teste
      const response = await fetch('/api/debug-sms', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      console.log('Resposta do teste:', result);
      
      // Mostrar o resultado
      setResultado(result);
      setTipoMensagem(result.success ? 'sucesso' : 'erro');
    } catch (error) {
      console.error('Erro ao testar SMS:', error);
      setResultado({ 
        success: false, 
        message: 'Erro ao enviar SMS de teste',
        error: error instanceof Error ? error.message : String(error)
      });
      setTipoMensagem('erro');
    } finally {
      setEnviando(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Teste de SMS</h1>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Esta página é apenas para desenvolvimento e teste do envio de SMS.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="celular" className="block text-sm font-medium text-gray-700 mb-1">
            Número do Celular
          </label>
          <input
            type="text"
            id="celular"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="Ex: (11) 98765-4321"
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Formato: DDD + número. O código do país (55) será adicionado automaticamente.
          </p>
        </div>
        
        <div>
          <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">
            Mensagem
          </label>
          <textarea
            id="mensagem"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button
          type="submit"
          disabled={enviando}
          className={`w-full py-2 px-4 text-white rounded ${
            enviando ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {enviando ? (
            <span className="flex items-center justify-center">
              <FaSpinner className="animate-spin mr-2" />
              Enviando...
            </span>
          ) : (
            'Enviar SMS de Teste'
          )}
        </button>
      </form>
      
      {resultado && (
        <div className={`mt-6 p-4 rounded ${
          tipoMensagem === 'sucesso' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <h2 className="font-bold mb-2">Resultado:</h2>
          <pre className="text-xs overflow-auto max-h-64 bg-white p-2 rounded border">
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-bold mb-2">Como testar:</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Insira um número de celular válido</li>
          <li>Digite uma mensagem ou use o texto padrão</li>
          <li>Clique em "Enviar SMS de Teste"</li>
          <li>Verifique o resultado da API e se a mensagem foi recebida no celular</li>
        </ol>
      </div>
    </div>
  );
} 