import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Dados recebidos na rota API de cancelamento de estorno:', body);

    // Extrair os parâmetros
    const { 
      convenio, 
      lancamento, 
      associado, 
      valor, 
      data: dataEstorno, 
      mes, 
      empregador, 
      parcela 
    } = body;
    
    // Validar parâmetros
    if (!lancamento || !convenio || !associado || !dataEstorno || !mes) {
      return NextResponse.json(
        { success: false, message: 'Parâmetros inválidos ou incompletos: lancamento, convenio, associado, data e mes são obrigatórios' },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    console.log(`Solicitação de cancelamento de estorno: Lancamento ${lancamento}, Convênio ${convenio}, Associado ${associado}`);

    // Enviar requisição para a API PHP
    const formData = new FormData();
    // Parâmetros obrigatórios
    formData.append('lancamento', lancamento.toString());
    formData.append('convenio', convenio.toString());
    formData.append('associado', associado.toString());
    formData.append('data', dataEstorno.toString());
    formData.append('mes', mes.toString());
    
    // Adicionar os parâmetros opcionais
    if (valor) formData.append('valor', valor.toString());
    if (empregador) formData.append('empregador', empregador.toString());
    if (parcela) formData.append('parcela', parcela.toString());

    // Fazer a requisição para a API de exclusão de estorno
    const response = await fetch('https://qrcred.makecard.com.br/excluir_estorno_app.php', {
      method: 'POST',
      body: formData,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      // Se a resposta não for JSON, tentar obter o texto
      const textResponse = await response.text();
      responseData = { success: false, message: `Resposta inválida da API: ${textResponse}` };
    }

    console.log('Resposta da API de exclusão de estorno:', responseData);
    
    // Se responseData tiver os campos de sucesso e mensagem, use-os na resposta
    if (responseData && typeof responseData === 'object') {
      return NextResponse.json(
        {
          success: responseData.success !== undefined ? responseData.success : true,
          message: responseData.message || 'Estorno cancelado com sucesso',
          data: { lancamento, responseData }
        },
        { 
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }
    
    // Resposta padrão caso não possamos interpretar a resposta da API
    return NextResponse.json(
      {
        success: true,
        message: 'Estorno cancelado com sucesso',
        data: { lancamento }
      },
      { 
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Erro ao cancelar estorno:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
} 