import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    // Obter o token do cookie
    const cookieStore = request.cookies;
    const convenioToken = cookieStore.get('convenioToken');

    if (!convenioToken) {
      return NextResponse.json(
        { success: false, message: 'Token não encontrado' },
        { status: 401 }
      );
    }

    // Decodificar o token para obter os dados do convênio
    const tokenData = JSON.parse(atob(convenioToken.value));
    const codConvenio = tokenData.id;

    console.log('Solicitando meses disponíveis para relatórios, convênio:', codConvenio);

    // Fazer a requisição para a API PHP
    const response = await axios.get(
      'https://qrcred.makecard.com.br/meses_conta.php',
      {
        params: { origem: 'relatorio' },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Resposta API Meses:', response.status);
    
    // Processar os dados recebidos da API
    if (response.data && Array.isArray(response.data)) {
      console.log(`Recebidos ${response.data.length} registros de meses`);
      
      // Verificar a estrutura dos dados para debug
      if (response.data.length > 0) {
        console.log('Estrutura do primeiro item:', Object.keys(response.data[0]));
      }
      
      // Extrair o mês corrente e os meses disponíveis
      let mesCorrente = '';
      const mesesDisponiveis: string[] = [];
      
      response.data.forEach((item: any, index: number) => {
        if (index === 0 && item.mes_corrente) {
          mesCorrente = item.mes_corrente;
          console.log('Mês corrente encontrado:', mesCorrente);
        } else if (item.abreviacao) {
          mesesDisponiveis.push(item.abreviacao);
        }
      });
      
      // Ordenar meses do mais recente para o mais antigo (assumindo formato MMM/AAAA)
      const mesesOrdenados = mesesDisponiveis.sort().reverse();
      
      console.log('Meses disponíveis ordenados:', mesesOrdenados);
      
      return NextResponse.json({
        success: true,
        mesCorrente,
        meses: mesesOrdenados
      });
    } else {
      console.log('Resposta da API não é um array ou está vazia');
      return NextResponse.json({
        success: false,
        message: 'Erro ao buscar meses disponíveis'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao buscar meses disponíveis:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar meses disponíveis' },
      { status: 500 }
    );
  }
} 