import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/app/utils/constants';
import axios from 'axios';

/**
 * API para o usuário fazer seu próprio cadastro
 * @param request Requisição com dados do formulário
 * @returns Resposta com status da operação
 */
export async function POST(request: NextRequest) {
  try {
    // Obtém o FormData da requisição
    const formData = await request.formData();
    
    // Log detalhado dos dados recebidos
    const formDataEntries = Object.fromEntries(formData.entries());
    console.log('Dados recebidos para cadastro:', formDataEntries);
    
    // Verificar campos obrigatórios
    const camposObrigatorios = ['C_nome_assoc', 'C_Email_assoc', 'C_cel_assoc', 'C_codigo_assoc'];
    for (const campo of camposObrigatorios) {
      if (!formData.get(campo)) {
        console.error(`Campo obrigatório não fornecido: ${campo}`);
        return NextResponse.json(
          { success: false, message: `Campo obrigatório não fornecido: ${campo}` },
          { status: 400 }
        );
      }
    }
    
    // Converter FormData para objeto para usar com axios
    const formDataObj: Record<string, string> = {};
    for (const [key, value] of Array.from(formData.entries())) {
      // Converter qualquer tipo para string
      formDataObj[key] = String(value);
    }
    
    const apiUrl = `${API_URL}/associado_cad.php`;
    console.log('Enviando dados para:', apiUrl);
    
    try {
      // Usar axios que lida melhor com respostas problematicas
      const axiosResponse = await axios.post(apiUrl, formDataObj, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('Resposta da API (axios):', axiosResponse.data);
      
      return NextResponse.json(axiosResponse.data || {
        success: true,
        message: 'Cadastro processado com sucesso',
      });
      
    } catch (axiosError: any) {
      console.error('Erro na requisição axios:', axiosError.message);
      
      // Tentar extrair uma mensagem útil da resposta
      let errorMessage = 'Erro ao processar cadastro';
      let errorDetail = '';
      
      if (axiosError.response) {
        console.log('Dados do erro:', axiosError.response.data);
        errorMessage = axiosError.response.data?.message || errorMessage;
        errorDetail = axiosError.response.data?.error || '';
      }
      
      // Verificar se o erro é de CPF duplicado
      if (axiosError.response?.data?.error === 'duplicate_rg' || 
          (typeof errorMessage === 'string' && errorMessage.includes('C.I. já cadastrado'))) {
        return NextResponse.json({
          success: false,
          message: 'C.I. já cadastrado no sistema',
          error: 'duplicate_rg'
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: false,
        message: errorMessage,
        error: errorDetail || axiosError.message
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de cadastro:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor', error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * API para consultar dados de um associado por RG
 * @param request Requisição com o RG do associado
 * @returns Resposta com dados do associado
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rg = searchParams.get('rg');
    
    if (!rg) {
      return NextResponse.json(
        { success: false, message: 'O C.I. é obrigatório' },
        { status: 400 }
      );
    }
    
    console.log('Consultando associado com C.I.:', rg);
    
    try {
      // Usar axios para a consulta
      const response = await axios.get(`${API_URL}/consulta_associado_rg.php`, {
        params: { rg: rg }
      });
      
      console.log('Resposta da API de consulta:', response.data);
      
      return NextResponse.json(response.data);
      
    } catch (axiosError: any) {
      console.error('Erro na consulta por C.I.:', axiosError.message);
      
      let errorMessage = 'Erro ao consultar associado';
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
    console.error('Erro ao processar requisição de consulta de associado:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor', error: String(error) },
      { status: 500 }
    );
  }
} 