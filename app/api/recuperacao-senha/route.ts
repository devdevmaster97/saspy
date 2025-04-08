import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { randomInt } from 'crypto';

// Armazenamento temporário dos códigos de recuperação (apenas para desenvolvimento)
// Formato: { cartao: { codigo: string, timestamp: number, metodo: string } }
export const codigosRecuperacao: Record<string, { codigo: string, timestamp: number, metodo: string }> = {};

// Interface para a resposta da API de recuperação
interface RecuperacaoResponse {
  success: boolean;
  message: string;
  destino?: string;
  codigoTemp?: string;
}

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
        },
        timeout: 10000 // 10 segundos de timeout
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

    // Armazenar localmente apenas para debug e desenvolvimento
    codigosRecuperacao[cartaoLimpo] = {
      codigo: codigo.toString(),
      timestamp: Date.now(),
      metodo: metodo
    };
    
    console.log('Código de recuperação gerado:', {
      cartao: cartaoLimpo,
      codigo: codigo.toString(),
      metodo
    });

    // Debug: Verificar todos os códigos de recuperação armazenados
    console.log('Códigos de recuperação locais (apenas para debug):', Object.keys(codigosRecuperacao));

    // Primeiro, tentar inserir o código no banco de dados através da API gerencia_codigo_recuperacao.php
    try {
      const paramsInsert = new URLSearchParams();
      paramsInsert.append('cartao', cartaoLimpo);
      paramsInsert.append('codigo', codigo.toString());
      paramsInsert.append('operacao', 'inserir');
      paramsInsert.append('admin_token', 'chave_segura_123');
      
      console.log('Enviando solicitação para inserção do código no banco:', paramsInsert.toString());
      
      const responseInsert = await axios.post(
        'https://qrcred.makecard.com.br/gerencia_codigo_recuperacao.php',
        paramsInsert,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 8000 // 8 segundos de timeout
        }
      );
      
      console.log('Resposta da inserção do código:', responseInsert.data);
    } catch (insertError) {
      console.error('Erro ao inserir código no banco:', insertError);
      // Continuar com o processo mesmo se houver erro na inserção
    }

    // Preparar parâmetros para enviar à API de envio de código
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

    console.log('Enviando solicitação para envio do código:', paramsCodigo.toString());

    try {
      // Chamar API para enviar o código
      const responseEnvio = await axios.post(
        'https://qrcred.makecard.com.br/envia_codigo_recuperacao.php',
        paramsCodigo,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000 // 30 segundos de timeout para permitir tempo de envio de email
        }
      );

      console.log('Resposta do envio do código:', responseEnvio.data);

      // Verificar resposta do envio 
      // A resposta "enviado" é um texto simples, não um JSON
      if (responseEnvio.data === 'enviado') {
        const resposta: RecuperacaoResponse = {
          success: true,
          message: `Código de recuperação enviado com sucesso para o ${metodo === 'email' ? 'e-mail' : metodo === 'sms' ? 'celular via SMS' : 'WhatsApp'} cadastrado.`,
          destino: metodo === 'email' 
            ? mascaraEmail(dadosAssociado.email) 
            : mascaraTelefone(dadosAssociado.cel)
        };
        
        // Adicionar código temporário em ambiente de desenvolvimento para facilitar testes
        if (process.env.NODE_ENV === 'development') {
          resposta.codigoTemp = codigo.toString();
        }
        
        return NextResponse.json(resposta);
      } else {
        // Resposta diferente de "enviado" - pode ser um JSON com erro
        const mensagemErro = typeof responseEnvio.data === 'object' && responseEnvio.data.erro
          ? responseEnvio.data.erro
          : 'Erro desconhecido ao enviar código de recuperação';
        
        console.error('Erro no envio do código:', mensagemErro);
        
        // Em ambiente de desenvolvimento, permitir continuar mesmo com erro
        if (process.env.NODE_ENV === 'development') {
          const resposta: RecuperacaoResponse = {
            success: true,
            message: `AMBIENTE DE DESENVOLVIMENTO: Código gerado, mas ocorreu um erro no envio: ${mensagemErro}`,
            destino: metodo === 'email'
              ? mascaraEmail(dadosAssociado.email)
              : mascaraTelefone(dadosAssociado.cel),
            codigoTemp: codigo.toString()
          };
          
          return NextResponse.json(resposta);
        }
        
        return NextResponse.json(
          { success: false, message: `Erro ao enviar código de recuperação: ${mensagemErro}` },
          { status: 500 }
        );
      }
    } catch (envioError) {
      console.error('Erro ao enviar código:', envioError);
      
      // Em ambiente de desenvolvimento, permitir continuar mesmo com erro
      if (process.env.NODE_ENV === 'development') {
        const errorMessage = envioError instanceof Error ? envioError.message : String(envioError);
        const resposta: RecuperacaoResponse = {
          success: true,
          message: `AMBIENTE DE DESENVOLVIMENTO: Código gerado, mas ocorreu um erro no envio: ${errorMessage}`,
          destino: metodo === 'email'
            ? mascaraEmail(dadosAssociado.email)
            : mascaraTelefone(dadosAssociado.cel),
          codigoTemp: codigo.toString()
        };
        
        return NextResponse.json(resposta);
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro ao enviar código de recuperação. Tente novamente mais tarde.',
          error: envioError instanceof Error ? envioError.message : String(envioError)
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao processar solicitação de recuperação de senha',
        error: error instanceof Error ? error.message : String(error)
      },
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