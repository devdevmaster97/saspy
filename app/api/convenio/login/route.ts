import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  console.log('Iniciando processamento de login');
  try {
    const body = await request.json();
    console.log('Corpo da requisição recebido:', { usuario: body.usuario ? '***' : undefined, senha: body.senha ? '***' : undefined });
    const usuario = body.usuario;
    const senha = body.senha;

    if (!usuario || !senha) {
      console.log('Usuário ou senha não fornecidos');
      return NextResponse.json(
        { success: false, message: 'Usuário e senha são obrigatórios' },
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

    // Criar parâmetros no formato form-urlencoded para enviar para a API PHP
    const params = new URLSearchParams();
    params.append('userconv', usuario);
    params.append('passconv', senha);
    console.log('Enviando requisição para API externa');

    // Enviar requisição para o backend
    try {
      const response = await axios.post('https://qrcred.makecard.com.br/convenio_autenticar_app.php', 
        params, 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );

      console.log('Resposta API:', response.status, typeof response.data, response.data ? 'Dados presentes' : 'Sem dados');

      if (response.data && response.data.tipo_login === 'login sucesso') {
        console.log('Login bem-sucedido para o convênio:', response.data.cod_convenio);
        // Criar um token JWT ou qualquer outro identificador único
        const token = btoa(JSON.stringify({
          id: response.data.cod_convenio,
          user: usuario,
          senha: senha,
          timestamp: new Date().getTime()
        }));

        // Salvar o token em um cookie
        try {
          const cookieStore = cookies();
          cookieStore.set('convenioToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 semana
            path: '/',
          });
          console.log('Cookie definido com sucesso');
        } catch (cookieError) {
          console.error('Erro ao definir cookie:', cookieError);
        }

        // Criar a resposta
        const dadosConvenio = {
          cod_convenio: response.data.cod_convenio,
          razaosocial: response.data.razaosocial,
          nome_fantasia: response.data.nomefantasia,
          endereco: response.data.endereco,
          bairro: response.data.bairro,
          cidade: response.data.cidade,
          estado: response.data.estado,
          cnpj: response.data.cnpj,
          cpf: response.data.cpf
        };
        console.log('Enviando resposta de sucesso com dados do convênio');
        
        const resposta = NextResponse.json({
          success: true,
          data: dadosConvenio
        });
        
        // Adicionar headers anti-cache
        resposta.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        resposta.headers.set('Pragma', 'no-cache');
        resposta.headers.set('Expires', '0');
        
        return resposta;
      } else {
        const mensagemErro = response.data?.tipo_login === 'login incorreto' 
          ? 'Usuário ou senha inválidos' 
          : 'Erro ao realizar login';
        console.log('Login falhou:', mensagemErro);
        
        return NextResponse.json({
          success: false,
          message: mensagemErro
        }, { 
          status: 401,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      }
    } catch (apiError: unknown) {
      console.error('Erro na chamada à API externa:', apiError);
      throw new Error(`Erro na conexão com o servidor externo: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
    }
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Erro ao realizar login' },
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