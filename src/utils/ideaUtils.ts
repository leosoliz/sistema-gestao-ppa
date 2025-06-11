
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

// Função melhorada para verificar diretamente no banco de dados
export const checkIdeaUsageInDatabase = async (idea: Idea) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Busca todas as ações e seus programas
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

    // Função para normalizar texto (remove acentos, espaços extras, converte para minúsculo)
    const normalizeText = (text: string | null | undefined): string => {
      if (!text) return '';
      return text
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/\s+/g, ' '); // Normaliza espaços
    };

    const normalizedIdeaNome = normalizeText(idea.nome);
    const normalizedIdeaProduto = normalizeText(idea.produto);

    console.log('Verificando ideia:', {
      ideaNome: idea.nome,
      normalizedIdeaNome,
      ideaProduto: idea.produto,
      normalizedIdeaProduto
    });

    const matchingActions = (actions || []).filter(action => {
      const normalizedActionNome = normalizeText(action.nome);
      const normalizedActionProduto = normalizeText(action.produto);
      
      console.log('Comparando com ação:', {
        actionNome: action.nome,
        normalizedActionNome,
        actionProduto: action.produto,
        normalizedActionProduto,
        nomeMatch: normalizedIdeaNome === normalizedActionNome
      });

      // Verifica se os nomes normalizados são iguais
      const nomeMatch = normalizedIdeaNome === normalizedActionNome;
      
      // Se ambos têm produto, compara os produtos normalizados
      if (normalizedIdeaProduto && normalizedActionProduto) {
        const produtoMatch = normalizedIdeaProduto === normalizedActionProduto;
        console.log('Match com produto:', { nomeMatch, produtoMatch });
        return nomeMatch && produtoMatch;
      }
      
      // Se apenas um tem produto ou ambos não têm, verifica se ambos estão vazios
      const produtoMatch = (!normalizedIdeaProduto) === (!normalizedActionProduto);
      console.log('Match sem produto específico:', { nomeMatch, produtoMatch });
      
      return nomeMatch && produtoMatch;
    });

    const programNames = matchingActions.map(action => action.programs?.programa).filter(Boolean);

    console.log('Resultado da verificação:', {
      isUsed: matchingActions.length > 0,
      programNames,
      matchingActionsCount: matchingActions.length
    });

    return {
      isUsed: matchingActions.length > 0,
      programNames: programNames
    };
  } catch (error) {
    console.error('Erro ao verificar uso da ideia no banco:', error);
    return { isUsed: false, programNames: [] };
  }
};
