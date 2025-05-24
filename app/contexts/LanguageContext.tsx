'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'pt-BR' | 'es';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: any;
}

// Traduções estáticas
const translations = {
  'pt-BR': {
    Menu: {
      associate_area: 'Área do Associado',
      partner_area: 'Área do Convênio',
      privacy_policy: 'Política de Privacidade',
      version: 'Versão'
    },
    Login: {
      page_title: 'Login do Associado',
      toast_error: 'Erro ao realizar login',
      footer_text: `© ${new Date().getFullYear()} SASPY. Todos os direitos reservados.`
    },
    LoginForm: {
      card_label: 'Cartão',
      card_required_error: 'Cartão é obrigatório',
      password_label: 'Senha',
      password_required_error: 'Senha é obrigatória',
      submit_button: 'Entrar',
      loading_text: 'Autenticando...',
      generic_error: 'Erro de conexão. Verifique sua internet.',
      hello_user: 'Olá',
      forgot_password_link: 'Esqueceu sua senha?',
      recover_password_title: 'Recuperar Senha',
      card_number_label: 'Número do Cartão',
      continue_button: 'Continuar',
      cancel_button: 'Cancelar',
      back_button: 'Voltar',
      select_method_title: 'Selecione como deseja receber o código:',
      send_code_button: 'Enviar Código',
      code_sent_message: 'Enviamos um código para',
      verification_code_label: 'Código de Verificação',
      verify_code_button: 'Verificar Código',
      new_password_label: 'Nova Senha',
      confirm_password_label: 'Confirmar Nova Senha',
      redefine_password_button: 'Redefinir Senha',
      password_mismatch_error: 'As senhas não coincidem.',
      invalid_code_error: 'Código inválido ou expirado.',
      password_changed_success: 'Senha alterada com sucesso!',
      email_option: 'E-mail',
      sms_option: 'SMS (Celular)',
      whatsapp_option: 'WhatsApp',
      search_employer_placeholder: 'Digite para pesquisar empregador...'
    },
    ConvenioLogin: {
      page_title: 'Login do Convênio',
      form_title: 'Login do Convênio',
      user_label: 'Usuário',
      user_placeholder: 'Usuário',
      password_label: 'Senha',
      password_placeholder: 'Senha',
      submit_button: 'Entrar',
      forgot_password_link: 'Esqueci minha senha',
      register_link: 'Não tem cadastro? Clique aqui para se cadastrar',
      footer_text: `© ${new Date().getFullYear()} QRCred. Todos os direitos reservados.`,
      user_removed_toast: 'Usuário removido',
      login_success_toast: 'Login efetuado com sucesso!',
      login_error_generic: 'Erro ao fazer login',
      connection_error: 'Erro ao conectar com o servidor. Tente novamente mais tarde.',
      password_recovery_title: 'Recuperação de Senha',
      code_verification_title: 'Verificação de Código',
      new_password_title: 'Definir Nova Senha',
      username_recovery_label: 'Nome de Usuário',
      username_recovery_placeholder: 'Digite seu nome de usuário',
      username_recovery_info: 'Informe o nome de usuário cadastrado. Enviaremos um código de recuperação para o email do conveniado.',
      please_inform_user: 'Por favor, informe o usuário',
      sending_button: 'Enviando...',
      send_code_button: 'Enviar Código',
      verification_code_label: 'Código de Verificação',
      verification_code_placeholder: 'Digite o código de 6 dígitos',
      verification_code_info: 'Digite o código de 6 dígitos enviado para {email}.',
      sent_to_label: 'Enviado para:',
      back_button: 'Voltar',
      verifying_button: 'Verificando...',
      verify_code_button: 'Verificar Código',
      new_password_label: 'Nova senha',
      new_password_placeholder: 'Mínimo de 6 caracteres',
      confirm_password_label: 'Confirmar senha',
      confirm_password_placeholder: 'Repita a mesma senha',
      saving_button: 'Salvando...',
      save_new_password_button: 'Salvar Nova Senha'
    },
    ConvenioCadastro: {
      page_title: 'Cadastro de Novo Convênio',
      form_title: 'Cadastro de Novo Convênio',
      person_type_label: 'Tipo de Pessoa',
      natural_person: 'Pessoa Física',
      legal_person: 'Pessoa Jurídica',
      company_name_label: 'Razão Social',
      trade_name_label: 'Nome Fantasia',
      cpf_label: 'CPF',
      cnpj_label: 'CNPJ',
      category_label: 'Categoria',
      category_placeholder: 'Selecione uma categoria',
      cep_label: 'CEP',
      search_button: 'Buscar',
      address_label: 'Endereço',
      number_label: 'Número',
      complement_label: 'Complemento',
      neighborhood_label: 'Bairro',
      state_label: 'Estado',
      state_placeholder: 'Selecione um estado',
      city_label: 'Cidade',
      city_placeholder: 'Selecione uma cidade',
      phone_label: 'Telefone',
      mobile_label: 'Celular',
      email_label: 'E-mail',
      responsible_label: 'Responsável',
      submit_button: 'Cadastrar Convênio',
      field_required: 'O campo {field} é obrigatório',
      cnpj_required: 'CNPJ é obrigatório para Pessoa Jurídica',
      cpf_required: 'CPF é obrigatório para Pessoa Física',
      success_message: 'Cadastro realizado com sucesso! Verifique seu e-mail para obter as credenciais.',
      error_message: 'Erro ao realizar cadastro',
      generic_error: 'Erro ao realizar cadastro. Tente novamente.',
      error_loading_categories: 'Erro ao buscar categorias:',
      error_loading_states: 'Erro ao buscar estados:',
      error_loading_cities: 'Erro ao buscar cidades:',
      error_loading_cep: 'Erro ao buscar CEP:'
    }
  },
  'es': {
    Menu: {
      associate_area: 'Área del Asociado',
      partner_area: 'Área del Convenio',
      privacy_policy: 'Política de Privacidad',
      version: 'Versión'
    },
    Login: {
      page_title: 'Login del Asociado',
      toast_error: 'Error al iniciar sesión',
      footer_text: `© ${new Date().getFullYear()} SASPY. Todos los derechos reservados.`
    },
    LoginForm: {
      card_label: 'Tarjeta',
      card_required_error: 'Tarjeta es obligatoria',
      password_label: 'Contraseña',
      password_required_error: 'Contraseña es obligatoria',
      submit_button: 'Entrar',
      loading_text: 'Autenticando...',
      generic_error: 'Error de conexión. Verifique su internet.',
      hello_user: 'Hola',
      forgot_password_link: '¿Olvidaste tu contraseña?',
      recover_password_title: 'Recuperar Contraseña',
      card_number_label: 'Número de Tarjeta',
      continue_button: 'Continuar',
      cancel_button: 'Cancelar',
      back_button: 'Volver',
      select_method_title: 'Seleccione cómo desea recibir el código:',
      send_code_button: 'Enviar Código',
      code_sent_message: 'Enviamos un código a',
      verification_code_label: 'Código de Verificación',
      verify_code_button: 'Verificar Código',
      new_password_label: 'Nueva Contraseña',
      confirm_password_label: 'Confirmar Nueva Contraseña',
      redefine_password_button: 'Restablecer Contraseña',
      password_mismatch_error: 'Las contraseñas no coinciden.',
      invalid_code_error: 'Código inválido o expirado.',
      password_changed_success: '¡Contraseña cambiada con éxito!',
      email_option: 'E-mail',
      sms_option: 'SMS (Celular)',
      whatsapp_option: 'WhatsApp',
      search_employer_placeholder: 'Escriba para buscar empleador...'
    },
    ConvenioLogin: {
      page_title: 'Login del Convenio',
      form_title: 'Login del Convenio',
      user_label: 'Usuario',
      user_placeholder: 'Usuario',
      password_label: 'Contraseña',
      password_placeholder: 'Contraseña',
      submit_button: 'Entrar',
      forgot_password_link: 'Olvidé mi contraseña',
      register_link: '¿No tienes cuenta? Haz clic aquí para registrarte',
      footer_text: `© ${new Date().getFullYear()} QRCred. Todos los derechos reservados.`,
      user_removed_toast: 'Usuario eliminado',
      login_success_toast: '¡Inicio de sesión exitoso!',
      login_error_generic: 'Error al iniciar sesión',
      connection_error: 'Error al conectar con el servidor. Inténtalo de nuevo más tarde.',
      password_recovery_title: 'Recuperación de Contraseña',
      code_verification_title: 'Verificación de Código',
      new_password_title: 'Definir Nueva Contraseña',
      username_recovery_label: 'Nombre de Usuario',
      username_recovery_placeholder: 'Ingresa tu nombre de usuario',
      username_recovery_info: 'Proporciona el nombre de usuario registrado. Enviaremos un código de recuperación al email del convenio.',
      please_inform_user: 'Por favor, proporciona el usuario',
      sending_button: 'Enviando...',
      send_code_button: 'Enviar Código',
      verification_code_label: 'Código de Verificación',
      verification_code_placeholder: 'Ingresa el código de 6 dígitos',
      verification_code_info: 'Ingresa el código de 6 dígitos enviado a {email}.',
      sent_to_label: 'Enviado a:',
      back_button: 'Volver',
      verifying_button: 'Verificando...',
      verify_code_button: 'Verificar Código',
      new_password_label: 'Nueva contraseña',
      new_password_placeholder: 'Mínimo de 6 caracteres',
      confirm_password_label: 'Confirmar contraseña',
      confirm_password_placeholder: 'Repite la misma contraseña',
      saving_button: 'Guardando...',
      save_new_password_button: 'Guardar Nueva Contraseña'
    },
    ConvenioCadastro: {
      page_title: 'Registro de Nuevo Convenio',
      form_title: 'Registro de Nuevo Convenio',
      person_type_label: 'Tipo de Persona',
      natural_person: 'Persona Física',
      legal_person: 'Persona Jurídica',
      company_name_label: 'Razón Social',
      trade_name_label: 'Nombre Comercial',
      cpf_label: 'CPF',
      cnpj_label: 'CNPJ',
      category_label: 'Categoría',
      category_placeholder: 'Seleccione una categoría',
      cep_label: 'Código Postal',
      search_button: 'Buscar',
      address_label: 'Dirección',
      number_label: 'Número',
      complement_label: 'Complemento',
      neighborhood_label: 'Barrio',
      state_label: 'Estado',
      state_placeholder: 'Seleccione un estado',
      city_label: 'Ciudad',
      city_placeholder: 'Seleccione una ciudad',
      phone_label: 'Teléfono',
      mobile_label: 'Celular',
      email_label: 'E-mail',
      responsible_label: 'Responsable',
      submit_button: 'Registrar Convenio',
      field_required: 'El campo {field} es obligatorio',
      cnpj_required: 'CNPJ es obligatorio para Persona Jurídica',
      cpf_required: 'CPF es obligatorio para Persona Física',
      success_message: '¡Registro realizado con éxito! Verifique su e-mail para obtener las credenciales.',
      error_message: 'Error al realizar el registro',
      generic_error: 'Error al realizar el registro. Inténtelo de nuevo.',
      error_loading_categories: 'Error al buscar categorías:',
      error_loading_states: 'Error al buscar estados:',
      error_loading_cities: 'Error al buscar ciudades:',
      error_loading_cep: 'Error al buscar código postal:'
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [locale, setLocale] = useState<Locale>('es');

  // Inicializa o estado com a preferência salva
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('preferred-locale');
      if (savedLocale && (savedLocale === 'pt-BR' || savedLocale === 'es')) {
        setLocale(savedLocale);
      } else {
        // Se não há preferência salva, define espanhol como padrão
        setLocale('es');
        localStorage.setItem('preferred-locale', 'es');
      }
    }
  }, []);

  // Salva a preferência quando o idioma muda
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', locale);
    }
  }, [locale, isClient]);

  return (
    <LanguageContext.Provider value={{ 
      locale, 
      setLocale,
      translations: translations[locale] || translations['es']
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslations(namespace: string) {
  const { translations: currentTranslations } = useLanguage();
  return currentTranslations[namespace] || {};
} 