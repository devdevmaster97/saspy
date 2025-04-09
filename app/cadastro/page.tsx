'use client';

import React from 'react';
import CadastroForm from '@/app/components/CadastroForm';
import Head from 'next/head';

export default function CadastroPage() {
  return (
    <>
      <Head>
        <title>Cadastro de Associado - QRCred</title>
      </Head>
      <CadastroForm />
    </>
  );
} 