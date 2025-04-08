import { NextResponse } from 'next/server';
import { codigosRecuperacao } from '../recuperacao-senha/route';

// Interface para a informação de depuração dos códigos
interface CodigoInfo {
  codigo: string;
  metodo: string;
  geradoEm: string;
  tempoDecorrido: string;
  expiraEm: string;
  status: string;
}

/**
 * Rota de depuração para visualizar os códigos de recuperação armazenados
 * Só deve ser usada em ambiente de desenvolvimento
 */
export async function GET() {
  // Por segurança, apenas mostrar os códigos em ambiente de desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { message: 'Esta rota só está disponível em ambiente de desenvolvimento' },
      { status: 403 }
    );
  }

  // Para maior segurança, nunca exibir os códigos em produção
  // Em vez disso, mostrar apenas informações estatísticas
  const timestamp = new Date().toISOString();
  const totalCodigos = Object.keys(codigosRecuperacao).length;

  // Criar uma cópia segura para exibição
  const codigosInfo: Record<string, CodigoInfo> = {};
  
  for (const [cartao, info] of Object.entries(codigosRecuperacao)) {
    const dataHora = new Date(info.timestamp).toISOString();
    const tempoDecorrido = Math.floor((Date.now() - info.timestamp) / 1000);
    const expirado = tempoDecorrido > 600; // 10 minutos em segundos
    
    codigosInfo[cartao] = {
      codigo: info.codigo,
      metodo: info.metodo,
      geradoEm: dataHora,
      tempoDecorrido: `${tempoDecorrido} segundos`,
      expiraEm: expirado ? 'Expirado' : `${600 - tempoDecorrido} segundos`,
      status: expirado ? 'Expirado' : 'Válido'
    };
  }

  return NextResponse.json({
    timestamp,
    totalCodigos,
    codigos: codigosInfo
  });
} 