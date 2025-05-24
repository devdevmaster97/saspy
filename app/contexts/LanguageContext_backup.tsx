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
      hello_user: 'Olá', // Usado como "Olá, {nome}"
      forgot_password_link: 'Esqueceu sua senha?',
      // Recuperação de Senha
      recover_password_title: 'Recuperar Senha',
      card_number_label: 'Número do Cartão',
      continue_button: 'Continuar',
      cancel_button: 'Cancelar',
      back_button: 'Voltar',
      select_method_title: 'Selecione como deseja receber o código:',
      send_code_button: 'Enviar Código',
      code_sent_message: 'Enviamos um código para', // Usado como "Enviamos um código para {destinoMascarado}"
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
    AssociateRegistration: {
      page_title: 'Cadastro de Associado - SASPY',
      // Campos do formulário
      name_label: 'Nome Completo',
      cpf_label: 'CPF',
      email_label: 'E-mail',
      cellphone_label: 'Celular (com DDD)',
      phone_label: 'Telefone Residencial (com DDD)',
      rg_label: 'RG',
      birthdate_label: 'Data de Nascimento',
      zipcode_label: 'CEP',
      address_label: 'Endereço',
      number_label: 'Número',
      complement_label: 'Complemento',
      neighborhood_label: 'Bairro',
      city_label: 'Cidade',
      state_label: 'Estado (UF)',
      employer_code_label: 'Matrícula (opcional)',
      employer_label: 'Empresa / Órgão',
      // Placeholders
      name_placeholder: 'Digite seu nome completo',
      cpf_placeholder: 'Digite seu CPF (apenas números)',
      email_placeholder: 'seuemail@exemplo.com',
      cellphone_placeholder: 'Ex: 11999998888',
      phone_placeholder: 'Ex: 1133334444 (opcional)',
      rg_placeholder: 'Digite seu RG (opcional)',
      birthdate_placeholder: 'DD/MM/AAAA',
      zipcode_placeholder: 'Digite o CEP (apenas números)',
      address_placeholder: 'Preenchido automaticamente pelo CEP',
      number_placeholder: 'Digite o número',
      complement_placeholder: 'Apto, bloco, casa (opcional)',
      neighborhood_placeholder: 'Preenchido automaticamente pelo CEP',
      city_placeholder: 'Selecione seu estado primeiro',
      state_placeholder: 'Selecione...',
      employer_code_placeholder: 'Sua matrícula na empresa',
      employer_placeholder: 'Pesquise ou selecione sua empresa',
      // Botões
      submit_button: 'Cadastrar',
      loading_button: 'Cadastrando...',
      back_button: 'Voltar',
      search_cep_button: 'Buscando CEP...',
      // Mensagens
      generic_error_toast: 'Ocorreu um erro. Tente novamente.',
      error_loading_states: 'Erro ao buscar estados',
      error_loading_cities: 'Erro ao buscar cidades',
      error_loading_employers: 'Erro ao carregar lista de empregadores',
      invalid_data_format: 'Formato de dados inválido',
      success_modal_title: 'Cadastro Realizado com Sucesso!',
      success_modal_message: 'Seu cadastro foi enviado. Em breve você receberá um e-mail com mais informações.',
      success_modal_button: 'Ir para Login',
      required_field: 'Campo obrigatório',
      invalid_cpf: 'CPF inválido',
      invalid_email: 'E-mail inválido',
      invalid_cep: 'CEP inválido',
      select_employer_error: 'Selecione um empregador da lista.',
      search_employer_placeholder: 'Digite para pesquisar empregador...'
    },
    Dashboard: {
      page_title: 'Dashboard',
      last_update: 'Última atualização:',
      card_balance_title: 'Saldo do Cartão',
      usage_tips_title: 'Dicas de Uso',
      tip1_title: 'Controle seus gastos',
      tip1_description: 'Acompanhe seus gastos regularmente para manter o controle financeiro.',
      tip2_title: 'Confira novos convênios',
      tip2_description: 'Novos convênios são adicionados frequentemente. Confira a lista completa.',
      tip3_title: 'Use o QR Code para pagamentos rápidos',
      tip3_description: 'Seu QR Code pode ser usado para pagamentos rápidos em estabelecimentos parceiros.'
    },
    SaldoCard: {
      console_error_card_not_provided: 'Cartão não fornecido para buscar mês corrente',
      error_associate_data_not_found: 'Dados do associado não encontrados',
      error_invalid_response_format: 'Formato de resposta inválido',
      error_current_month_not_available: 'Mês corrente não disponível',
      error_load_balance_with_message: 'Não foi possível carregar o saldo: {message}',
      error_load_balance_generic: 'Não foi possível carregar o saldo. Tente novamente.',
      error_user_not_found: 'Usuário não encontrado. Faça login novamente.',
      loading_balance: 'Carregando saldo...',
      error_title: 'Erro',
      retry_button: 'Tentar novamente',
      card_title: 'Seu Saldo',
      refresh_balance_tooltip: 'Atualizar saldo',
      available_balance_label: 'Saldo Disponível',
      month_reference_label: 'Referente ao mês:',
      total_limit_label: 'Limite Total',
      total_used_label: 'Total Utilizado',
      currency_symbol: 'R$',
      currency_code: 'BRL',
      locale_string: 'pt-BR',
      info_title: 'Informações sobre seu saldo',
      info_description: 'O saldo apresentado é baseado no limite disponível para o mês atual. O cálculo é feito subtraindo os gastos do período do seu limite total.',
      attention_title: 'Atenção',
      attention_processing_time: 'Algumas transações podem levar até 24 horas para serem processadas. Para obter informações atualizadas, utilize o botão de atualização.',
      attention_doubts: 'Se você tiver dúvidas sobre seus gastos, consulte a seção de "Extrato" para ver detalhes de todas as suas transações.'
    },
    DashboardLayout: {
      console_error_user_data_processing: 'Erro ao processar dados do usuário:',
      loading_text: 'Carregando...'
    },
    Sidebar: {
      menu_balance: 'Saldo',
      menu_extract: 'Extrato',
      menu_agreements: 'Convênios',
      menu_qrcode: 'QR Code',
      menu_my_data: 'Meus Dados',
      menu_anticipation: 'Antecipação',
      logout_button: 'Sair',
      aria_close_menu: 'Fechar Menu',
      aria_open_menu: 'Abrir Menu',
      user_card_label: 'Cartão:',
      user_agreement_label: 'Convênio:'
    },
    ExtractPage: {      page_title: 'Extrato',      section_title: 'Extrato de Movimentações',      error_card_not_found: 'Não foi possível identificar o cartão. Faça login novamente.'    },    ExtratoTab: {      table_header_date_time: 'Data/Hora',      table_header_establishment: 'Estabelecimento',      table_header_value: 'Valor',      table_header_installment: 'Parcela',      table_header_transaction: 'Lançamento',      total_value: 'Valor Total:',      loading: 'Carregando...',      no_records_found: 'Nenhum registro encontrado',      no_transactions_found: 'Nenhuma transação encontrada neste período'    },    ConveniosPage: {      page_title: 'Convênios',      partner_network_title: 'Rede de Convênios',      search_placeholder: 'Buscar convênios...',      order_alphabetical: 'Ordem Alfabética',      order_recent: 'Mais Recentes',      order_featured: 'Em Destaque',      loading_message: 'Carregando convênios...',      error_loading: 'Não foi possível carregar os convênios',      try_again_button: 'Tentar novamente',      invalid_response_format: 'Formato de resposta inválido',      generic_error: 'Não foi possível carregar os convênios. Tente novamente.'    },    QrCodePage: {      page_title: 'QR Code do Cartão',      loading_message: 'Carregando...',      error_loading_qrcode: 'Erro ao carregar o QR Code. Tente novamente.',      card_number_label: 'Seu número de cartão:',      usage_instruction: 'Apresente este QR Code no estabelecimento para realizar pagamentos'    },    MeusDadosPage: {      page_title: 'Meus Dados',      section_title: 'Meus Dados',      edit_button: 'Editar Dados',      cancel_button: 'Cancelar',      save_button: 'Salvar Alterações',      saving_text: 'Salvando...',      loading_text: 'Carregando seus dados...',      try_again_button: 'Tentar novamente',      login_again_button: 'Fazer login novamente',      name_label: 'Nome',      cpf_label: 'CPF',      email_label: 'Email',      phone_label: 'Celular',      whatsapp_label: 'Este número também é WhatsApp',      cep_label: 'CEP',      address_label: 'Endereço',      number_label: 'Número',      neighborhood_label: 'Bairro',      city_label: 'Cidade',      state_label: 'Estado',      email_placeholder: 'Seu email',      phone_placeholder: '(00) 00000-0000',      cep_placeholder: '00000-000',      number_placeholder: 'Número',      address_placeholder: 'Endereço completo',      neighborhood_placeholder: 'Bairro',      city_placeholder: 'Cidade',      select_state_placeholder: 'Selecione o estado',      error_loading_data: 'Não foi possível carregar seus dados. Tente novamente.',      error_updating_data: 'Não foi possível atualizar seus dados. Tente novamente mais tarde.',      error_no_data_found: 'Nenhum dado encontrado. Faça login novamente.',      success_data_updated: 'Dados atualizados com sucesso!',      name_cannot_change: 'Nome não pode ser alterado',      cpf_cannot_change: 'CPF não pode ser alterado',      not_informed: 'Não informado',      address_not_informed: 'Endereço não informado',      data_updated_footer: 'Dados atualizados. Para modificar suas informações, clique em "Editar Dados".',      loading_associate_data: 'Carregando dados do associado...',      no_login_info: 'Não foi encontrada nenhuma informação de login.',      check_auth_status: 'Verifique se você está corretamente autenticado no sistema.',      full_name_label: 'Nome completo',      full_address_label: 'Endereço completo'
    },
    AntecipacaoPage: {
      page_title: 'Antecipação',
      section_title: 'Solicitação de Antecipação',
      loading_data: 'Carregando...',
      available_balance_title: 'Saldo Disponível:',
      refresh_balance_button: 'Atualizar saldo',
      loading_balance: 'Carregando...',
      month_reference: 'Referente ao mês:',
      status_requests_title: 'Status de Solicitações',
      pending_requests_title: 'Solicitações Pendentes',
      refresh_history_button: 'Atualizar histórico',
      no_requests_found: 'Nenhuma solicitação encontrada',
      view_more_requests: 'Ver mais solicitações',
      status_label: 'Status:',
      month_label: 'Mês:',
      request_sent_title: 'Solicitação Enviada',
      value_label: 'Valor:',
      tax_label: 'Taxa:',
      total_deduct_label: 'Total a Descontar:',
      requested_on_label: 'Solicitado em:',
      analysis_message: 'Sua solicitação está em análise. Em breve você receberá o resultado.',
      new_request_button: 'Nova Solicitação',
      desired_value_label: 'Valor Desejado',
      value_placeholder: 'R$ 0,00',
      value_display_label: 'Valor:',
      simulation_title: 'Simulação:',
      taxes_label: 'Taxas:',
      pix_key_label: 'Chave PIX para Recebimento',
      pix_key_placeholder: 'CPF, E-mail, Celular ou Chave Aleatória',
      password_label: 'Senha (para confirmar)',
      password_placeholder: 'Digite sua senha de acesso ao app',
      password_info: 'Importante: Use a mesma senha do seu login no aplicativo',
      processing_button: 'Processando...',
      submit_button: 'Solicitar Antecipação',
      status_approved: 'Aprovado',
      status_rejected: 'Recusado',
      status_pending: 'Pendente',
      status_analysis: 'Em análise'
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
      footer_text: `© ${new Date().getFullYear()} SASpy. Todos os direitos reservados.`,
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
      // Mensagens de erro e validação
      field_required: 'O campo {field} é obrigatório',
      cnpj_required: 'CNPJ é obrigatório para Pessoa Jurídica',
      cpf_required: 'CPF é obrigatório para Pessoa Física',
      success_message: 'Cadastro realizado com sucesso! Verifique seu e-mail para obter as credenciais.',
      error_message: 'Erro ao realizar cadastro',
      generic_error: 'Erro ao realizar cadastro. Tente novamente.',
      // Logs de erro
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
      hello_user: 'Hola', // Usado como "Hola, {nombre}"
      forgot_password_link: '¿Olvidaste tu contraseña?',
      // Recuperación de Contraseña
      recover_password_title: 'Recuperar Contraseña',
      card_number_label: 'Número de Tarjeta',
      continue_button: 'Continuar',
      cancel_button: 'Cancelar',
      back_button: 'Volver',
      select_method_title: 'Seleccione cómo desea recibir el código:',
      send_code_button: 'Enviar Código',
      code_sent_message: 'Enviamos un código a', // Usado como "Enviamos un código a {destinoMascarado}"
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
    AssociateRegistration: {
      page_title: 'Registro de Asociado - SASPY',
      // Campos del formulario
      name_label: 'Nombre Completo',
      cpf_label: 'CPF (Documento)',
      email_label: 'E-mail',
      cellphone_label: 'Móvil (con código de área)',
      phone_label: 'Teléfono Fijo (con código de área)',
      rg_label: 'RG (Documento Identidad)',
      birthdate_label: 'Fecha de Nacimiento',
      zipcode_label: 'Código Postal',
      address_label: 'Dirección',
      number_label: 'Número',
      complement_label: 'Complemento',
      neighborhood_label: 'Barrio',
      city_label: 'Ciudad',
      state_label: 'Estado (Provincia)',
      employer_code_label: 'Matrícula (opcional)',
      employer_label: 'Empresa / Organismo',
      // Placeholders
      name_placeholder: 'Ingrese su nombre completo',
      cpf_placeholder: 'Ingrese su CPF (solo números)',
      email_placeholder: 'suemail@ejemplo.com',
      cellphone_placeholder: 'Ej: 11999998888',
      phone_placeholder: 'Ej: 1133334444 (opcional)',
      rg_placeholder: 'Ingrese su RG (opcional)',
      birthdate_placeholder: 'DD/MM/AAAA',
      zipcode_placeholder: 'Ingrese el código postal (solo números)',
      address_placeholder: 'Autocompletado por código postal',
      number_placeholder: 'Ingrese el número',
      complement_placeholder: 'Apto, bloque, casa (opcional)',
      neighborhood_placeholder: 'Autocompletado por código postal',
      city_placeholder: 'Seleccione su estado primero',
      state_placeholder: 'Seleccione...',
      employer_code_placeholder: 'Su matrícula en la empresa',
      employer_placeholder: 'Busque o seleccione su empresa',
      // Botones
      submit_button: 'Registrar',
      loading_button: 'Registrando...',
      back_button: 'Volver',
      search_cep_button: 'Buscando Código Postal...',
      // Mensajes
      generic_error_toast: 'Ocurrió un error. Intente nuevamente.',
      error_loading_states: 'Error al buscar estados',
      error_loading_cities: 'Error al buscar ciudades',
      error_loading_employers: 'Error al cargar lista de empleadores',
      invalid_data_format: 'Formato de datos inválido',
      success_modal_title: '¡Registro Exitoso!',
      success_modal_message: 'Su registro ha sido enviado. Pronto recibirá un e-mail con más información.',
      success_modal_button: 'Ir a Login',
      required_field: 'Campo obligatorio',
      invalid_cpf: 'CPF inválido',
      invalid_email: 'E-mail inválido',
      invalid_cep: 'Código Postal inválido',
      select_employer_error: 'Seleccione un empleador de la lista.',
      search_employer_placeholder: 'Escriba para buscar empleador...'
    },
    Dashboard: {
      page_title: 'Panel de Control',
      last_update: 'Última actualización:',
      card_balance_title: 'Saldo de la Tarjeta',
      usage_tips_title: 'Consejos de Uso',
      tip1_title: 'Controla tus gastos',
      tip1_description: 'Realiza un seguimiento regular de tus gastos para mantener el control financiero.',
      tip2_title: 'Consulta nuevos convenios',
      tip2_description: 'Se añaden nuevos convenios con frecuencia. Consulta la lista completa.',
      tip3_title: 'Usa el Código QR para pagos rápidos',
      tip3_description: 'Tu Código QR se puede utilizar para pagos rápidos en establecimientos asociados.'
    },
    SaldoCard: {
      console_error_card_not_provided: 'Tarjeta no proporcionada para buscar el mes actual',
      error_associate_data_not_found: 'Datos del asociado no encontrados',
      error_invalid_response_format: 'Formato de respuesta inválido',
      error_current_month_not_available: 'Mes actual no disponible',
      error_load_balance_with_message: 'No se pudo cargar el saldo: {message}',
      error_load_balance_generic: 'No se pudo cargar el saldo. Inténtalo de nuevo.',
      error_user_not_found: 'Usuario no encontrado. Inicie sesión de nuevo.',
      loading_balance: 'Cargando saldo...',
      error_title: 'Error',
      retry_button: 'Intentar de nuevo',
      card_title: 'Tu Saldo',
      refresh_balance_tooltip: 'Actualizar saldo',
      available_balance_label: 'Saldo Disponible',
      month_reference_label: 'Referente al mes:',
      total_limit_label: 'Límite Total',
      total_used_label: 'Total Utilizado',
      currency_symbol: '€',
      currency_code: 'EUR',
      locale_string: 'es-ES',
      info_title: 'Información sobre su saldo',
      info_description: 'El saldo presentado se basa en el límite disponible para el mes actual. El cálculo se realiza restando los gastos del período de su límite total.',
      attention_title: 'Atención',
      attention_processing_time: 'Algunas transacciones pueden tardar hasta 24 horas en procesarse. Para obtener información actualizada, utilice el botón de actualización.',
      attention_doubts: 'Si tiene dudas sobre sus gastos, consulte la sección de "Extracto" para ver los detalles de todas sus transacciones.'
    },
    DashboardLayout: {
      console_error_user_data_processing: 'Error al procesar datos del usuario:',
      loading_text: 'Cargando...'
    },
    Sidebar: {
      menu_balance: 'Saldo',
      menu_extract: 'Extracto',
      menu_agreements: 'Convenios',
      menu_qrcode: 'Código QR',
      menu_my_data: 'Mis Datos',
      menu_anticipation: 'Anticipo',
      logout_button: 'Salir',
      aria_close_menu: 'Cerrar Menú',
      aria_open_menu: 'Abrir Menú',
      user_card_label: 'Tarjeta:',
      user_agreement_label: 'Convenio:'
    },
    ExtractPage: {      
      page_title: 'Extracto',      
      section_title: 'Extracto de Movimientos',      
      error_card_not_found: 'No se pudo identificar la tarjeta. Inicie sesión de nuevo.'    
    },    
    ExtratoTab: {      
      table_header_date_time: 'Fecha/Hora',      
      table_header_establishment: 'Establecimiento',      
      table_header_value: 'Valor',      
      table_header_installment: 'Cuota',      
      table_header_transaction: 'Transacción',      
      total_value: 'Valor Total:',      
      loading: 'Cargando...',      
      no_records_found: 'Ningún registro encontrado',      
      no_transactions_found: 'Ninguna transacción encontrada en este período'    
    },    
    ConveniosPage: {      
      page_title: 'Convenios',      
      partner_network_title: 'Red de Convenios',      
      search_placeholder: 'Buscar convenios...',      
      order_alphabetical: 'Orden Alfabético',      
      order_recent: 'Más Recientes',      
      order_featured: 'Destacados',      
      loading_message: 'Cargando convenios...',      
      error_loading: 'No se pudieron cargar los convenios',      
      try_again_button: 'Intentar de nuevo',      
      invalid_response_format: 'Formato de respuesta inválido',      
      generic_error: 'No se pudieron cargar los convenios. Inténtelo de nuevo.'    
    },    
    QrCodePage: {            
      page_title: 'Código QR de la Tarjeta',            
      loading_message: 'Cargando...',            
      error_loading_qrcode: 'Error al cargar el Código QR. Inténtelo de nuevo.',            
      card_number_label: 'Su número de tarjeta:',            
      usage_instruction: 'Presente este Código QR en el establecimiento para realizar pagos'        
    },    
    MeusDadosPage: {      
      page_title: 'Mis Datos',      
      section_title: 'Mis Datos',      
      edit_button: 'Editar Datos',      
      cancel_button: 'Cancelar',      
      save_button: 'Guardar Cambios',      
      saving_text: 'Guardando...',      
      loading_text: 'Cargando sus datos...',      
      try_again_button: 'Intentar de nuevo',      
      login_again_button: 'Iniciar sesión de nuevo',      
      name_label: 'Nombre',      
      cpf_label: 'CPF',      
      email_label: 'Email',      
      phone_label: 'Celular',      
      whatsapp_label: 'Este número también es WhatsApp',      
      cep_label: 'Código Postal',      
      address_label: 'Dirección',      
      number_label: 'Número',      
      neighborhood_label: 'Barrio',      
      city_label: 'Ciudad',      
      state_label: 'Estado',      
      email_placeholder: 'Su email',      
      phone_placeholder: '(00) 00000-0000',      
      cep_placeholder: '00000-000',      
      number_placeholder: 'Número',      
      address_placeholder: 'Dirección completa',      
      neighborhood_placeholder: 'Barrio',      
      city_placeholder: 'Ciudad',      
      select_state_placeholder: 'Seleccione el estado',      
      error_loading_data: 'No se pudieron cargar sus datos. Inténtelo de nuevo.',      
      error_updating_data: 'No se pudieron actualizar sus datos. Inténtelo de nuevo más tarde.',      
      error_no_data_found: 'No se encontraron datos. Inicie sesión de nuevo.',      
      success_data_updated: '¡Datos actualizados con éxito!',      
      name_cannot_change: 'El nombre no se puede cambiar',      
      cpf_cannot_change: 'El CPF no se puede cambiar',      
      not_informed: 'No informado',      
      address_not_informed: 'Dirección no informada',      
      data_updated_footer: 'Datos actualizados. Para modificar su información, haga clic en "Editar Datos".',      
      loading_associate_data: 'Cargando datos del asociado...',      
      no_login_info: 'No se encontró información de inicio de sesión.',      
      check_auth_status: 'Verifique que esté correctamente autenticado en el sistema.',      
      full_name_label: 'Nombre completo',            
      full_address_label: 'Dirección completa'    
    },    
    AntecipacaoPage: {      
      page_title: 'Anticipo',      
      section_title: 'Solicitud de Anticipo',      
      loading_data: 'Cargando...',      
      available_balance_title: 'Saldo Disponible:',      
      refresh_balance_button: 'Actualizar saldo',      
      loading_balance: 'Cargando...',      
      month_reference: 'Referente al mes:',      
      status_requests_title: 'Estado de Solicitudes',      
      pending_requests_title: 'Solicitudes Pendientes',      
      refresh_history_button: 'Actualizar historial',      
      no_requests_found: 'Ninguna solicitud encontrada',      
      view_more_requests: 'Ver más solicitudes',      
      status_label: 'Estado:',      
      month_label: 'Mes:',      
      request_sent_title: 'Solicitud Enviada',      
      value_label: 'Valor:',      
      tax_label: 'Tasa:',      
      total_deduct_label: 'Total a Descontar:',      
      requested_on_label: 'Solicitado el:',      
      analysis_message: 'Su solicitud está en análisis. Pronto recibirá el resultado.',      
      new_request_button: 'Nueva Solicitud',      
      desired_value_label: 'Valor Deseado',      
      value_placeholder: '€ 0,00',      
      value_display_label: 'Valor:',      
      simulation_title: 'Simulación:',      
      taxes_label: 'Tasas:',      
      pix_key_label: 'Clave PIX para Recepción',      
      pix_key_placeholder: 'CPF, E-mail, Celular o Clave Aleatoria',      
      password_label: 'Contraseña (para confirmar)',      
      password_placeholder: 'Ingrese su contraseña de acceso a la app',      
      password_info: 'Importante: Use la misma contraseña de su inicio de sesión en la aplicación',      
      processing_button: 'Procesando...',      
      submit_button: 'Solicitar Anticipo',      
      status_approved: 'Aprobado',      
      status_rejected: 'Rechazado',      
      status_pending: 'Pendiente',            
      status_analysis: 'En análisis'    
    },    
    ConvenioLogin: {      page_title: 'Login del Convenio',      form_title: 'Login del Convenio',      user_label: 'Usuario',      user_placeholder: 'Usuario',      password_label: 'Contraseña',      password_placeholder: 'Contraseña',      submit_button: 'Entrar',      forgot_password_link: 'Olvidé mi contraseña',      register_link: '¿No tienes cuenta? Haz clic aquí para registrarte',      footer_text: `© ${new Date().getFullYear()} SASpy. Todos los derechos reservados.`,      user_removed_toast: 'Usuario eliminado',      login_success_toast: '¡Inicio de sesión exitoso!',      login_error_generic: 'Error al iniciar sesión',      connection_error: 'Error al conectar con el servidor. Inténtalo de nuevo más tarde.',      password_recovery_title: 'Recuperación de Contraseña',      code_verification_title: 'Verificación de Código',      new_password_title: 'Definir Nueva Contraseña',      username_recovery_label: 'Nombre de Usuario',      username_recovery_placeholder: 'Ingresa tu nombre de usuario',      username_recovery_info: 'Proporciona el nombre de usuario registrado. Enviaremos un código de recuperación al email del convenio.',      please_inform_user: 'Por favor, proporciona el usuario',      sending_button: 'Enviando...',      send_code_button: 'Enviar Código',      verification_code_label: 'Código de Verificación',      verification_code_placeholder: 'Ingresa el código de 6 dígitos',      verification_code_info: 'Ingresa el código de 6 dígitos enviado a {email}.',      sent_to_label: 'Enviado a:',      back_button: 'Volver',      verifying_button: 'Verificando...',      verify_code_button: 'Verificar Código',      new_password_label: 'Nueva contraseña',      new_password_placeholder: 'Mínimo de 6 caracteres',      confirm_password_label: 'Confirmar contraseña',      confirm_password_placeholder: 'Repite la misma contraseña',      saving_button: 'Guardando...',      save_new_password_button: 'Guardar Nueva Contraseña'    }  }};

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