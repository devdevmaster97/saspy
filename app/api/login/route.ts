import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Ler os dados do corpo da requisição
    const formData = await request.formData();
    const cartao = formData.get('cartao');
    const senha = formData.get('senha');

    // Log para diagnóstico
    console.log('API local recebeu requisição de login para cartão:', cartao);

    // Verificar se os dados estão presentes
    if (!cartao || !senha) {
      console.log('Erro: Cartão ou senha ausentes');
      return NextResponse.json(
        { error: 'Cartão e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Limpar o cartão de possíveis formatações
    const cartaoLimpo = String(cartao).replace(/\D/g, '').trim();
    const senhaLimpa = String(senha).trim();
    
    console.log('Cartão após limpeza:', cartaoLimpo);
    console.log('Iniciando autenticação com o servidor externo');

    // Preparar os dados para enviar ao backend
    const payload = new URLSearchParams();
    payload.append('cartao', cartaoLimpo);
    payload.append('senha', senhaLimpa);

    console.log('Enviando payload para o backend:', payload.toString());

    try {
      // Enviar a requisição para o backend com configuração explícita
      const response = await axios({
        method: 'post',
        url: 'https://qrcred.makecard.com.br/localiza_associado_app_2.php',
        data: payload,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        timeout: 15000, // 15 segundos de timeout
        validateStatus: function (status) {
          return status >= 200 && status < 500; // aceita status codes entre 200 e 499
        }
      });

      // Log da resposta com tratamento de erro
      if (response.status !== 200) {
        console.log(`Resposta com status não esperado: ${response.status}`);
        console.log('Headers:', response.headers);
        console.log('Dados da resposta:', response.data);
        
        return NextResponse.json(
          { error: `Erro na resposta do servidor: ${response.status}` },
          { status: 500 }
        );
      }

      // Verificar se a resposta tem o formato esperado
      console.log('Resposta do backend recebida com sucesso. Status:', response.status);
      console.log('Resposta completa:', typeof response.data, response.data);

      // Verificação de formato - podemos ter respostas em JSON string ou objeto direto
      let dadosProcessados;
      
      if (typeof response.data === 'string') {
        try {
          dadosProcessados = JSON.parse(response.data);
          console.log('Resposta convertida de string para objeto:', dadosProcessados);
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta string:', parseError);
          return NextResponse.json(
            { error: 'Formato de resposta inválido' },
            { status: 500 }
          );
        }
      } else {
        dadosProcessados = response.data;
      }

      // Confirmar se temos o campo situacao
      if (typeof dadosProcessados.situacao === 'undefined') {
        console.log('Resposta sem campo situacao:', dadosProcessados);
        return NextResponse.json(
          { 
            error: 'Formato de resposta inesperado', 
            details: 'Campo situacao não encontrado',
            data: dadosProcessados 
          },
          { status: 500 }
        );
      }

      // Retornar a resposta para o cliente
      return NextResponse.json(dadosProcessados);
    } catch (axiosError) {
      console.error('Erro específico do axios:', axiosError);
      
      // Tratamento especializado para erros do Axios
      if (axios.isAxiosError(axiosError)) {
        const detalhes = {
          message: axiosError.message,
          code: axiosError.code,
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data
        };
        
        console.log('Detalhes completos do erro axios:', detalhes);
        
        return NextResponse.json(
          { 
            error: 'Erro na comunicação com o servidor', 
            details: detalhes
          },
          { status: 500 }
        );
      }
      
      throw axiosError; // Re-throw para o catch externo se não for um AxiosError
    }
  } catch (error) {
    console.error('Erro geral na API de login:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 