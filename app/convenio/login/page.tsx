'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaUserCircle, FaChevronDown, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Header from '@/app/components/Header';

interface UsuarioSalvo {
  usuario: string;
  ultima_data: Date;
}

export default function LoginConvenio() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    usuario: '',
    senha: ''
  });
  const [usuariosSalvos, setUsuariosSalvos] = useState<UsuarioSalvo[]>([]);
  const [mostrarUsuariosSalvos, setMostrarUsuariosSalvos] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Carregar usuários salvos quando o componente é montado
  useEffect(() => {
    setIsMounted(true);
    const usuariosSalvosJson = localStorage.getItem('convenioUsuariosSalvos');
    if (usuariosSalvosJson) {
      const usuarios = JSON.parse(usuariosSalvosJson);
      setUsuariosSalvos(usuarios);
    }
  }, []);

  const handleVoltar = () => {
    router.push('/convenio');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/convenio/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Salvar os dados do convênio no localStorage
        if (data.data) {
          localStorage.setItem('dadosConvenio', JSON.stringify(data.data));
          console.log('Dados do convênio salvos no localStorage:', data.data);
          
          // Salvar usuário na lista de usuários recentes
          if (formData.usuario) {
            const novoUsuario: UsuarioSalvo = {
              usuario: formData.usuario,
              ultima_data: new Date()
            };
            
            // Verificar se o usuário já existe
            const usuariosAtualizados = [...usuariosSalvos];
            const usuarioExistenteIndex = usuariosAtualizados.findIndex(
              u => u.usuario === formData.usuario
            );
            
            if (usuarioExistenteIndex >= 0) {
              // Atualizar data do último acesso
              usuariosAtualizados[usuarioExistenteIndex].ultima_data = new Date();
            } else {
              // Adicionar novo usuário
              usuariosAtualizados.push(novoUsuario);
            }
            
            // Manter apenas os 5 usuários mais recentes
            usuariosAtualizados.sort((a, b) => 
              new Date(b.ultima_data).getTime() - new Date(a.ultima_data).getTime()
            );
            
            const usuariosFiltrados = usuariosAtualizados.slice(0, 5);
            setUsuariosSalvos(usuariosFiltrados);
            localStorage.setItem('convenioUsuariosSalvos', JSON.stringify(usuariosFiltrados));
          }
          
          toast.success('Login efetuado com sucesso!');
        }
        router.push('/convenio/dashboard');
      } else {
        toast.error(data.message || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const selecionarUsuario = (usuario: string) => {
    setFormData({ ...formData, usuario });
    setMostrarUsuariosSalvos(false);
  };

  const removerUsuario = (e: React.MouseEvent, usuario: string) => {
    e.stopPropagation();
    const usuariosAtualizados = usuariosSalvos.filter(u => u.usuario !== usuario);
    setUsuariosSalvos(usuariosAtualizados);
    localStorage.setItem('convenioUsuariosSalvos', JSON.stringify(usuariosAtualizados));
    toast.success('Usuário removido');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Login do Convênio" showBackButton onBackClick={handleVoltar} />
      
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Login do Convênio
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
                  Usuário
                </label>
                <div className="mt-1 relative">
                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    required
                    value={formData.usuario}
                    onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                  />
                  {isMounted && usuariosSalvos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMostrarUsuariosSalvos(!mostrarUsuariosSalvos)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    >
                      <FaChevronDown className={`transition-transform ${mostrarUsuariosSalvos ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                  
                  {mostrarUsuariosSalvos && usuariosSalvos.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                      <ul className="py-1">
                        {usuariosSalvos.map((usuarioSalvo, index) => (
                          <li 
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            onClick={() => selecionarUsuario(usuarioSalvo.usuario)}
                          >
                            <div className="flex items-center">
                              <FaUserCircle className="text-gray-400 mr-2" />
                              <span>{usuarioSalvo.usuario}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => removerUsuario(e, usuarioSalvo.usuario)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <FaTrash size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1">
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    required
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin h-5 w-5" />
                  ) : (
                    'Entrar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 