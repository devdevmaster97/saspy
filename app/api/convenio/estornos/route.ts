import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Dados recebidos na rota API de estornos:', body);

    // Obter código do convênio
    const convenio = body.convenio;
    
    // Validar se o código do convênio é válido
    if (!convenio || convenio === 0) {
      console.error('Código do convênio inválido:', convenio);
      return NextResponse.json(
        { success: false, message: 'Código do convênio inválido ou não fornecido', data: [] },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    console.log('Buscando estornos para o convênio:', convenio);

    // Fazer a requisição para a API externa
    const response = await fetch('https://qrcred.makecard.com.br/estornos_realizados.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify({
        convenio: convenio
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Resposta da API de estornos:', {
      success: data.success,
      message: data.message,
      quantidade: data.data?.length || 0
    });

    // Criar o objeto de resposta com os headers anti-cache
    const resposta = NextResponse.json(data);
    
    // Adicionar headers para evitar cache
    resposta.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    resposta.headers.set('Pragma', 'no-cache');
    resposta.headers.set('Expires', '0');
    
    return resposta;
  } catch (error) {
    console.error('Erro ao buscar estornos:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor',
        data: []
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
} 