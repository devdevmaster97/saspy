import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Dados recebidos na rota API:', body);

    // Formatação dos dados
    let dataFormatada = body.data;
    if (body.data && body.data.includes('/')) {
      const [dia, mes, ano] = body.data.split('/');
      dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    
    // Formatação do valor
    const valorFormatado = body.valor?.replace(',', '.') || body.valor;
    
    // Obter código do empregador
    const empregadorCodigo = typeof body.empregador === 'number' ? 
      body.empregador : 
      (Number(body.empregador) || 0);

    console.log('Dados formatados:');
    console.log('- Data:', dataFormatada);
    console.log('- Valor:', valorFormatado);
    console.log('- Empregador:', empregadorCodigo, 'tipo:', typeof empregadorCodigo);

    // URL da API
    const url = 'https://qrcred.makecard.com.br/excluir_via_app.php';
    
    // Configurar os dados do payload
    const payload = {
      lancamento: body.lancamento,
      data: dataFormatada,
      empregador: empregadorCodigo,
      valor: valorFormatado,
      mes: body.mes
    };
    
    console.log('Payload final:', payload);

    // Enviar requisição para a API externa
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Resposta da API:', data);
    
    if (data.success) {
      return NextResponse.json({ Resultado: 'excluido' });
    } else if (data.message === 'Mês bloqueado para estorno') {
      return NextResponse.json({ Resultado: 'mes_bloqueado' });
    } else {
      return NextResponse.json({ 
        Resultado: 'nao_excluido',
        message: data.message || 'Erro ao estornar lançamento'
      });
    }
  } catch (error) {
    console.error('Erro ao estornar:', error);
    return NextResponse.json({ 
      Resultado: 'nao_excluido',
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
} 