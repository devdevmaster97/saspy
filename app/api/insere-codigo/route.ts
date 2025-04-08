import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { codigosRecuperacao } from '../recuperacao-senha/route';

/**
 * API para inserir um código de recuperação diretamente no banco de dados
 * Útil quando os códigos locais não estão sincronizados com o banco
 * @param request Requisição com cartão e código
 * @returns Resposta com status da operação
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
    
    console.log('Inserindo código manualmente:', { cartao: cartaoLimpo, codigo });

    // Primeiro, verificar se já existe um código para este cartão e excluí-lo
    try {
      // Parâmetros para verificar o código existente
      const paramsVerifica = new URLSearchParams();
      paramsVerifica.append('cartao', cartaoLimpo);
      paramsVerifica.append('admin_token', 'chave_segura_123');
      
      // Verificar se existe código para este cartão
      const responseVerifica = await axios.get(
        'https://qrcred.makecard.com.br/admin_codigos_recuperacao.php?' + paramsVerifica.toString()
      );
      
      // Se encontrou códigos existentes, excluí-los
      if (responseVerifica.data.status === 'sucesso' && responseVerifica.data.codigos) {
        const codigosExistentes = responseVerifica.data.codigos.filter(
          (c: any) => c.cartao === cartaoLimpo
        );
        
        if (codigosExistentes.length > 0) {
          console.log('Códigos existentes encontrados, excluindo antes de inserir novo');
          
          // Parâmetros para exclusão
          const paramsDelete = new URLSearchParams();
          paramsDelete.append('cartao', cartaoLimpo);
          paramsDelete.append('admin_token', 'chave_segura_123');
          
          // Excluir o código existente
          await axios.delete(
            'https://qrcred.makecard.com.br/admin_codigos_recuperacao.php?' + paramsDelete.toString()
          );
        }
      }
    } catch (error) {
      console.error('Erro ao verificar/excluir código existente:', error);
      // Continuar com o processo mesmo se houver erro na verificação/exclusão
    }
    
    // Preparar parâmetros para inserir o código
    const paramsInsert = new URLSearchParams();
    paramsInsert.append('cartao', cartaoLimpo);
    paramsInsert.append('codigo', codigo);
    paramsInsert.append('operacao', 'inserir');
    paramsInsert.append('admin_token', 'chave_segura_123');
    
    // Chamar API para inserir o código
    const responseInsert = await axios.post(
      'https://qrcred.makecard.com.br/gerencia_codigo_recuperacao.php',
      paramsInsert,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );
    
    console.log('Resposta da inserção manual:', responseInsert.data);
    
    // Também armazenar localmente para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      codigosRecuperacao[cartaoLimpo] = {
        codigo: codigo,
        timestamp: Date.now(),
        metodo: 'manual'
      };
    }
    
    // Verificar resposta da inserção
    if (responseInsert.data.status === 'sucesso') {
      return NextResponse.json({
        success: true,
        message: 'Código inserido com sucesso no banco de dados'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: responseInsert.data.erro || 'Erro ao inserir código de recuperação',
          resposta: responseInsert.data
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao inserir código:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao processar solicitação de inserção de código',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 