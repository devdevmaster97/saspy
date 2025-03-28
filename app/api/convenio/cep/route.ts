import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cep = searchParams.get('cep');

    if (!cep) {
      return NextResponse.json(
        { success: false, message: 'CEP é obrigatório' },
        { status: 400 }
      );
    }

    // Limpar o CEP de caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Validar formato do CEP
    if (cepLimpo.length !== 8) {
      return NextResponse.json(
        { success: false, message: 'CEP inválido' },
        { status: 400 }
      );
    }

    const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (response.data.erro) {
      return NextResponse.json(
        { success: false, message: 'CEP não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        endereco: response.data.logradouro,
        bairro: response.data.bairro,
        cidade: response.data.localidade,
        uf: response.data.uf,
        cep: response.data.cep
      }
    });

  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar CEP' },
      { status: 500 }
    );
  }
} 