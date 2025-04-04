import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { codigosRecuperacao } from '../recuperacao-senha/route';

/**
 * API para validar o código de recuperação de senha
 * Verifica se o código enviado é válido para o cartão informado
 * @param request Requisição com cartão e código de verificação
 * @returns Resposta com status da validação
 */
export async function POST(request: NextRequest) {
  try {
    // Extrair dados do formulário
    const formData = await request.formData();
    const cartao = formData.get('cartao') as string;
    const codigo = formData.get('codigo') as string;

    // Validar campos obrigatórios
    if (!cartao) {
      return NextResponse.json(
        { success: false, message: 'Número do cartão é obrigatório' },
        { status: 400 }
      );
    }

    if (!codigo) {
      return NextResponse.json(
        { success: false, message: 'Código de verificação é obrigatório' },
        { status: 400 }
      );
    }

    // Limpar o cartão (remover não numéricos)
    const cartaoLimpo = cartao.replace(/\D/g, '');
    
    console.log('Validando código de recuperação:', { cartao: cartaoLimpo, codigo });

    // SOLUÇÃO TEMPORÁRIA: Validar o código armazenado localmente
    const dadosCodigo = codigosRecuperacao[cartaoLimpo];
    
    if (!dadosCodigo) {
      return NextResponse.json(
        { success: false, message: 'Nenhum código solicitado para este cartão' },
        { status: 400 }
      );
    }
    
    // Verificar se o código é válido e não expirou (10 minutos)
    const agora = Date.now();
    const tempoExpirado = agora - dadosCodigo.timestamp > 10 * 60 * 1000;
    
    if (tempoExpirado) {
      delete codigosRecuperacao[cartaoLimpo];
      return NextResponse.json(
        { success: false, message: 'Código expirado. Solicite um novo código.' },
        { status: 400 }
      );
    }
    
    // Verificar se o código corresponde
    if (dadosCodigo.codigo !== codigo) {
      return NextResponse.json(
        { success: false, message: 'Código inválido.' },
        { status: 400 }
      );
    }
    
    // Na versão de produção, esta parte seria descomentada quando a API estiver funcionando:
    /*
    // Preparar parâmetros para validação
    const params = new URLSearchParams();
    params.append('cartao', cartaoLimpo);
    params.append('codigo', codigo);

    // Chamar API para validar o código
    const response = await axios.post(
      'https://qrcred.makecard.com.br/valida_codigo_recuperacao.php',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    console.log('Resposta da validação do código:', response.data);

    // Verificar resposta da validação
    if (response.data === 'valido') {
      return NextResponse.json({
        success: true,
        message: 'Código válido',
        token: gerarTokenRecuperacao(cartaoLimpo)
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Código inválido ou expirado',
          tentativa: true
        },
        { status: 400 }
      );
    }
    */
    
    // Código válido, gerar token para redefinição
    return NextResponse.json({
      success: true,
      message: 'Código válido',
      token: gerarTokenRecuperacao(cartaoLimpo)
    });
  } catch (error) {
    console.error('Erro na validação do código:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao validar código de recuperação' },
      { status: 500 }
    );
  }
}

/**
 * Gera um token temporário para permitir a redefinição de senha
 * Este token será verificado na etapa de redefinição
 */
function gerarTokenRecuperacao(cartao: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  
  // Em uma implementação real, este token deveria ser armazenado no servidor
  // com tempo de expiração e validado na próxima etapa
  return Buffer.from(`${cartao}:${timestamp}:${random}`).toString('base64');
} 