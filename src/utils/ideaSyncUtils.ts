
import { supabase } from '@/integrations/supabase/client';

/**
 * Função central para sincronizar o status de "uso" de uma ideia no banco de dados.
 * Atualiza o campo `is_used` na tabela `ideas`.
 * 
 * @param ideaName - O título da ideia a ser atualizada.
 * @param ideaProduct - A descrição/produto da ideia, para garantir a unicidade.
 * @param isUsed - O novo status de uso (`true` ou `false`).
 */
export const syncIdeaUsageStatus = async (ideaName: string, ideaProduct: string, isUsed: boolean) => {
  try {
    const { error } = await supabase
      .from('ideas')
      .update({ is_used: isUsed }) // Define o novo valor para a coluna `is_used`.
      .eq('titulo', ideaName) // Filtra pela ideia com o título correspondente.
      .eq('descricao', ideaProduct || ''); // E com a descrição correspondente.

    if (error) {
      console.error('Erro ao sincronizar status da ideia:', error);
    }
  } catch (error) {
    console.error('Erro inesperado ao sincronizar status da ideia:', error);
  }
};

/**
 * Marca uma ideia como "usada" (`is_used = true`).
 * É uma função de conveniência que chama `syncIdeaUsageStatus`.
 * Deve ser chamada quando uma ideia é adicionada como uma ação a um programa.
 * 
 * @param ideaName - O título da ideia.
 * @param ideaProduct - O produto da ideia.
 */
export const markIdeaAsUsedWhenAddedToProgram = async (ideaName: string, ideaProduct: string) => {
  await syncIdeaUsageStatus(ideaName, ideaProduct, true);
};

/**
 * Marca uma ideia como "disponível" (`is_used = false`), mas apenas se ela não estiver
 * sendo usada em nenhuma outra ação de programa.
 * Deve ser chamada quando uma ação baseada em uma ideia é removida de um programa.
 * 
 * @param ideaName - O título da ideia.
 * @param ideaProduct - O produto da ideia.
 */
export const markIdeaAsAvailableWhenRemovedFromProgram = async (ideaName: string, ideaProduct: string) => {
  // Primeiro, verifica no banco de dados se ainda existem ações com o mesmo nome/produto.
  const { data: actions } = await supabase
    .from('actions')
    .select('id')
    .eq('nome', ideaName)
    .eq('produto', ideaProduct || '');

  // Se a busca não retornar nenhuma ação, significa que a ideia não está mais em uso.
  // Então, podemos marcá-la como disponível novamente.
  if (!actions || actions.length === 0) {
    await syncIdeaUsageStatus(ideaName, ideaProduct, false);
  }
};
