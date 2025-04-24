import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/app/utils/constants';
import axios from 'axios';

/**
 * API para buscar lista de empregadores
 * @returns Resposta com lista de empregadores
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Buscando lista de empregadores');
    
    try {
      // Usar axios para a consulta
      const response = await axios.get(`${API_URL}/api_empregadores.php`);
      
      console.log('Resposta da API de empregadores:', response.data);
      
      // Verificar o formato da resposta e garantir uma estrutura consistente
      let empregadores = [];
      
      if (Array.isArray(response.data)) {
        // Se a resposta já for um array, usamos diretamente
        empregadores = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.data)) {
          // Resposta no formato { data: [...] }
          empregadores = response.data.data;
        } else if (Array.isArray(response.data.empregadores)) {
          // Resposta no formato { empregadores: [...] }
          empregadores = response.data.empregadores;
        } else {
          // Tentar converter um objeto para array se não for um array
          // Ex: { 1: "Empregador A", 2: "Empregador B" }
          empregadores = Object.entries(response.data).map(([id, nome]) => ({
            id,
            nome: typeof nome === 'string' ? nome : String(nome)
          }));
        }
      }
      
      // Garantir que cada empregador tenha o formato esperado { id, nome }
      const empregadoresFormatados = empregadores.map((emp: any) => {
        if (typeof emp === 'object' && emp !== null) {
          return {
            id: emp.id || emp.codigo || emp.cod || '',
            nome: emp.nome || emp.descricao || emp.name || emp.value || ''
          };
        } else if (typeof emp === 'string') {
          return { id: '', nome: emp };
        }
        return { id: '', nome: String(emp) };
      });
      
      // Retornar em um formato consistente esperado pelo frontend
      return NextResponse.json({
        success: true,
        data: empregadoresFormatados,
        empregadores: empregadoresFormatados  // Para compatibilidade
      });
      
    } catch (axiosError: any) {
      console.error('Erro na busca de empregadores:', axiosError.message);
      
      let errorMessage = 'Erro ao buscar empregadores';
      if (axiosError.response) {
        errorMessage = axiosError.response.data?.message || errorMessage;
      }
      
      return NextResponse.json({
        success: false,
        message: errorMessage,
        error: axiosError.message
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de busca de empregadores:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor', error: String(error) },
      { status: 500 }
    );
  }
} 