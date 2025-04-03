import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('Teste API - GET solicitado');
  
  try {
    // Criar a resposta
    const resposta = NextResponse.json({
      success: true,
      message: 'API de teste funcionando corretamente',
      timestamp: new Date().toISOString()
    });
    
    // Adicionar headers anti-cache
    resposta.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    resposta.headers.set('Pragma', 'no-cache');
    resposta.headers.set('Expires', '0');
    
    return resposta;
  } catch (error) {
    console.error('Erro na API de teste:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor',
        timestamp: new Date().toISOString()
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