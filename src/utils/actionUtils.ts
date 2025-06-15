
import { Program, Action } from "@/pages/Index";

/**
 * Verifica se uma determinada ação (identificada por nome e produto) está sendo utilizada
 * em QUALQUER outro programa além do atual.
 *
 * @param action - A ação que será verificada.
 * @param currentProgramId - O ID do programa ao qual a ação pertence atualmente (para excluí-lo da busca).
 * @param allPrograms - Um array com todos os programas cadastrados no sistema.
 * @returns `true` se a ação for encontrada em pelo menos um outro programa, `false` caso contrário.
 */
export const isActionUsedInOtherPrograms = (
  action: Action, 
  currentProgramId: string, 
  allPrograms: Program[]
): boolean => {
  // `some` para a iteração assim que encontra a primeira correspondência, sendo mais performático.
  return allPrograms.some(program => 
    // Garante que não estamos verificando o programa atual.
    program.id !== currentProgramId && 
    // Verifica se alguma ação dentro deste outro programa corresponde à ação fornecida.
    program.acoes.some(programAction => 
      programAction.nome === action.nome && 
      programAction.produto === action.produto
    )
  );
};

/**
 * Obtém informações detalhadas sobre o uso de uma ação em outros programas.
 * Retorna não apenas se a ação é usada, mas também os nomes dos programas que a utilizam.
 *
 * @param action - A ação que será verificada.
 * @param currentProgramId - O ID do programa atual.
 * @param allPrograms - Um array com todos os programas.
 * @returns Um objeto contendo um booleano `isUsed` e um array `programNames` com os nomes dos programas.
 */
export const getActionUsageInfo = (
  action: Action, 
  currentProgramId: string, 
  allPrograms: Program[]
): { isUsed: boolean; programNames: string[] } => {
  // `filter` para encontrar TODOS os programas que usam a ação.
  const usedInPrograms = allPrograms.filter(program => 
    program.id !== currentProgramId && 
    program.acoes.some(programAction => 
      programAction.nome === action.nome && 
      programAction.produto === action.produto
    )
  );

  return {
    isUsed: usedInPrograms.length > 0, // Se o array filtrado tem itens, a ação está em uso.
    programNames: usedInPrograms.map(p => p.programa) // Extrai apenas os nomes dos programas encontrados.
  };
};
