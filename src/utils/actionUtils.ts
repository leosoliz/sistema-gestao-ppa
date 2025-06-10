
import { Program, Action } from "@/pages/Index";

export const isActionUsedInOtherPrograms = (
  action: Action, 
  currentProgramId: string, 
  allPrograms: Program[]
): boolean => {
  return allPrograms.some(program => 
    program.id !== currentProgramId && 
    program.acoes.some(programAction => 
      programAction.nome === action.nome && 
      programAction.produto === action.produto
    )
  );
};

export const getActionUsageInfo = (
  action: Action, 
  currentProgramId: string, 
  allPrograms: Program[]
): { isUsed: boolean; programNames: string[] } => {
  const usedInPrograms = allPrograms.filter(program => 
    program.id !== currentProgramId && 
    program.acoes.some(programAction => 
      programAction.nome === action.nome && 
      programAction.produto === action.produto
    )
  );

  return {
    isUsed: usedInPrograms.length > 0,
    programNames: usedInPrograms.map(p => p.programa)
  };
};
