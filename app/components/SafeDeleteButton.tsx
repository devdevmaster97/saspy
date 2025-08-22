'use client';

import React, { useState } from 'react';
import { FaTrash, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

interface DataRow {
  id: string | number;
  [key: string]: any;
}

interface SafeDeleteButtonProps {
  dataRow: DataRow | undefined | null;
  onDelete: (id: string | number) => Promise<void>;
  children?: React.ReactNode;
  className?: string;
  confirmMessage?: string;
  disabled?: boolean;
  showConfirmDialog?: boolean;
  itemDescription?: string;
}

export default function SafeDeleteButton({
  dataRow,
  onDelete,
  children,
  className = '',
  confirmMessage,
  disabled = false,
  showConfirmDialog = true,
  itemDescription = 'este item'
}: SafeDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Verificar se dataRow é válido
  const isDataRowValid = dataRow && dataRow.id;

  const handleClick = () => {
    // Validação de segurança
    if (!isDataRowValid) {
      console.error('Erro: data_row é undefined, null ou não possui ID');
      alert('Erro: Dados do item não encontrados. Por favor, recarregue a página.');
      return;
    }

    if (showConfirmDialog) {
      setShowModal(true);
    } else {
      executeDelete();
    }
  };

  const executeDelete = async () => {
    if (!isDataRowValid) return;

    setIsDeleting(true);
    try {
      await onDelete(dataRow.id);
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      alert('Erro ao excluir item. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultClassName = `
    inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
    transition-colors duration-200
    ${isDataRowValid && !disabled && !isDeleting 
      ? 'text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer' 
      : 'text-gray-400 cursor-not-allowed opacity-50'
    }
  `.trim();

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!isDataRowValid || disabled || isDeleting}
        className={className || defaultClassName}
        title={!isDataRowValid ? 'Dados do item não encontrados' : 'Excluir'}
      >
        {isDeleting ? (
          <FaSpinner className="animate-spin h-4 w-4" />
        ) : (
          children || <FaTrash className="h-4 w-4" />
        )}
      </button>

      {/* Modal de confirmação */}
      {showModal && isDataRowValid && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl transform transition-all">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Confirmar exclusão
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {confirmMessage || `Tem certeza que deseja excluir ${itemDescription}? Esta ação não poderá ser desfeita.`}
                    </p>
                    
                    {/* Mostrar ID do item para confirmação */}
                    <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm">
                      <p><span className="font-semibold">ID:</span> {dataRow.id}</p>
                      {dataRow.nome && <p><span className="font-semibold">Nome:</span> {dataRow.nome}</p>}
                      {dataRow.descricao && <p><span className="font-semibold">Descrição:</span> {dataRow.descricao}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={executeDelete}
                disabled={isDeleting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Hook para usar operações de exclusão seguras
 */
export const useSafeDelete = () => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (
    dataRow: DataRow | undefined | null,
    deleteFunction: (id: string | number) => Promise<void>
  ): Promise<boolean> => {
    // Validação de segurança
    if (!dataRow || !dataRow.id) {
      console.error('Erro: data_row é undefined, null ou não possui ID');
      alert('Erro: Dados do item não encontrados. Por favor, recarregue a página.');
      return false;
    }

    setIsDeleting(dataRow.id.toString());
    
    try {
      await deleteFunction(dataRow.id);
      return true;
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      alert('Erro ao excluir item. Tente novamente.');
      return false;
    } finally {
      setIsDeleting(null);
    }
  };

  return {
    handleDelete,
    isDeleting,
    isDeletingItem: (id: string | number) => isDeleting === id.toString()
  };
};
