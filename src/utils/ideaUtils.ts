
import { Idea, Program } from "@/pages/Index";

export const isIdeaUsedInPrograms = (
  idea: Idea, 
  allPrograms: Program[]
): boolean => {
  return allPrograms.some(program => 
    program.acoes.some(action => {
      // Verificação mais rigorosa considerando diferentes cenários
      const nomeMatch = idea.nome.trim().toLowerCase() === action.nome.trim().toLowerCase();
      
      // Se ambos têm produto, compara os produtos
      if (idea.produto && action.produto) {
        const produtoMatch = idea.produto.trim().toLowerCase() === action.produto.trim().toLowerCase();
        return nomeMatch && produtoMatch;
      }
      
      // Se apenas um tem produto ou ambos não têm, compara apenas o nome
      // mas também verifica se o produto vazio/undefined é igual
      const produtoMatch = (!idea.produto || idea.produto.trim() === '') === 
                          (!action.produto || action.produto.trim() === '');
      
      return nomeMatch && produtoMatch;
    })
  );
};

export const getIdeaUsageInfo = (
  idea: Idea, 
  allPrograms: Program[]
): { isUsed: boolean; programNames: string[] } => {
  const usedInPrograms = allPrograms.filter(program => 
    program.acoes.some(action => {
      // Mesma lógica rigorosa de verificação
      const nomeMatch = idea.nome.trim().toLowerCase() === action.nome.trim().toLowerCase();
      
      if (idea.produto && action.produto) {
        const produtoMatch = idea.produto.trim().toLowerCase() === action.produto.trim().toLowerCase();
        return nomeMatch && produtoMatch;
      }
      
      const produtoMatch = (!idea.produto || idea.produto.trim() === '') === 
                          (!action.produto || action.produto.trim() === '');
      
      return nomeMatch && produtoMatch;
    })
  );

  return {
    isUsed: usedInPrograms.length > 0,
    programNames: usedInPrograms.map(p => p.programa)
  };
};

// Nova função para verificar diretamente no banco de dados
export const checkIdeaUsageInDatabase = async (idea: Idea) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Busca todas as ações que podem corresponder à ideia
    const { data: actions, error } = await supabase
      .from('actions')
      .select(`
        id,
        nome,
        produto,
        programs!inner(programa)
      `);

    if (error) {
      console.error('Erro ao verificar uso da ideia:', error);
      return { isUsed: false, programNames: [] };
    }

    const matchingActions = (actions || []).filter(action => {
      const nomeMatch = idea.nome.trim().toLowerCase() === action.nome.trim().toLowerCase();
      
      if (idea.produto && action.produto) {
        const produtoMatch = idea.produto.trim().toLowerCase() === action.produto.trim().toLowerCase();
        return nomeMatch && produtoMatch;
      }
      
      const produtoMatch = (!idea.produto || idea.produto.trim() === '') === 
                          (!action.produto || action.produto.trim() === '');
      
      return nomeMatch && produtoMatch;
    });

    const programNames = matchingActions.map(action => action.programs?.programa).filter(Boolean);

    return {
      isUsed: matchingActions.length > 0,
      programNames: programNames
    };
  } catch (error) {
    console.error('Erro ao verificar uso da ideia no banco:', error);
    return { isUsed: false, programNames: [] };
  }
};
