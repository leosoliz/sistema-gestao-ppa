
import { Idea, Program } from "@/pages/Index";

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

export const getAvailableIdeas = (allIdeas: Idea[], allPrograms: Program[]): Idea[] => {
  return allIdeas.filter(idea => {
    // Verifica se a ideia não está sendo usada em nenhum programa
    const isUsed = allPrograms.some(program => 
      program.acoes.some(action => {
        // Normaliza os textos para comparação mais precisa
        const normalizedIdeaNome = normalizeText(idea.nome);
        const normalizedActionNome = normalizeText(action.nome);
        const normalizedIdeaProduto = normalizeText(idea.produto);
        const normalizedActionProduto = normalizeText(action.produto);
        
        // Verifica se os nomes normalizados são iguais
        const nomeMatch = normalizedIdeaNome === normalizedActionNome;
        
        // Se ambos têm produto, compara os produtos normalizados
        if (normalizedIdeaProduto && normalizedActionProduto) {
          const produtoMatch = normalizedIdeaProduto === normalizedActionProduto;
          return nomeMatch && produtoMatch;
        }
        
        // Se apenas um tem produto ou ambos não têm, verifica se ambos estão vazios
        const produtoMatch = (!normalizedIdeaProduto) === (!normalizedActionProduto);
        
        return nomeMatch && produtoMatch;
      })
    );
    return !isUsed;
  });
};

export const isIdeaAvailable = (idea: Idea, allPrograms: Program[]): boolean => {
  return !allPrograms.some(program => 
    program.acoes.some(action => {
      // Mesma lógica de normalização para verificação individual
      const normalizedIdeaNome = normalizeText(idea.nome);
      const normalizedActionNome = normalizeText(action.nome);
      const normalizedIdeaProduto = normalizeText(idea.produto);
      const normalizedActionProduto = normalizeText(action.produto);
      
      const nomeMatch = normalizedIdeaNome === normalizedActionNome;
      
      if (normalizedIdeaProduto && normalizedActionProduto) {
        const produtoMatch = normalizedIdeaProduto === normalizedActionProduto;
        return nomeMatch && produtoMatch;
      }
      
      const produtoMatch = (!normalizedIdeaProduto) === (!normalizedActionProduto);
      
      return nomeMatch && produtoMatch;
    })
  );
};
