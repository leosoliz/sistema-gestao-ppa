
import { Idea, Program } from "@/pages/Index";

/**
 * Função para normalizar texto: remove acentos, espaços extras e converte para minúsculo.
 * Isso garante uma comparação de strings mais robusta e consistente.
 * @param text O texto a ser normalizado.
 * @returns O texto normalizado.
 */
const normalizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' '); // Normaliza espaços
};

/**
 * Filtra a lista de ideias, retornando apenas aquelas que ainda não foram usadas como ações em programas.
 * A verificação é feita comparando o nome e o produto da ideia com os das ações existentes,
 * utilizando texto normalizado para garantir a precisão.
 * @param allIdeas A lista completa de ideias do banco.
 * @param allPrograms A lista completa de programas cadastrados.
 * @returns Um array de `Idea` contendo apenas as ideias disponíveis.
 */
export const getAvailableIdeas = (allIdeas: Idea[], allPrograms: Program[]): Idea[] => {
  return allIdeas.filter(idea => {
    // Verifica se a ideia já está sendo usada em algum programa.
    const isUsed = allPrograms.some(program => 
      program.acoes.some(action => {
        // Normaliza os textos para uma comparação precisa.
        const normalizedIdeaNome = normalizeText(idea.nome);
        const normalizedActionNome = normalizeText(action.nome);
        const normalizedIdeaProduto = normalizeText(idea.produto);
        const normalizedActionProduto = normalizeText(action.produto);
        
        // Verifica se os nomes normalizados são iguais.
        const nomeMatch = normalizedIdeaNome === normalizedActionNome;
        
        // Se ambos têm produto, compara os produtos normalizados.
        let produtoMatch = false;
        if (normalizedIdeaProduto && normalizedActionProduto) {
          produtoMatch = normalizedIdeaProduto === normalizedActionProduto;
        } else {
          // Se um ou ambos não têm produto, só correspondem se ambos forem vazios.
          produtoMatch = !normalizedIdeaProduto && !normalizedActionProduto;
        }
        
        return nomeMatch && produtoMatch;
      })
    );
    // Retorna true (mantém na lista) se a ideia NÃO foi usada.
    return !isUsed;
  });
};

/**
 * Verifica se uma única ideia específica está disponível (ou seja, não foi usada em nenhum programa).
 * @param idea A ideia a ser verificada.
 * @param allPrograms A lista completa de programas.
 * @returns `true` se a ideia estiver disponível, `false` caso contrário.
 */
export const isIdeaAvailable = (idea: Idea, allPrograms: Program[]): boolean => {
  // A lógica é a negação de encontrar a ideia em uso, reutilizando o mesmo método de verificação.
  return !allPrograms.some(program => 
    program.acoes.some(action => {
      // Mesma lógica de normalização para verificação individual.
      const normalizedIdeaNome = normalizeText(idea.nome);
      const normalizedActionNome = normalizeText(action.nome);
      const normalizedIdeaProduto = normalizeText(idea.produto);
      const normalizedActionProduto = normalizeText(action.produto);
      
      const nomeMatch = normalizedIdeaNome === normalizedActionNome;
      
      let produtoMatch = false;
      if (normalizedIdeaProduto && normalizedActionProduto) {
        produtoMatch = normalizedIdeaProduto === normalizedActionProduto;
      } else {
        produtoMatch = !normalizedIdeaProduto && !normalizedActionProduto;
      }
      
      return nomeMatch && produtoMatch;
    })
  );
};
