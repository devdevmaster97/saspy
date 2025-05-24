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
      </main>
    </div>
  );
} 