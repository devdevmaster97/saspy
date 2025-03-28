import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const usuario = formData.get('usuario') as string;
    const senha = formData.get('senha') as string;

    if (!usuario || !senha) {
      return NextResponse.json(
        { success: false, message: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Enviar requisição para o backend
    const response = await axios.post('https://qrcred.makecard.com.br/login_convenio_app.php', {
      usuario,
      senha
    });

    if (response.data.success) {
      return NextResponse.json({
        success: true,
        data: response.data
      });
    } else {
      return NextResponse.json({
        success: false,
        message: response.data.message || 'Usuário ou senha inválidos'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao realizar login' },
      { status: 500 }
    );
  }
} 