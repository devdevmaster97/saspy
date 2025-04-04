import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { randomInt } from 'crypto';

/**
 * API para recuperação de senha
 * Envia um código para o e-mail ou celular cadastrado
 * @param request Requisição com cartão e método de recuperação (email, sms, whatsapp)
 * @returns Resposta com status da operação
 */
export async function POST(request: NextRequest) {
  try {
    // Extrair dados do formulário
    const formData = await request.formData();
    const cartao = formData.get('cartao') as string;
    const metodo = formData.get('metodo') as string;

    // Validar campos obrigatórios
    if (!cartao) {
      return NextResponse.json(
        { success: false, message: 'Número do cartão é obrigatório' },
        { status: 400 }
      );
    }

    if (!metodo || !['email', 'sms', 'whatsapp'].includes(metodo)) {
      return NextResponse.json(
        { success: false, message: 'Método de recuperação inválido' },
        { status: 400 }
      );
    }

    // Limpar o cartão (remover não numéricos)
    const cartaoLimpo = cartao.replace(/\D/g, '');

    // Consultar dados do associado para verificar se existe e obter email/celular
    const params = new URLSearchParams();
    params.append('cartao', cartaoLimpo);

    console.log('Buscando dados do associado para recuperação de senha:', cartaoLimpo);

    const responseAssociado = await axios.post(
      'https://qrcred.makecard.com.br/localiza_associado_app_2.php',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    console.log('Resposta localiza_associado_app_2:', responseAssociado.data);

    // Verificar se o associado foi encontrado
    if (!responseAssociado.data || !responseAssociado.data.matricula) {
      return NextResponse.json(
        { success: false, message: 'Cartão não encontrado' },
        { status: 404 }
      );
    }

    const dadosAssociado = responseAssociado.data;

    // Verificar se o método de contato está disponível
    if (metodo === 'email' && !dadosAssociado.email) {
      return NextResponse.json(
        { success: false, message: 'E-mail não cadastrado para este cartão' },
        { status: 400 }
      );
    }

    if ((metodo === 'sms' || metodo === 'whatsapp') && !dadosAssociado.cel) {
      return NextResponse.json(
        { success: false, message: 'Celular não cadastrado para este cartão' },
        { status: 400 }
      );
    }

    // Gerar código de recuperação (6 dígitos)
    const codigo = randomInt(100000, 999999);

    // Salvar código temporário no sistema
    const paramsCodigo = new URLSearchParams();
    paramsCodigo.append('cartao', cartaoLimpo);
    paramsCodigo.append('codigo', codigo.toString());
    paramsCodigo.append('metodo', metodo);

    // Incluir o destino específico (email ou celular)
    if (metodo === 'email') {
      paramsCodigo.append('email', dadosAssociado.email);
    } else {
      paramsCodigo.append('celular', dadosAssociado.cel);
    }

    console.log('Enviando solicitação de recuperação:', paramsCodigo.toString());

    // Chamar API para salvar e enviar o código
    const responseEnvio = await axios.post(
      'https://qrcred.makecard.com.br/envia_codigo_recuperacao.php',
      paramsCodigo,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    console.log('Resposta do envio do código:', responseEnvio.data);

    // Verificar resposta do envio
    if (responseEnvio.data === 'enviado') {
      return NextResponse.json({
        success: true,
        message: `Código de recuperação enviado com sucesso para o ${metodo === 'email' ? 'e-mail' : metodo === 'sms' ? 'celular via SMS' : 'WhatsApp'} cadastrado.`,
        destino: metodo === 'email' 
          ? mascaraEmail(dadosAssociado.email) 
          : mascaraTelefone(dadosAssociado.cel)
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Erro ao enviar código de recuperação' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar solicitação de recuperação de senha' },
      { status: 500 }
    );
  }
}

/**
 * Mascara o email para exibição, mostrando apenas parte do email
 * Ex: jo***@gm***.com
 */
function mascaraEmail(email: string): string {
  if (!email || email.indexOf('@') === -1) return '***@***.com';
  
  const [usuario, dominio] = email.split('@');
  const dominioPartes = dominio.split('.');
  const extensao = dominioPartes.pop();
  const nomeUsuarioMascarado = usuario.substring(0, 2) + '***';
  const nomeDominioMascarado = dominioPartes.join('.').substring(0, 2) + '***';
  
  return `${nomeUsuarioMascarado}@${nomeDominioMascarado}.${extensao}`;
}

/**
 * Mascara o telefone para exibição, mostrando apenas parte do número
 * Ex: (**) *****-1234
 */
function mascaraTelefone(telefone: string): string {
  if (!telefone) return '(**) *****-****';
  
  const numeroLimpo = telefone.replace(/\D/g, '');
  if (numeroLimpo.length < 4) return '(**) *****-****';
  
  const ultimosDigitos = numeroLimpo.slice(-4);
  return `(**) *****-${ultimosDigitos}`;
} 