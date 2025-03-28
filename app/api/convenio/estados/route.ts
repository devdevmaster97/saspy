import { NextResponse } from 'next/server';
import axios from 'axios';

interface Estado {
  sigla: string;
  nome: string;
}

export async function GET() {
  try {
    const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
    
    // Ordenar estados por nome
    const estados = response.data
      .map((estado: Estado) => ({
        sigla: estado.sigla,
        nome: estado.nome
      }))
      .sort((a: Estado, b: Estado) => a.nome.localeCompare(b.nome));
    
    return NextResponse.json({
      success: true,
      data: estados
    });

  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    return NextResponse.json({
      success: true,
      data: []
    });
  }
} 