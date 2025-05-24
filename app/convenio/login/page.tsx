'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaUserCircle, FaChevronDown, FaTrash, FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Header from '@/app/components/Header';
import Logo from '@/app/components/Logo';
import { Dialog, Transition } from '@headlessui/react';
import { X, Loader2 } from 'lucide-react';
import { useTranslations } from '@/app/contexts/LanguageContext';

interface UsuarioSalvo {
  usuario: string;
  ultima_data: Date;
}

export default function LoginConvenio() {
  const router = useRouter();
  const t = useTranslations('ConvenioLogin');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    usuario: '',
    senha: ''
  });
  const [usuariosSalvos, setUsuariosSalvos] = useState<UsuarioSalvo[]>([]);
  const [mostrarUsuariosSalvos, setMostrarUsuariosSalvos] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Estados para recuperação de senha
  const [mostrarRecuperacao, setMostrarRecuperacao] = useState(false);
  const [usuarioRecuperacao, setUsuarioRecuperacao] = useState('');
  const [codigoRecuperacao, setCodigoRecuperacao] = useState('');
  const [etapaRecuperacao, setEtapaRecuperacao] = useState<'usuario' | 'codigo' | 'nova_senha'>('usuario');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [enviandoNovaSenha, setEnviandoNovaSenha] = useState(false);
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState('');
  const [destinoMascarado, setDestinoMascarado] = useState('');
  const [tokenRecuperacao, setTokenRecuperacao] = useState('');
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);

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
    router.push('/');
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
          
          toast.success(t.login_success_toast || 'Login efetuado com sucesso!');
        }
        router.push('/convenio/dashboard');
      } else {
        toast.error(data.message || (t.login_error_generic || 'Erro ao fazer login'));
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error(t.connection_error || 'Erro ao conectar com o servidor. Tente novamente mais tarde.');
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
    toast.success(t.user_removed_toast || 'Usuário removido');
  };

  // Função para abrir o modal de recuperação de senha
  const abrirModalRecuperacao = (e: React.MouseEvent) => {
    e.preventDefault();
    setMostrarRecuperacao(true);
    resetarFormularioRecuperacao();
  };

  // Função para resetar o formulário de recuperação
  const resetarFormularioRecuperacao = () => {
    setUsuarioRecuperacao('');
    setCodigoRecuperacao('');
    setNovaSenha('');
    setConfirmacaoSenha('');
    setEtapaRecuperacao('usuario');
    setTokenRecuperacao('');
    setDestinoMascarado('');
    setMensagemRecuperacao('');
  };

  // Função para voltar etapa da recuperação
  const voltarEtapaRecuperacao = () => {
    if (etapaRecuperacao === 'codigo') {
      setEtapaRecuperacao('usuario');
    } else if (etapaRecuperacao === 'nova_senha') {
      setEtapaRecuperacao('codigo');
    }
    setMensagemRecuperacao('');
  };

  // Função para solicitar código de recuperação
  const handleRecuperarSenha = async () => {
    if (!usuarioRecuperacao) {
      setMensagemRecuperacao(t.please_inform_user || 'Por favor, informe o usuário');
      return;
    }
    
    setEnviandoRecuperacao(true);
    setMensagemRecuperacao('');
    
    try {
      console.log(`Solicitando código de recuperação para usuário: ${usuarioRecuperacao}`);
      
      // Chamar a API de recuperação de senha
      const response = await fetch('/api/convenio/recuperacao-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: usuarioRecuperacao })
      });
      
      const result = await response.json();
      console.log('Resposta da solicitação de código:', result);
      
      if (result.success) {
        // Atualizar mensagem e mostrar campo para código
        setMensagemRecuperacao(result.message || 'Código enviado com sucesso');
        setDestinoMascarado(result.destino);
        
        // Mover para próxima etapa (validação de código)
        setTimeout(() => {
          setEtapaRecuperacao('codigo');
        }, 1500);
      } else {
        const errorMsg = result.message || 'Erro ao solicitar recuperação de senha';
        console.error('Erro detalhado:', errorMsg);
        setMensagemRecuperacao(errorMsg);
      }
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      setMensagemRecuperacao('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setEnviandoRecuperacao(false);
    }
  };

  // Função para validar o código de recuperação
  const handleValidarCodigo = async () => {
    if (!codigoRecuperacao || codigoRecuperacao.length < 6) {
      setMensagemRecuperacao('Por favor, informe o código de verificação completo');
      return;
    }
    
    setEnviandoCodigo(true);
    setMensagemRecuperacao('');
    
    try {
      // Chamar a API de validação do código
      const response = await fetch('/api/convenio/validar-codigo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: usuarioRecuperacao,
          codigo: codigoRecuperacao
        })
      });
      
      const result = await response.json();
      console.log('Resposta da validação de código:', result);
      
      if (result.success) {
        // Salvar o token e avançar para a próxima etapa
        setTokenRecuperacao(result.token);
        setMensagemRecuperacao('Código validado com sucesso. Agora defina sua nova senha.');
        // Mover para a etapa final (nova senha)
        setTimeout(() => {
          setEtapaRecuperacao('nova_senha');
          setMensagemRecuperacao('');
        }, 1500);
      } else {
        setMensagemRecuperacao(result.message || 'Código inválido ou expirado.');
      }
    } catch (error) {
      console.error('Erro ao validar código:', error);
      setMensagemRecuperacao('Erro ao validar código. Tente novamente.');
    } finally {
      setEnviandoCodigo(false);
    }
  };

  // Função para definir a nova senha
  const handleDefinirNovaSenha = async () => {
    if (!novaSenha) {
      setMensagemRecuperacao('Por favor, informe a nova senha');
      return;
    }
    
    if (novaSenha.length < 6) {
      setMensagemRecuperacao('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    if (novaSenha !== confirmacaoSenha) {
      setMensagemRecuperacao('As senhas não conferem');
      return;
    }
    
    setEnviandoNovaSenha(true);
    setMensagemRecuperacao('');
    
    try {
      // Chamar a API de redefinição de senha
      const response = await fetch('/api/convenio/redefinir-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: usuarioRecuperacao,
          senha: novaSenha,
          token: tokenRecuperacao
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMensagemRecuperacao('Senha redefinida com sucesso!');
        
        // Após 3 segundos, fechar o modal e limpar os campos
        setTimeout(() => {
          setMostrarRecuperacao(false);
          resetarFormularioRecuperacao();
          // Preencher o campo de usuário no formulário de login
          setFormData({...formData, usuario: usuarioRecuperacao, senha: ''});
        }, 3000);
      } else {
        setMensagemRecuperacao(result.message || 'Erro ao redefinir senha.');
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setMensagemRecuperacao('Erro ao redefinir senha. Tente novamente mais tarde.');
    } finally {
      setEnviandoNovaSenha(false);
    }
  };

  // Função para mascarar o email
  const mascaraEmail = (email: string): string => {
    if (!email || email.indexOf('@') === -1) return '***@***.com';
    
    const [usuario, dominio] = email.split('@');
    const dominioPartes = dominio.split('.');
    const extensao = dominioPartes.pop() || '';
    const nomeUsuarioMascarado = usuario.substring(0, Math.min(2, usuario.length)) + '***';
    const nomeDominioMascarado = dominioPartes.join('.').substring(0, Math.min(2, dominioPartes.join('.').length)) + '***';
    
    return `${nomeUsuarioMascarado}@${nomeDominioMascarado}.${extensao}`;
  };

  // Modal de recuperação de senha
  const renderRecuperacaoSenha = () => {
    if (!mostrarRecuperacao) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-600">
                                {etapaRecuperacao === 'usuario' && (t.password_recovery_title || 'Recuperação de Senha')}                {etapaRecuperacao === 'codigo' && (t.code_verification_title || 'Verificação de Código')}                {etapaRecuperacao === 'nova_senha' && (t.new_password_title || 'Definir Nova Senha')}
              </h3>
              <button 
                onClick={() => setMostrarRecuperacao(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {mensagemRecuperacao && (
              <div className={`p-3 mb-4 rounded ${
                mensagemRecuperacao.includes('sucesso') || mensagemRecuperacao.includes('enviado')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                <p>{mensagemRecuperacao}</p>
                {destinoMascarado && etapaRecuperacao === 'codigo' && (
                  <p className="text-sm mt-1">
                    Enviado para: <span className="font-semibold">{destinoMascarado}</span>
                  </p>
                )}
              </div>
            )}

            {etapaRecuperacao === 'usuario' && (
              <div>
                <div className="mb-4">
                                    <label htmlFor="usuarioRecuperacao" className="block text-sm font-medium text-gray-700 mb-1">                    {t.username_recovery_label || 'Nome de Usuário'}                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="usuarioRecuperacao"
                      value={usuarioRecuperacao}
                      onChange={(e) => setUsuarioRecuperacao(e.target.value)}
                      placeholder={t.username_recovery_placeholder || 'Digite seu nome de usuário'}
                      className="block w-full pl-10 py-2 sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                                    <p className="text-xs text-gray-500 mt-1">                    {t.username_recovery_info || 'Informe o nome de usuário cadastrado. Enviaremos um código de recuperação para o email do conveniado.'}                  </p>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={handleRecuperarSenha}
                    disabled={enviandoRecuperacao || !usuarioRecuperacao}
                    className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                      (enviandoRecuperacao || !usuarioRecuperacao) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {enviandoRecuperacao ? (
                      <span className="flex items-center">
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        {t.sending_button || 'Enviando...'}
                      </span>
                    ) : (
                                              t.send_code_button || 'Enviar Código'
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {etapaRecuperacao === 'codigo' && (
              <div>
                <div className="mb-4">
                                    <label htmlFor="codigoRecuperacao" className="block text-sm font-medium text-gray-700 mb-1">                    {t.verification_code_label || 'Código de Verificação'}                  </label>
                  <input
                    type="text"
                    id="codigoRecuperacao"
                    value={codigoRecuperacao}
                    onChange={(e) => setCodigoRecuperacao(e.target.value.replace(/\D/g, ''))}
                    placeholder={t.verification_code_placeholder || 'Digite o código de 6 dígitos'}
                    maxLength={6}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Digite o código de 6 dígitos enviado para {destinoMascarado || 'seu email cadastrado'}.
                  </p>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={voltarEtapaRecuperacao}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >                    {t.back_button || 'Voltar'}                  </button>                  <button                    type="button"                    onClick={handleValidarCodigo}
                    disabled={enviandoCodigo || !codigoRecuperacao || codigoRecuperacao.length < 6}
                    className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                      (enviandoCodigo || !codigoRecuperacao || codigoRecuperacao.length < 6) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {enviandoCodigo ? (
                      <span className="flex items-center">
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        {t.verifying_button || 'Verificando...'}
                      </span>
                    ) : (
                                              t.verify_code_button || 'Verificar Código'
                    )}
                  </button>
                </div>
              </div>
            )}

            {etapaRecuperacao === 'nova_senha' && (
              <div>
                <div className="mb-4">
                                    <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700 mb-1">                    {t.new_password_label || 'Nova senha'}                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={mostrarNovaSenha ? "text" : "password"}
                      id="novaSenha"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder={t.new_password_placeholder || 'Mínimo de 6 caracteres'}
                      className="block w-full pl-10 pr-10 py-2 sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    >
                      {mostrarNovaSenha ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                                    <label htmlFor="confirmacaoSenha" className="block text-sm font-medium text-gray-700 mb-1">                    {t.confirm_password_label || 'Confirmar senha'}                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={mostrarConfirmacaoSenha ? "text" : "password"}
                      id="confirmacaoSenha"
                      value={confirmacaoSenha}
                      onChange={(e) => setConfirmacaoSenha(e.target.value)}
                      placeholder={t.confirm_password_placeholder || 'Repita a mesma senha'}
                      className="block w-full pl-10 pr-10 py-2 sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setMostrarConfirmacaoSenha(!mostrarConfirmacaoSenha)}
                    >
                      {mostrarConfirmacaoSenha ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={voltarEtapaRecuperacao}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >                    {t.back_button || 'Voltar'}                  </button>                  <button                    type="button"                    onClick={handleDefinirNovaSenha}
                    disabled={enviandoNovaSenha || !novaSenha || novaSenha !== confirmacaoSenha || novaSenha.length < 6}
                    className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                      (enviandoNovaSenha || !novaSenha || novaSenha !== confirmacaoSenha || novaSenha.length < 6) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {enviandoNovaSenha ? (
                      <span className="flex items-center">
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        {t.saving_button || 'Salvando...'}
                      </span>
                    ) : (
                                              t.save_new_password_button || 'Salvar Nova Senha'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title={t.page_title || "Login do Convênio"} showBackButton onBackClick={handleVoltar} />
      
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Logo size="lg" />
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">              {t.form_title || "Login do Convênio"}            </h2>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                                <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">                  {t.user_label || "Usuário"}                </label>
                <div className="mt-1 relative">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="usuario"
                      name="usuario"
                      type="text"
                      placeholder={t.user_placeholder || "Usuário"}
                      required
                      value={formData.usuario}
                      onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                      className="block w-full pl-10 pr-10 py-2 sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {isMounted && usuariosSalvos.length > 0 && (
                      <div className="absolute inset-y-0 right-0 flex items-center">
                        <button
                          type="button"
                          onClick={() => setMostrarUsuariosSalvos(!mostrarUsuariosSalvos)}
                          className="h-full pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          <FaChevronDown className={`transition-transform ${mostrarUsuariosSalvos ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>
                  
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
                                <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">                  {t.password_label || "Senha"}                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                                          placeholder={t.password_placeholder || "Senha"}
                    required
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="block w-full pl-10 py-2 sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    t.submit_button || 'Entrar'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={abrirModalRecuperacao}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {t.forgot_password_link || "Esqueci minha senha"}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => router.push('/convenio/cadastro')}
                className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
              >
                {t.register_link || "Não tem cadastro? Clique aqui para se cadastrar"}
              </button>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 pt-6">
            <p>{t.footer_text || `© ${new Date().getFullYear()} QRCred. Todos os direitos reservados.`}</p>
          </div>
        </div>
      </div>
      
      {renderRecuperacaoSenha()}
    </div>
  );
} 