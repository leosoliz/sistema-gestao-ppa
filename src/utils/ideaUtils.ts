
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
