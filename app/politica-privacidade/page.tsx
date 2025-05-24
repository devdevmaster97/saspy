'use client';

import Header from '../components/Header';
import { useTranslations } from '../contexts/LanguageContext';

export default function PoliticaPrivacidadePage() {
  const translations = useTranslations('PoliticaPrivacidade');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title={translations.page_title || 'Política de Privacidade'} showBackButton />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {translations.main_title || 'Política de Privacidade do SASPY'}
          </h2>
          
          <div className="space-y-6 text-gray-700">
            <p>
              {translations.intro_text || 'Esta Política de Privacidade descreve como suas informações pessoais são coletadas, usadas e compartilhadas quando você utiliza o aplicativo SASPY.'}
            </p>

            <h3 className="text-xl font-semibold text-gray-800">
              {translations.collection_title || 'INFORMAÇÕES PESSOAIS QUE COLETAMOS'}
            </h3>
            <p>
              {translations.collection_text || 'Quando você utiliza o aplicativo, coletamos informações que você fornece diretamente, como seu nome, endereço, número de telefone, endereço de e-mail, CPF e dados do cartão.'}
            </p>

            <h3 className="text-xl font-semibold text-gray-800">
              {translations.usage_title || 'COMO USAMOS SUAS INFORMAÇÕES PESSOAIS'}
            </h3>
            <p>
              {translations.usage_intro || 'Utilizamos as informações pessoais que coletamos para:'}
            </p>
            <ul className="list-disc pl-6">
              <li>{translations.usage_list_1 || 'Processar suas transações e gerenciar sua conta'}</li>
              <li>{translations.usage_list_2 || 'Verificar sua identidade e prevenir fraudes'}</li>
              <li>{translations.usage_list_3 || 'Comunicar-nos com você sobre sua conta e atualizações do serviço'}</li>
              <li>{translations.usage_list_4 || 'Melhorar e personalizar sua experiência no aplicativo'}</li>
              <li>{translations.usage_list_5 || 'Cumprir obrigações legais e regulatórias'}</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800">
              {translations.sharing_title || 'COMPARTILHAMENTO DE INFORMAÇÕES'}
            </h3>
            <p>
              {translations.sharing_text || 'Compartilhamos suas informações pessoais apenas com terceiros confiáveis que nos ajudam a operar nosso aplicativo, conduzir nossos negócios ou atendê-lo, desde que essas partes concordem em manter essas informações confidenciais.'}
            </p>

            <h3 className="text-xl font-semibold text-gray-800">
              {translations.security_title || 'SEGURANÇA'}
            </h3>
            <p>
              {translations.security_text || 'Implementamos medidas de segurança razoáveis para proteger a segurança de suas informações pessoais. No entanto, lembre-se de que nenhum método de transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro.'}
            </p>

            <h3 className="text-xl font-semibold text-gray-800">
              {translations.changes_title || 'ALTERAÇÕES'}
            </h3>
            <p>
              {translations.changes_text || 'Podemos atualizar esta política de privacidade periodicamente para refletir mudanças em nossas práticas. Recomendamos que você revise esta política periodicamente para estar ciente de quaisquer alterações.'}
            </p>

            <h3 className="text-xl font-semibold text-gray-800">
              {translations.contact_title || 'CONTATO'}
            </h3>
            <p>
              {translations.contact_text || 'Para mais informações sobre nossas práticas de privacidade ou se tiver dúvidas, entre em contato conosco pelo e-mail: privacidade@saspy.com.br'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 