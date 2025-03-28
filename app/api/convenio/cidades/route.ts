import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface Estado {
  sigla: string;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uf = searchParams.get('uf');

    if (!uf) {
      return NextResponse.json(
        { success: false, message: 'UF é obrigatória' },
        { status: 400 }
      );
    }

    // Primeiro, buscar o ID do estado
    const estadosResponse = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
    const estado = estadosResponse.data.find((e: Estado) => e.sigla === uf);

    if (!estado) {
      return NextResponse.json(
        { success: false, message: 'UF não encontrada' },
        { status: 404 }
      );
    }

    // Buscar cidades do estado
    const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.id}/municipios`);
    
    // Ordenar cidades por nome
    const cidades = response.data
      .map((cidade: Cidade) => ({
        id: cidade.id,
        nome: cidade.nome
      }))
      .sort((a: Cidade, b: Cidade) => a.nome.localeCompare(b.nome));
    
    return NextResponse.json({
      success: true,
      data: cidades
    });

  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return NextResponse.json({
      success: true,
      data: []
    });
  }
} 