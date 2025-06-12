
import { supabase } from '@/integrations/supabase/client';

export const syncIdeaUsageStatus = async (ideaName: string, ideaProduct: string, isUsed: boolean) => {
  try {
    const { error } = await supabase
      .from('ideas')
      .update({ is_used: isUsed })
      .eq('titulo', ideaName)
      .eq('descricao', ideaProduct || '');

    if (error) {
      console.error('Erro ao sincronizar status da ideia:', error);
    }
  } catch (error) {
    console.error('Erro ao sincronizar status da ideia:', error);
  }
};

export const markIdeaAsUsedWhenAddedToProgram = async (ideaName: string, ideaProduct: string) => {
  await syncIdeaUsageStatus(ideaName, ideaProduct, true);
};

export const markIdeaAsAvailableWhenRemovedFromProgram = async (ideaName: string, ideaProduct: string) => {
  // Verifica se a ideia ainda está sendo usada em outros programas
  const { data: actions } = await supabase
    .from('actions')
    .select('id')
    .eq('nome', ideaName)
    .eq('produto', ideaProduct || '');

  // Se não há mais ações com essa ideia, marca como disponível
  if (!actions || actions.length === 0) {
    await syncIdeaUsageStatus(ideaName, ideaProduct, false);
  }
};
