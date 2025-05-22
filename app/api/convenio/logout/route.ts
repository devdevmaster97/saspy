import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Remover o cookie definindo uma data de expiração no passado
    cookieStore.set('convenioToken', '', {
      expires: new Date(0),
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'ut realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
} 