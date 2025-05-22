import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Obter o token do cookie
    const cookieStore = cookies();
    const encodedToken = cookieStore.get('convenioToken')?.value;

    if (!encodedToken) {
      return NextResponse.json(
        { success: false, message: 'Token não encontrado' },
        { status: 401 }
      );
    }

    // Decodificar o token para obter as credenciais
    let tokenData;
    try {
      tokenData = JSON.parse(atob(encodedToken));
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Criar parâmetros no formato form-urlencoded para enviar para a API PHP
    const params = new URLSearchParams();
    params.append('userconv', tokenData.user);
    params.append('passconv', tokenData.senha);
    params.append('cod_convenio', tokenData.id);

    // Usar a API de autenticação que já retorna dados do convênio
    const response = await axios.post('https://saspy.makecard.com.br/convenio_autenticar_app.php', 
      params, 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Verificar se a resposta foi bem-sucedida
    if (response.data && response.data.tipo_login === 'login sucesso') {
      // Buscar dados adicionais para o dashboard se necessário
      // Por enquanto, vamos simular os dados do dashboard com valores mockados
      // Estes valores podem ser substituídos por dados reais quando a API estiver disponível
      
      return NextResponse.json({
        success: true,
        data: {
          totalLancamentos: response.data.total_lancamentos || 0,
          totalVendas: response.data.total_vendas || 0,
          totalEstornos: response.data.total_estornos || 0,
          totalAssociados: response.data.total_associados || 0
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Sessão expirada ou inválida'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}