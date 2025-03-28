'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSession } from 'next-auth/react';

export default function QrCodeContent() {
  const { data: session } = useSession();
  const [cartao, setCartao] = useState<string>('');

  useEffect(() => {
    // Se tiver cartão na sessão, usa ele
    if (session?.user?.cartao) {
      setCartao(session.user.cartao);
    } 
    // Caso contrário, usa um valor padrão para testes
    else if (!cartao) {
      setCartao('1184646067');
    }
  }, [session, cartao]);

  if (!cartao) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <QRCodeSVG 
          value={cartao} 
          size={256} 
          level="H"
          includeMargin={true}
        />
        <p className="mt-4 text-center text-gray-600">
          Seu número de cartão: {cartao}
        </p>
      </div>
      <p className="text-sm text-gray-500 text-center">
        Apresente este QR Code no estabelecimento para realizar pagamentos
      </p>
    </div>
  );
} 