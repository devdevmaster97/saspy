/**
 * Utilitários para operações de exclusão seguras
 * Previne erros como "can't access property 'id', data_row is undefined"
 */

interface DataRow {
  id: string | number;
  [key: string]: any;
}

interface DeleteOptions {
  confirmMessage?: string;
  onSuccess?: (deletedItem: DataRow) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

/**
 * Função segura para lidar com exclusões
 * Valida se o data_row existe antes de tentar acessar suas propriedades
 */
export const safeDelete = (
  dataRow: DataRow | undefined | null,
  options: DeleteOptions = {}
): boolean => {
  // Verificar se dataRow existe e tem a propriedade id
  if (!dataRow) {
    console.error('Erro: data_row é undefined ou null');
    if (options.onError) {
      options.onError('Dados do item não encontrados');
    }
    return false;
  }

  if (!dataRow.id) {
    console.error('Erro: data_row não possui propriedade id');
    if (options.onError) {
      options.onError('ID do item não encontrado');
    }
    return false;
  }

  // Mostrar confirmação
  const confirmMessage = options.confirmMessage || 'Tem certeza que deseja excluir este item?';
  
  if (confirm(confirmMessage)) {
    try {
      // Aqui seria executada a lógica de exclusão
      console.log('Excluindo item com ID:', dataRow.id);
      
      if (options.onSuccess) {
        options.onSuccess(dataRow);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      if (options.onError) {
        options.onError('Erro interno ao excluir item');
      }
      return false;
    }
  } else {
    // Usuário cancelou
    if (options.onCancel) {
      options.onCancel();
    }
    return false;
  }
};

/**
 * Hook React para operações de exclusão seguras
 */
export const useSafeDelete = () => {
  const handleDelete = (
    dataRow: DataRow | undefined | null,
    deleteFunction: (id: string | number) => Promise<void>,
    options: Omit<DeleteOptions, 'onSuccess' | 'onError'> & {
      onSuccess?: (deletedItem: DataRow) => void;
      onError?: (error: string) => void;
    } = {}
  ) => {
    return safeDelete(dataRow, {
      ...options,
      onSuccess: async (item) => {
        try {
          await deleteFunction(item.id);
          if (options.onSuccess) {
            options.onSuccess(item);
          }
        } catch (error) {
          console.error('Erro na função de exclusão:', error);
          if (options.onError) {
            options.onError('Erro ao executar exclusão');
          }
        }
      }
    });
  };

  return { handleDelete };
};

/**
 * Componente de botão de exclusão seguro
 */
export interface SafeDeleteButtonProps {
  dataRow: DataRow | undefined | null;
  onDelete: (id: string | number) => Promise<void>;
  children: React.ReactNode;
  className?: string;
  confirmMessage?: string;
  disabled?: boolean;
}
