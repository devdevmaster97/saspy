import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Tentar obter os dados como FormData
    let cartao;
    try {
      const formData = await request.formData();
      cartao = formData.get('cartao')?.toString();
      console.log('Parâmetros recebidos (FormData):', { cartao });
    } catch (_) {
      // Se não for FormData, tentar como JSON
      const data = await request.json();
      cartao = data.cartao;
      console.log('Parâmetros recebidos (JSON):', { cartao });
    }

    if (!cartao) {
      console.error('Parâmetro cartao não fornecido');
      return NextResponse.json(
        { error: 'Parâmetro cartao é obrigatório' },
        { status: 400 }
      );
    }

    // Preparar requisição para o backend
    const formData = new FormData();
    formData.append('cartao', cartao);

    console.log('Enviando requisição para o backend com cartao:', cartao);

    // Fazer requisição para o backend
    const response = await axios.post(
      'https://saspy.makecard.com.br/meses_corrente_app.php',
      formData
    );

    console.log('Resposta do backend:', response.data);

    // Verificar se a resposta é um array ou objeto vazio
    let responseData;
    if (Array.isArray(response.data)) {
      // Se já é um array, usar diretamente
      responseData = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Se é um objeto e não está vazio
      if (Object.keys(response.data).length === 0) {
        // Objeto vazio, criar um objeto de mês padrão
        const dataAtual = new Date();
        const mes = dataAtual.getMonth();
        const ano = dataAtual.getFullYear();
        const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        
        responseData = [{
          id: '1',
          abreviacao: `${meses[mes]}/${ano}`,
          descricao: `${meses[mes]}/${ano}`,
          atual: 'S'
        }];
        console.log('Criando objeto de mês padrão:', responseData);
      } else {
        // Objeto não vazio, converter para array
        responseData = [response.data];
        console.log('Convertendo objeto para array:', responseData);
      }
    } else {
      // Resposta inválida, criar um objeto de mês padrão
      const dataAtual = new Date();
      const mes = dataAtual.getMonth();
      const ano = dataAtual.getFullYear();
      const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      
      responseData = [{
        id: '1',
        abreviacao: `${meses[mes]}/${ano}`,
        descricao: `${meses[mes]}/${ano}`,
        atual: 'S'
      }];
      console.log('Criando objeto de mês padrão para resposta inválida:', responseData);
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erro na requisição:', error);
    
    // Em caso de erro, retornar um objeto de mês padrão
    const dataAtual = new Date();
    const mes = dataAtual.getMonth();
    const ano = dataAtual.getFullYear();
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    
    const responseData = [{
      id: '1',
      abreviacao: `${meses[mes]}/${ano}`,
      descricao: `${meses[mes]}/${ano}`,
      atual: 'S'
    }];
    
    console.log('Retornando objeto de mês padrão após erro:', responseData);
    return NextResponse.json(responseData);
  }
} 