import SaldoCard from '@/app/components/dashboard/SaldoCard';
import { FaInfoCircle } from 'react-icons/fa';

export default function SaldoPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Saldo</h1>
        <div className="mt-2 sm:mt-0 text-sm text-gray-600">
          <div className="flex items-center">
            <FaInfoCircle className="mr-1" />
            <span>Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </header>

      <main className="grid gap-6">
        <section>
          <h2 className="sr-only">Saldo do Cartão</h2>
          <SaldoCard />
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações sobre seu saldo</h2>
          
          <div className="space-y-4 text-gray-600">
            <p>
              O saldo apresentado é baseado no limite disponível para o mês atual.
              O cálculo é feito subtraindo os gastos do período do seu limite total.
            </p>
            
            <article className="p-3 bg-yellow-50 rounded-md border border-yellow-100">
              <h3 className="font-medium text-yellow-800">Atenção</h3>
              <p className="text-sm">
                Algumas transações podem levar até 24 horas para serem processadas. 
                Para obter informações atualizadas, utilize o botão de atualização.
              </p>
            </article>
            
            <p>
              Se você tiver dúvidas sobre seus gastos, consulte a seção de &ldquo;Extrato&rdquo; 
              para ver detalhes de todas as suas transações.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
} 