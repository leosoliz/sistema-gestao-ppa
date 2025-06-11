
import { Idea, Program } from "@/pages/Index";

export const getAvailableIdeas = (allIdeas: Idea[], allPrograms: Program[]): Idea[] => {
  return allIdeas.filter(idea => {
    // Verifica se a ideia não está sendo usada em nenhum programa
    const isUsed = allPrograms.some(program => 
      program.acoes.some(action => 
        action.nome === idea.nome && 
        action.produto === idea.produto
      )
    );
    return !isUsed;
  });
};

export const isIdeaAvailable = (idea: Idea, allPrograms: Program[]): boolean => {
  return !allPrograms.some(program => 
    program.acoes.some(action => 
      action.nome === idea.nome && 
      action.produto === idea.produto
    )
  );
};
