# SafeDeleteButton - Componente Seguro para Exclusões

Este componente foi criado para prevenir erros comuns em operações de exclusão, como:
- `Uncaught TypeError: can't access property "id", data_row is undefined`
- Exclusões acidentais sem confirmação
- Estados inconsistentes durante operações assíncronas

## Problema Resolvido

O erro `can't access property "id", data_row is undefined` ocorre quando:
1. O objeto `data_row` é `undefined` ou `null`
2. O objeto existe mas não possui a propriedade `id`
3. Há condições de corrida entre a renderização e os dados

## Uso Básico

```tsx
import SafeDeleteButton from '../components/SafeDeleteButton';

// Em seu componente
<SafeDeleteButton
  dataRow={item}
  onDelete={async (id) => {
    await deleteItem(id);
    // Atualizar estado local
    setItems(items.filter(i => i.id !== id));
  }}
  confirmMessage="Deseja excluir este item?"
  itemDescription="este item"
>
  <FaTrash />
</SafeDeleteButton>
```

## Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `dataRow` | `DataRow \| undefined \| null` | ✅ | Objeto com os dados do item |
| `onDelete` | `(id: string \| number) => Promise<void>` | ✅ | Função de exclusão |
| `children` | `React.ReactNode` | ❌ | Conteúdo do botão (padrão: ícone lixeira) |
| `className` | `string` | ❌ | Classes CSS customizadas |
| `confirmMessage` | `string` | ❌ | Mensagem de confirmação personalizada |
| `disabled` | `boolean` | ❌ | Desabilitar o botão |
| `showConfirmDialog` | `boolean` | ❌ | Mostrar diálogo de confirmação (padrão: true) |
| `itemDescription` | `string` | ❌ | Descrição do item para mensagens |

## Exemplo Completo

```tsx
'use client';

import { useState } from 'react';
import { FaTrash, FaSpinner } from 'react-icons/fa';
import SafeDeleteButton from '../components/SafeDeleteButton';

interface Item {
  id: string;
  name: string;
  description: string;
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string | number) => {
    setDeletingId(id.toString());
    try {
      // Chamada para API de exclusão
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
      
      // Atualizar estado local
      setItems(items.filter(item => item.id !== id));
      
      toast.success('Item excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir item');
      throw error; // Re-throw para que o SafeDeleteButton trate o erro
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {items.map(item => (
        <div key={item.id} className="flex items-center justify-between p-4 border-b">
          <div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>
          
          <SafeDeleteButton
            dataRow={item}
            onDelete={handleDelete}
            confirmMessage={`Deseja excluir "${item.name}"?`}
            itemDescription="este item"
            disabled={deletingId === item.id}
          >
            {deletingId === item.id ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaTrash />
            )}
          </SafeDeleteButton>
        </div>
      ))}
    </div>
  );
}
```

## Hook useSafeDelete

Para casos mais complexos, use o hook:

```tsx
import { useSafeDelete } from '../components/SafeDeleteButton';

export default function MyComponent() {
  const { handleDelete, isDeleting, isDeletingItem } = useSafeDelete();

  const deleteItem = async (item: DataRow) => {
    const success = await handleDelete(item, async (id) => {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
      // Atualizar estado...
    });
    
    if (success) {
      toast.success('Item excluído');
    }
  };

  return (
    <button 
      onClick={() => deleteItem(item)}
      disabled={isDeletingItem(item.id)}
    >
      {isDeletingItem(item.id) ? 'Excluindo...' : 'Excluir'}
    </button>
  );
}
```

## Validações de Segurança

O componente automaticamente:

1. ✅ Verifica se `dataRow` não é `undefined` ou `null`
2. ✅ Verifica se `dataRow.id` existe
3. ✅ Mostra mensagens de erro apropriadas
4. ✅ Previne cliques duplos durante exclusão
5. ✅ Trata erros de forma consistente
6. ✅ Fornece feedback visual ao usuário

## Migração de Código Existente

### Antes (propenso a erros):
```tsx
<button onClick={() => deleteItem(data_row.id)}>
  Excluir
</button>
```

### Depois (seguro):
```tsx
<SafeDeleteButton
  dataRow={data_row}
  onDelete={deleteItem}
>
  Excluir
</SafeDeleteButton>
```

## Tratamento de Erros

O componente trata automaticamente:
- Dados inválidos ou ausentes
- Erros de rede durante exclusão
- Estados de loading
- Cancelamento de operações

Isso previne crashes e melhora a experiência do usuário.
