'use client';

import React from 'react';
import CadastroForm from '@/app/components/CadastroForm';
import Head from 'next/head';
import { useTranslations } from '@/app/contexts/LanguageContext';

export default function CadastroPage() {
  const translations = useTranslations('AssociateRegistration');

  return (
    <>
      <Head>
        <title>{translations.page_title || 'Cadastro de Associado - SASPY'}</title>
      </Head>
      <CadastroForm />
    </>
  );
} 