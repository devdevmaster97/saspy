import Header from '../components/Header';

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Política de Privacidade" showBackButton />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Política de Privacidade do QRCred</h2>
          
          <div className="space-y-6 text-gray-700">
            <p>
              Esta Política de Privacidade descreve como suas informações pessoais são coletadas, 
              usadas e compartilhadas quando você utiliza o aplicativo QRCred.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">INFORMAÇÕES PESSOAIS QUE COLETAMOS</h3>
            <p>
              Quando você utiliza o aplicativo, coletamos informações que você fornece diretamente, 
              como seu nome, endereço, número de telefone, endereço de e-mail, CPF e dados do cartão.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">COMO USAMOS SUAS INFORMAÇÕES PESSOAIS</h3>
            <p>
              Utilizamos as informações pessoais que coletamos para:
            </p>
            <ul className="list-disc pl-6">
              <li>Processar suas transações e gerenciar sua conta</li>
              <li>Verificar sua identidade e prevenir fraudes</li>
              <li>Comunicar-nos com você sobre sua conta e atualizações do serviço</li>
              <li>Melhorar e personalizar sua experiência no aplicativo</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800">COMPARTILHAMENTO DE INFORMAÇÕES</h3>
            <p>
              Compartilhamos suas informações pessoais apenas com terceiros confiáveis que nos 
              ajudam a operar nosso aplicativo, conduzir nossos negócios ou atendê-lo, desde que 
              essas partes concordem em manter essas informações confidenciais.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">SEGURANÇA</h3>
            <p>
              Implementamos medidas de segurança razoáveis para proteger a segurança de suas 
              informações pessoais. No entanto, lembre-se de que nenhum método de transmissão 
              pela Internet ou método de armazenamento eletrônico é 100% seguro.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">ALTERAÇÕES</h3>
            <p>
              Podemos atualizar esta política de privacidade periodicamente para refletir mudanças 
              em nossas práticas. Recomendamos que você revise esta política periodicamente para 
              estar ciente de quaisquer alterações.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">CONTATO</h3>
            <p>
              Para mais informações sobre nossas práticas de privacidade ou se tiver dúvidas, 
              entre em contato conosco pelo e-mail: privacidade@saspy.com.br
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 