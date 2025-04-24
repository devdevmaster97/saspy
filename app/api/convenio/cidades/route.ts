import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface Estado {
  sigla: string;
  nome: string;
  id: number;
}

interface Cidade {
  id: number;
  nome: string;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Adicionar headers CORS para garantir acesso em todos dispositivos
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const searchParams = request.nextUrl.searchParams;
    const uf = searchParams.get('uf');

    if (!uf) {
      return NextResponse.json(
        { success: false, message: 'UF é obrigatória' },
        { status: 400, headers }
      );
    }

    console.log(`Buscando cidades para UF: ${uf}`);

    // Primeiro, buscar o ID do estado
    const estadosResponse = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
    
    // Log para debug
    console.log(`Recebidos ${estadosResponse.data.length} estados do IBGE`);
    
    const estado = estadosResponse.data.find((e: Estado) => e.sigla === uf);

    if (!estado) {
      console.error(`Estado não encontrado para UF: ${uf}`);
      return NextResponse.json(
        { success: false, message: 'UF não encontrada' },
        { status: 404, headers }
      );
    }

    console.log(`Estado encontrado: ${estado.nome} (ID: ${estado.id})`);

    // Buscar cidades do estado
    const cidadesUrl = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.id}/municipios`;
    console.log(`Buscando cidades em: ${cidadesUrl}`);
    
    const response = await axios.get(cidadesUrl);
    
    // Log para debug
    console.log(`Recebidas ${response.data.length} cidades do IBGE`);
    
    // Ordenar cidades por nome
    const cidades = response.data
      .map((cidade: Cidade) => ({
        id: cidade.id,
        nome: cidade.nome
      }))
      .sort((a: Cidade, b: Cidade) => a.nome.localeCompare(b.nome));
    
    console.log(`Retornando ${cidades.length} cidades ordenadas`);
    
    return NextResponse.json({
      success: true,
      data: cidades
    }, { headers });

  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    
    // Melhorar a resposta de erro para facilitar diagnóstico
    return NextResponse.json({
      success: false, // Corrigido para retornar false em caso de erro
      message: 'Erro ao buscar cidades',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      data: []
    }, { status: 500, headers });
  }
} 