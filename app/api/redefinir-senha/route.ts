import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * API para redefinir a senha do associado
 * Recebe o token de validação, cartão e nova senha
 * @param request Requisição com token, cartão e nova senha
 * @returns Resposta com status da redefinição
 */
export async function POST(request: NextRequest) {
  try {
    // Extrair dados do formulário
    const formData = await request.formData();
    const cartao = formData.get('cartao') as string;
    const novaSenha = formData.get('senha') as string;
    const token = formData.get('token') as string;

    // Validar campos obrigatórios
    if (!cartao) {
      return NextResponse.json(
        { success: false, message: 'Número do cartão é obrigatório' },
        { status: 400 }
      );
    }

    if (!novaSenha) {
      return NextResponse.json(
        { success: false, message: 'Nova senha é obrigatória' },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de validação é obrigatório' },
        { status: 400 }
      );
    }

    // Validar formato da senha
    if (novaSenha.length < 4) {
      return NextResponse.json(
        { success: false, message: 'A senha deve ter pelo menos 4 caracteres' },
        { status: 400 }
      );
    }

    // Validar o token (em produção, você validaria com o token armazenado no servidor)
    let tokenValido = false;
    try {
      const tokenDecodificado = Buffer.from(token, 'base64').toString('utf-8');
      const partes = tokenDecodificado.split(':');
      
      if (partes.length >= 2) {
        const cartaoToken = partes[0];
        const timestamp = parseInt(partes[1]);
        const agora = Date.now();
        
        // Verificar se o cartão corresponde e se o token não expirou (10 minutos)
        if (cartaoToken === cartao.replace(/\D/g, '') && (agora - timestamp) < 10 * 60 * 1000) {
          tokenValido = true;
        }
      }
    } catch (error) {
      console.error('Erro ao validar token:', error);
    }

    if (!tokenValido) {
      return NextResponse.json(
        { success: false, message: 'Token inválido ou expirado, solicite um novo código' },
        { status: 401 }
      );
    }

    // Limpar o cartão (remover não numéricos)
    const cartaoLimpo = cartao.replace(/\D/g, '');
    
    try {
      // Preparar parâmetros para redefinição de senha
      const params = new URLSearchParams();
      params.append('cartao', cartaoLimpo);
      params.append('senha', novaSenha);
  
      console.log('Redefinindo senha para o cartão:', cartaoLimpo);
  
      // Chamar API para redefinir a senha
      const response = await axios.post(
        'https://qrcred.makecard.com.br/atualiza_senha_associado.php',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );
  
      console.log('Resposta da redefinição de senha:', response.data);
  
      // Verificar resposta da redefinição
      if (response.data === 'atualizado') {
        return NextResponse.json({
          success: true,
          message: 'Senha redefinida com sucesso. Você já pode fazer login com sua nova senha.'
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Erro ao redefinir senha no servidor. Tente novamente.' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Erro ao conectar com servidor de redefinição:', error);
      
      // Solução temporária: Retornar sucesso mesmo sem conseguir conectar à API
      // APENAS PARA AMBIENTE DE DESENVOLVIMENTO - em produção, remover isto
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'Senha redefinida com sucesso (AMBIENTE DESENVOLVIMENTO). Você já pode fazer login com sua nova senha.',
          debug: 'Aviso: Este é um ambiente de desenvolvimento. A senha não foi realmente alterada no servidor.'
        });
      }
      
      return NextResponse.json(
        { success: false, message: 'Erro na conexão com o servidor. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro na redefinição de senha:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar solicitação de redefinição de senha' },
      { status: 500 }
    );
  }
} 