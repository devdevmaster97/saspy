import Header from '../components/Header';

export default function ConveniosPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Área do Convênio" showBackButton />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Acesso de Convênios</h2>
          
          <p className="text-gray-600 mb-6 text-center">
            Esta área é destinada aos parceiros e convênios do saspy.
            Por favor, entre em contato com nosso suporte para obter credenciais de acesso.
          </p>
          
          <div className="text-center">
            <p className="text-blue-600 font-semibold">
              Contato: suporte@saspy.com.br
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 