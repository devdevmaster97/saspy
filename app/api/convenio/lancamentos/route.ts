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

    // Criar parâmetros para a API PHP
    const params = new URLSearchParams();
    params.append('cod_convenio', codConvenio.toString());

    console.log('Solicitando lançamentos para o convênio:', codConvenio);
    console.log('URL completa:', `https://qrcred.makecard.com.br/listar_lancamentos_convenio_app.php?${params.toString()}`);

    // Fazer a requisição para a API PHP
    const response = await axios.get(
      'https://qrcred.makecard.com.br/listar_lancamentos_convenio_app.php',
      {
        params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Resposta API Lançamentos (status):', response.status);
    console.log('Resposta API Lançamentos (estrutura):', {
      success: response.data.success,
      message: response.data.message,
      quantidadeLancamentos: response.data.lancamentos?.length || 0
    });
    
    // Verificar lançamentos futuros (possível erro)
    if (response.data.lancamentos && response.data.lancamentos.length > 0) {
      const dataAtual = new Date();
      const lancamentosFuturos = response.data.lancamentos.filter((lancamento: any) => {
        try {
          // Assumindo que a data está no formato DD/MM/AAAA
          const [dia, mes, ano] = lancamento.data.split('/').map(Number);
          const dataLancamento = new Date(ano, mes - 1, dia);
          const eFuturo = dataLancamento > dataAtual;
          
          if (eFuturo) {
            console.log('ALERTA: Lançamento com data futura encontrado:', {
              id: lancamento.id,
              data: lancamento.data,
              hora: lancamento.hora,
              associado: lancamento.associado,
              valor: lancamento.valor,
              empregador: lancamento.empregador,
              mes: lancamento.mes
            });
          }
          
          return eFuturo;
        } catch (e) {
          console.error('Erro ao analisar data do lançamento:', e);
          return false;
        }
      });
      
      console.log(`Encontrados ${lancamentosFuturos.length} lançamentos com data futura`);
      
      // Verificar campos que podem indicar que um registro é um estorno
      const possiveisEstornos = response.data.lancamentos.filter((lancamento: any) => {
        return lancamento.hasOwnProperty('data_estorno') || 
               lancamento.hasOwnProperty('hora_estorno') || 
               lancamento.hasOwnProperty('func_estorno');
      });
      
      if (possiveisEstornos.length > 0) {
        console.log(`ATENÇÃO: Encontrados ${possiveisEstornos.length} registros que parecem ser estornos`);
        console.log('Exemplo de registro que parece ser estorno:', possiveisEstornos[0]);
      }
      
      // Verificar se há registro para abril de 2025
      const registrosAbril2025 = response.data.lancamentos.filter((lancamento: any) => {
        return lancamento.data.includes('2025') || lancamento.mes.includes('ABR/2025');
      });
      
      if (registrosAbril2025.length > 0) {
        console.log('ATENÇÃO: Encontrados registros para 2025:', registrosAbril2025.length);
        registrosAbril2025.forEach((l: any) => {
          console.log(`- ID: ${l.id}, Data: ${l.data}, Mês: ${l.mes}, Valor: ${l.valor}, Associado: ${l.associado}`);
        });
      }
    }

    if (response.data.success && response.data.lancamentos) {
      // Não vamos mais filtrar registros com data de 2025,
      // para permitir que meses como ABR/2025 apareçam na listagem
      
      console.log(`Total de lançamentos: ${response.data.lancamentos.length}`);
      
      // Log para verificar quais meses estão disponíveis
      const mesesUnicos = Array.from(new Set(response.data.lancamentos.map((l: any) => l.mes)));
      console.log('Meses disponíveis nos lançamentos:', mesesUnicos);
      
      return NextResponse.json({
        success: true,
        data: response.data.lancamentos
      });
    } else {
      return NextResponse.json({
        success: false,
        message: response.data.message || 'Erro ao buscar lançamentos'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao buscar lançamentos:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar lançamentos' },
      { status: 500 }
    );
  }
} 