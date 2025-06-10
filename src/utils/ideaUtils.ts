
import { Idea, Program } from "@/pages/Index";

export const isIdeaUsedInPrograms = (
  idea: Idea, 
  allPrograms: Program[]
): boolean => {
  return allPrograms.some(program => 
    program.acoes.some(action => 
      action.nome === idea.nome && 
      action.produto === idea.produto
    )
  );
};

export const getIdeaUsageInfo = (
  idea: Idea, 
  allPrograms: Program[]
): { isUsed: boolean; programNames: string[] } => {
  const usedInPrograms = allPrograms.filter(program => 
    program.acoes.some(action => 
      action.nome === idea.nome && 
      action.produto === idea.produto
    )
  );

  return {
    isUsed: usedInPrograms.length > 0,
    programNames: usedInPrograms.map(p => p.programa)
  };
};
