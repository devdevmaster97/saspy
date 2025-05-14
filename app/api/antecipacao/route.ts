import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Armazenar IDs de solicitações recentes para evitar duplicações
const recentRequests = new Set<string>();
// Limitar o tamanho do conjunto para evitar crescimento infinito
const MAX_RECENT_REQUESTS = 100;

// Função para limpar solicitações antigas (manter apenas as 100 mais recentes)
function cleanupOldRequests() {
  if (recentRequests.size > MAX_RECENT_REQUESTS) {
    const requestsArray = Array.from(recentRequests);
    const toRemove = requestsArray.slice(0, requestsArray.length - MAX_RECENT_REQUESTS);
    toRemove.forEach(id => recentRequests.delete(id));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar parâmetros necessários
    const { matricula, pass, empregador, valor_pedido, taxa, valor_descontar, mes_corrente, chave_pix, request_id } = body;
    
    if (!matricula || !pass || !empregador || !valor_pedido || !taxa || !valor_descontar || !mes_corrente || !chave_pix) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Todos os campos são obrigatórios' 
        },
        { status: 400 }
      );
    }
    
    // Verificar se esta solicitação já foi processada recentemente (evitar duplicação)
    if (request_id && recentRequests.has(request_id)) {
      console.log('Solicitação duplicada detectada e ignorada:', request_id);
      return NextResponse.json(
        { 
          success: true, 
          message: 'Solicitação já processada anteriormente'
        }
      );
    }
    
    // Preparar os dados para enviar ao backend
    const payload = new URLSearchParams();
    payload.append('matricula', matricula);
    payload.append('pass', pass);
    payload.append('empregador', empregador.toString());
    payload.append('valor_pedido', valor_pedido.toString());
    payload.append('taxa', taxa.toString());
    payload.append('valor_descontar', valor_descontar.toString());
    payload.append('mes_corrente', mes_corrente);
    payload.append('chave_pix', chave_pix);
    
    console.log('Enviando solicitação de antecipação:', {
      matricula,
      empregador: empregador.toString(),
      valor_pedido: valor_pedido.toString(),
      taxa: taxa.toString(),
      valor_descontar: valor_descontar.toString(),
      mes_corrente,
      chave_pix
    });
    
    // Enviar a requisição para o backend
    const response = await axios.post(
      'https://qrcred.makecard.com.br/grava_antecipacao_app.php',
      payload,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000, // 10 segundos de timeout
      }
    );
    
    console.log('Resposta da API de antecipação:', response.data);
    
    // Registrar esta solicitação como processada para evitar duplicações
    if (request_id) {
      recentRequests.add(request_id);
      cleanupOldRequests();
    }
    
    // Verificar a resposta
    if (response.data && response.data.success) {
      return NextResponse.json(response.data);
    } else {
      // Se a API retornou algum erro específico
      return NextResponse.json(
        response.data || { success: false, message: 'Erro desconhecido no processamento da solicitação' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erro na API de antecipação:', error);
    
    let errorMessage = 'Erro ao processar a requisição';
    let statusCode = 500;
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout na conexão com o servidor';
      } else if (error.response) {
        statusCode = error.response.status;
        errorMessage = `Erro ${statusCode} do servidor`;
        console.log('Dados do erro:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Sem resposta do servidor';
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage, 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: statusCode }
    );
  }
} 