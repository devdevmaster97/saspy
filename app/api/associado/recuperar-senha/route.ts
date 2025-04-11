import { NextResponse } from 'next/server';

// Variável global para controlar o tempo entre solicitações
let ultimaSolicitacao: { [key: string]: number } = {};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { numeroCartao } = body;

    if (!numeroCartao) {
      return NextResponse.json(
        { success: false, message: 'Número do cartão é obrigatório' },
        { status: 400 }
      );
    }

    // Verifica se já houve uma solicitação recente para este cartão
    const agora = Date.now();
    const ultimaSolicitacaoCartao = ultimaSolicitacao[numeroCartao] || 0;
    const tempoDecorrido = agora - ultimaSolicitacaoCartao;

    // Se já houve uma solicitação nos últimos 60 segundos, retorna erro
    if (tempoDecorrido < 60000) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Aguarde 60 segundos antes de solicitar um novo código' 
        },
        { status: 429 }
      );
    }

    // Atualiza o timestamp da última solicitação
    ultimaSolicitacao[numeroCartao] = agora;

    // Aqui você deve implementar a lógica de recuperação de senha
    // Por exemplo, gerar um código, enviar SMS, etc.
    
    // Por enquanto, vamos apenas simular o sucesso
    return NextResponse.json({
      success: true,
      message: 'Código de recuperação enviado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar recuperação de senha' },
      { status: 500 }
    );
  }
} 