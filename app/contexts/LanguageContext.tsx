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
      ruc_label: 'RUC',
      category_label: 'Categoria',
      category_placeholder: 'Selecione uma categoria',
      cep_label: 'CEP',
      search_button: 'Buscar',
      address_label: 'Endereço',
      number_label: 'Número',
      complement_label: 'Complemento',
      neighborhood_label: 'Bairro',
      state_label: 'Departamento',
      state_placeholder: 'Selecione um departamento',
      city_label: 'Cidade',
      city_placeholder: 'Selecione uma cidade',
      phone_label: 'Telefone',
      mobile_label: 'Celular',
      email_label: 'E-mail',
      responsible_label: 'Responsável',
      submit_button: 'Cadastrar Convênio',
      field_required: 'O campo {field} é obrigatório',
      ruc_required: 'RUC é obrigatório para Pessoa Jurídica',
      cpf_required: 'CPF é obrigatório para Pessoa Física',
      success_message: 'Cadastro realizado com sucesso! Verifique seu e-mail para obter as credenciais.',
      error_message: 'Erro ao realizar cadastro',
      generic_error: 'Erro ao realizar cadastro. Tente novamente.',
      error_loading_categories: 'Erro ao buscar categorias:',
      error_loading_states: 'Erro ao buscar departamentos:',
      error_loading_cities: 'Erro ao buscar cidades:',
      error_loading_cep: 'Erro ao buscar CEP:'
    },
    AssociadoCadastro: {
      page_title: 'Completar meu cadastro',
      form_title: 'Completar meu cadastro',
      card_info_title: 'Informações do Cartão',
      personal_info_title: 'Informações Pessoais',
      contact_info_title: 'Informações de Contato',
      address_info_title: 'Endereço',
      additional_info_title: 'Informações Adicionais',
      card_number_label: 'Número do Cartão',
      registration_label: 'Matrícula',
      code_label: 'Código',
      code_required: 'Este campo é obrigatório',
      full_name_label: 'Nome Completo',
      ci_label: 'C.I.',
      birth_date_label: 'Data de Nascimento',
      email_label: 'E-mail',
      mobile_label: 'Celular',
      mobile_placeholder: 'DDD + número',
      whatsapp_checkbox: 'Este celular tem WhatsApp',
      home_phone_label: 'Telefone Residencial',
      work_phone_label: 'Telefone Comercial',
      cep_label: 'CEP',
      cep_placeholder: 'Apenas números',
      searching_cep: 'Buscando CEP...',
      address_label: 'Endereço',
      number_label: 'Número',
      complement_label: 'Complemento',
      neighborhood_label: 'Bairro',
      state_label: 'Departamento',
      state_placeholder: 'Selecione um departamento',
      city_label: 'Cidade',
      city_placeholder: 'Selecione uma cidade',
      employer_label: 'Empregador',
      employer_placeholder: 'Selecione um empregador',
      workplace_label: 'Local de Trabalho',
      cancel_button: 'Cancelar',
      save_button: 'Salvar Cadastro',
      sending_text: 'Enviando...',
      required_fields_message: 'Por favor, preencha todos os campos obrigatórios.',
      success_message: 'Cadastro realizado com sucesso!',
      loading_employers: 'Carregando...'
    },
    AssociateRegistration: {
      page_title: 'Cadastro de Associado - SASPY',
      // Campos do formulário
      name_label: 'Nome Completo',
      email_label: 'E-mail',
      cellphone_label: 'Celular (com DDD)',
      phone_label: 'Telefone Residencial (com DDD)',
      rg_label: 'C.I.',
      birthdate_label: 'Data de Nascimento',
      zipcode_label: 'Código Postal',
      address_label: 'Endereço',
      number_label: 'Número',
      complement_label: 'Complemento',
      neighborhood_label: 'Bairro',
      city_label: 'Cidade',
      state_label: 'Departamento',
      employer_code_label: 'Matrícula (opcional)',
      employer_label: 'Empresa / Órgão',
      // Placeholders
      name_placeholder: 'Digite seu nome completo',
      email_placeholder: 'seuemail@exemplo.com',
      cellphone_placeholder: 'Ex: 11999998888',
      phone_placeholder: 'Ex: 1133334444 (opcional)',
      rg_placeholder: 'Número do C.I.',
      birthdate_placeholder: 'DD/MM/AAAA',
      zipcode_placeholder: 'Digite o código postal (4 dígitos)',
      address_placeholder: 'Digite seu endereço',
      number_placeholder: 'Digite o número',
      complement_placeholder: 'Apto, bloco, casa (opcional)',
      neighborhood_placeholder: 'Digite o bairro',
      city_placeholder: 'Selecione uma cidade',
      state_placeholder: 'Selecione um departamento',
      employer_code_placeholder: 'Sua matrícula na empresa',
      employer_placeholder: 'Pesquise ou selecione sua empresa',
      // Botões
      submit_button: 'Cadastrar',
      loading_button: 'Cadastrando...',
      back_button: 'Voltar',
      search_cep_button: 'Buscando código postal...',
      // Mensagens
      generic_error_toast: 'Ocorreu um erro. Tente novamente.',
      error_loading_states: 'Erro ao buscar departamentos',
      error_loading_cities: 'Erro ao buscar cidades',
      error_loading_employers: 'Erro ao carregar lista de empregadores',
      invalid_data_format: 'Formato de dados inválido',
      success_modal_title: 'Cadastro Realizado com Sucesso!',
      success_modal_message: 'Seu cadastro foi enviado. Em breve você receberá um e-mail com mais informações.',
      success_modal_button: 'Ir para assinatura digital',
      required_field: 'Campo obrigatório',
      invalid_email: 'E-mail inválido',
      invalid_cep: 'CEP inválido',
      select_employer_error: 'Selecione um empregador da lista.',
      search_employer_placeholder: 'Digite para pesquisar empregador...'
    },
    ConvenioDashboard: {
      // Página Principal do Dashboard
      dashboard_title: 'Panel de Control',
      overview_subtitle: 'Resumen de su convenio',
      loading_data: 'Cargando datos del convenio...',
      quick_actions_title: 'Acciones Rápidas',
      
      // Cards de Estatísticas
      total_lancamentos_label: 'Total de Transacciones',
      total_vendas_label: 'Total de Ventas',
      total_estornos_label: 'Total de Reversiones',
      total_associados_label: 'Total de Asociados',
      
      // Menu do Layout
      sidebar_title: 'Panel de Convenio',
      menu_dashboard: 'Panel de Control',
      menu_lancamentos: 'Transacciones',
      menu_meus_dados: 'Mis Datos',
      menu_estornos: 'Reversiones',
      menu_relatorios: 'Reportes',
      menu_logout: 'Salir',
      
      // Ações Rápidas
      novo_lancamento_label: 'Nueva Transacción',
      relatorio_vendas_label: 'Reporte de Ventas',
      estornos_label: 'Reversiones',
      meus_dados_label: 'Mis Datos',
      
      // Mensagens de erro/carregamento
      error_loading_dashboard: 'Error al cargar datos del panel',
      connection_error: 'Error al conectar con el servidor',
      data_load_error: 'No se pudieron obtener los datos del convenio. Redirigiendo al login...',
      logout_error: 'Error al cerrar sesión',
      unauthorized_redirect: 'Error al cargar datos del convenio. Redirigiendo al login...'
    },
    ConvenioMeusDados: {
      // Página Meus Dados
      page_title: 'Mis Datos',
      page_subtitle: 'Visualice y edite la información de su convenio',
      edit_button: 'Editar',
      cancel_button: 'Cancelar',
      save_button: 'Guardar',
      saving_button: 'Guardando...',
      
      // Campos del formulario
      razao_social_label: 'Razón Social',
      nome_fantasia_label: 'Nombre Comercial',
      cnpj_label: 'CNPJ',
      cpf_label: 'CPF',
      codigo_convenio_label: 'Código del Convenio',
      endereco_label: 'Dirección',
      numero_label: 'Número',
      bairro_label: 'Barrio',
      cidade_label: 'Ciudad',
      estado_label: 'Estado',
      cep_label: 'Código Postal',
      telefone_label: 'Teléfono',
      celular_label: 'Celular',
      email_label: 'E-mail',
      contato_label: 'Persona de Contacto',
      
      // Mensajes
      data_not_found: 'No se pudieron cargar los datos del convenio.',
      update_success: '¡Datos actualizados con éxito!',
      update_error: 'Error al actualizar datos',
      fetch_error: 'Erro ao buscar dados do convênio'
    },
    ConvenioLancamentos: {
      // Página de Novo Lançamento
      page_title: 'Novo Lançamento',
      form_title: 'Registrar Novo Pagamento',
      
      // Modal de Confirmação de Pagamento
      payment_confirmed_title: 'Pagamento Confirmado',
      payment_completed_title: 'Pagamento Realizado!',
      payment_value_label: 'Valor',
      installments_info: 'Em {parcelas}x de {valor}',
      client_label: 'Cliente',
      back_to_lancamentos_button: 'Voltar para Lançamentos',
      
      // Modal QR Code
      qr_reader_title: 'Ler QR Code',
      cancel_button: 'Cancelar',
      
      // Seção Dados do Cartão
      card_data_section: 'Dados do Cartão',
      card_number_label: 'Número do Cartão',
      card_number_placeholder: 'Digite o número do cartão',
      qr_code_button: 'QR Code',
      search_button: 'Buscar',
      
      // Informações do Associado
      cardholder_name_label: 'Nome do Titular',
      available_balance_label: 'Saldo Disponível',
      
      // Seção Configuração do Pagamento
      payment_config_section: 'Configuração do Pagamento',
      total_value_label: 'Valor Total da Compra',
      total_value_placeholder: '0,00',
      installments_label: 'Quantidade de Parcelas',
      current_month_label: 'Mês Atual',
      waiting_data: 'Aguardando dados...',
      installment_info_text: 'Pagamento em {parcelas}x de {valor}',
      purchase_description_label: 'Descrição da Compra (opcional)',
      purchase_description_placeholder: 'Descreva os itens ou referência da compra',
      
      // Opções de Parcelas
      installment_option_cash: 'à vista',
      installment_option_multiple: 'parcelas',
      
      // Seção Autorização
      authorization_section: 'Autorização da Transação',
      card_password_label: 'Senha do Cartão',
      card_password_placeholder: 'Digite a senha de 6 dígitos',
      
      // Botões
      authorize_payment_button: 'Autorizar Pagamento',
      
      // Mensagens de erro e validação (podem ser adicionadas quando necessário)
      card_required_error: 'Número do cartão é obrigatório',
      value_required_error: 'Valor é obrigatório',
      password_required_error: 'Senha é obrigatória',
      invalid_card_error: 'Cartão não encontrado',
      insufficient_balance_error: 'Saldo insuficiente',
      payment_success: 'Pagamento autorizado com sucesso!',
      payment_error: 'Erro ao processar pagamento'
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
      ruc_label: 'RUC',
      category_label: 'Categoría',
      category_placeholder: 'Seleccione una categoría',
      cep_label: 'Código Postal',
      search_button: 'Buscar',
      address_label: 'Dirección',
      number_label: 'Número',
      complement_label: 'Complemento',
      neighborhood_label: 'Barrio',
      state_label: 'Departamento',
      state_placeholder: 'Seleccione un departamento',
      city_label: 'Ciudad',
      city_placeholder: 'Seleccione una ciudad',
      phone_label: 'Teléfono',
      mobile_label: 'Celular',
      email_label: 'E-mail',
      responsible_label: 'Responsable',
      submit_button: 'Registrar Convenio',
      field_required: 'El campo {field} es obligatorio',
      ruc_required: 'RUC es obligatorio para Persona Jurídica',
      cpf_required: 'CPF es obligatorio para Persona Física',
      success_message: '¡Registro realizado con éxito! Verifique su e-mail para obtener las credenciales.',
      error_message: 'Error al realizar el registro',
      generic_error: 'Error al realizar el registro. Inténtelo de nuevo.',
      error_loading_categories: 'Error al buscar categorías:',
      error_loading_states: 'Error al buscar departamentos:',
      error_loading_cities: 'Error al buscar ciudades:',
      error_loading_cep: 'Error al buscar código postal:'
    },
    AssociadoCadastro: {
      page_title: 'Completar mi registro',
      form_title: 'Completar mi registro',
      card_info_title: 'Información de la Tarjeta',
      personal_info_title: 'Información Personal',
      contact_info_title: 'Información de Contacto',
      address_info_title: 'Dirección',
      additional_info_title: 'Información Adicional',
      card_number_label: 'Número de Tarjeta',
      registration_label: 'Matrícula',
      code_label: 'Código',
      code_required: 'Este campo es obligatorio',
      full_name_label: 'Nombre Completo',
      ci_label: 'C.I.',
      birth_date_label: 'Fecha de Nacimiento',
      email_label: 'E-mail',
      mobile_label: 'Celular',
      mobile_placeholder: 'Código + número',
      whatsapp_checkbox: 'Este celular tiene WhatsApp',
      home_phone_label: 'Teléfono Residencial',
      work_phone_label: 'Teléfono Comercial',
      cep_label: 'Código Postal',
      cep_placeholder: 'Solo números',
      searching_cep: 'Buscando código postal...',
      address_label: 'Dirección',
      number_label: 'Número',
      complement_label: 'Complemento',
      neighborhood_label: 'Barrio',
      state_label: 'Departamento',
      state_placeholder: 'Selecione un departamento',
      city_label: 'Ciudad',
      city_placeholder: 'Selecione una ciudad',
      employer_label: 'Empleador',
      employer_placeholder: 'Seleccione un empleador',
      workplace_label: 'Lugar de Trabajo',
      cancel_button: 'Cancelar',
      save_button: 'Guardar Registro',
      sending_text: 'Enviando...',
      required_fields_message: 'Por favor, complete todos los campos obligatorios.',
      success_message: '¡Registro completado con éxito!',
      loading_employers: 'Cargando...'
    },
    AssociateRegistration: {
      page_title: 'Registro de Asociado - SASPY',
      // Campos del formulário
      name_label: 'Nombre Completo',
      email_label: 'E-mail',
      cellphone_label: 'Celular (con código de área)',
      phone_label: 'Teléfono Residencial (con código de área)',
      rg_label: 'C.I.',
      birthdate_label: 'Fecha de Nacimiento',
      zipcode_label: 'Código Postal',
      address_label: 'Endereço',
      number_label: 'Número',
      complement_label: 'Complemento',
      neighborhood_label: 'Bairro',
      city_label: 'Cidade',
      state_label: 'Departamento',
      employer_code_label: 'Matrícula (opcional)',
      employer_label: 'Empresa / Organismo',
      // Placeholders
      name_placeholder: 'Ingrese su nombre completo',
      email_placeholder: 'suemail@ejemplo.com',
      cellphone_placeholder: 'Ej: 0981123456',
      phone_placeholder: 'Ej: 021123456 (opcional)',
      rg_placeholder: 'Número del C.I.',
      birthdate_placeholder: 'DD/MM/AAAA',
      zipcode_placeholder: 'Ingrese el código postal (4 dígitos)',
      address_placeholder: 'Ingrese su dirección',
      number_placeholder: 'Ingrese el número',
      complement_placeholder: 'Apto, bloque, casa (opcional)',
      neighborhood_placeholder: 'Ingrese el barrio',
      city_placeholder: 'Seleccione una ciudad',
      state_placeholder: 'Seleccione un departamento',
      employer_code_placeholder: 'Su matrícula en la empresa',
      employer_placeholder: 'Busque o seleccione su empresa',
      // Botões
      submit_button: 'Registrar',
      loading_button: 'Registrando...',
      back_button: 'Volver',
      search_cep_button: 'Buscando código postal...',
      // Mensajes
      generic_error_toast: 'Ocurrió un error. Inténtelo de nuevo.',
      error_loading_states: 'Error al buscar departamentos',
      error_loading_cities: 'Error al buscar ciudades',
      error_loading_employers: 'Error al cargar lista de empleadores',
      invalid_data_format: 'Formato de datos inválido',
      success_modal_title: '¡Registro Realizado con Éxito!',
      success_modal_message: 'Su registro ha sido enviado. Pronto recibirá un e-mail con más información.',
      success_modal_button: 'Ir a firma digital',
      required_field: 'Campo obligatorio',
      invalid_email: 'E-mail inválido',
      invalid_cep: 'Código postal inválido',
      select_employer_error: 'Seleccione un empleador de la lista.',
      search_employer_placeholder: 'Escriba para buscar empleador...'
    },
    ConvenioDashboard: {
      // Página Principal do Dashboard
      dashboard_title: 'Panel de Control',
      overview_subtitle: 'Resumen de su convenio',
      loading_data: 'Cargando datos del convenio...',
      quick_actions_title: 'Acciones Rápidas',
      
      // Cards de Estatísticas
      total_lancamentos_label: 'Total de Transacciones',
      total_vendas_label: 'Total de Ventas',
      total_estornos_label: 'Total de Reversiones',
      total_associados_label: 'Total de Asociados',
      
      // Menu do Layout
      sidebar_title: 'Panel de Convenio',
      menu_dashboard: 'Panel de Control',
      menu_lancamentos: 'Transacciones',
      menu_meus_dados: 'Mis Datos',
      menu_estornos: 'Reversiones',
      menu_relatorios: 'Reportes',
      menu_logout: 'Salir',
      
      // Ações Rápidas
      novo_lancamento_label: 'Nueva Transacción',
      relatorio_vendas_label: 'Reporte de Ventas',
      estornos_label: 'Reversiones',
      meus_dados_label: 'Mis Datos',
      
      // Mensagens de erro/carregamento
      error_loading_dashboard: 'Error al cargar datos del panel',
      connection_error: 'Error al conectar con el servidor',
      data_load_error: 'No se pudieron obtener los datos del convenio. Redirigiendo al login...',
      logout_error: 'Error al cerrar sesión',
      unauthorized_redirect: 'Error al cargar datos del convenio. Redirigiendo al login...'
    },
    ConvenioMeusDados: {
      // Página Meus Dados
      page_title: 'Mis Datos',
      page_subtitle: 'Visualice y edite la información de su convenio',
      edit_button: 'Editar',
      cancel_button: 'Cancelar',
      save_button: 'Guardar',
      saving_button: 'Guardando...',
      
      // Campos del formulario
      razao_social_label: 'Razón Social',
      nome_fantasia_label: 'Nombre Comercial',
      cnpj_label: 'CNPJ',
      cpf_label: 'CPF',
      codigo_convenio_label: 'Código del Convenio',
      endereco_label: 'Dirección',
      numero_label: 'Número',
      bairro_label: 'Barrio',
      cidade_label: 'Ciudad',
      estado_label: 'Estado',
      cep_label: 'Código Postal',
      telefone_label: 'Teléfono',
      celular_label: 'Celular',
      email_label: 'E-mail',
      contato_label: 'Persona de Contacto',
      
      // Mensajes
      data_not_found: 'No se pudieron cargar los datos del convenio.',
      update_success: '¡Datos actualizados con éxito!',
      update_error: 'Error al actualizar datos',
      fetch_error: 'Error al buscar datos del convenio'
    },
    ConvenioLancamentos: {
      // Página de Novo Lançamento
      page_title: 'Nueva Transacción',
      form_title: 'Registrar Nuevo Pago',
      
      // Modal de Confirmação de Pagamento
      payment_confirmed_title: 'Pago Confirmado',
      payment_completed_title: '¡Pago Realizado!',
      payment_value_label: 'Valor',
      installments_info: 'En {parcelas}x de {valor}',
      client_label: 'Cliente',
      back_to_lancamentos_button: 'Volver a Transacciones',
      
      // Modal QR Code
      qr_reader_title: 'Leer Código QR',
      cancel_button: 'Cancelar',
      
      // Seção Dados do Cartão
      card_data_section: 'Datos de la Tarjeta',
      card_number_label: 'Número de Tarjeta',
      card_number_placeholder: 'Ingrese el número de tarjeta',
      qr_code_button: 'Código QR',
      search_button: 'Buscar',
      
      // Informações do Associado
      cardholder_name_label: 'Nombre del Titular',
      available_balance_label: 'Saldo Disponible',
      
      // Seção Configuração do Pagamento
      payment_config_section: 'Configuración del Pago',
      total_value_label: 'Valor Total de la Compra',
      total_value_placeholder: '0,00',
      installments_label: 'Cantidad de Cuotas',
      current_month_label: 'Mes Actual',
      waiting_data: 'Esperando datos...',
      installment_info_text: 'Pago en {parcelas}x de {valor}',
      purchase_description_label: 'Descripción de la Compra (opcional)',
      purchase_description_placeholder: 'Describa los artículos o referencia de la compra',
      
      // Opções de Parcelas
      installment_option_cash: 'al contado',
      installment_option_multiple: 'cuotas',
      
      // Seção Autorização
      authorization_section: 'Autorización de la Transacción',
      card_password_label: 'Contraseña de la Tarjeta',
      card_password_placeholder: 'Ingrese la contraseña de 6 dígitos',
      
      // Botões
      authorize_payment_button: 'Autorizar Pago',
      
      // Mensagens de erro e validação
      card_required_error: 'Número de tarjeta es obligatorio',
      value_required_error: 'Valor es obligatorio',
      password_required_error: 'Contraseña es obligatoria',
      invalid_card_error: 'Tarjeta no encontrada',
      insufficient_balance_error: 'Saldo insuficiente',
      payment_success: '¡Pago autorizado con éxito!',
      payment_error: 'Error al procesar pago'
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