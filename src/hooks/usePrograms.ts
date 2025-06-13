
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Program, Action } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

export const usePrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPrograms = async () => {
    try {
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;

      const { data: actionsData, error: actionsError } = await supabase
        .from('actions')
        .select('*');

      if (actionsError) throw actionsError;

      const programsWithActions: Program[] = (programsData || []).map(program => ({
        id: program.id,
        secretaria: program.secretaria || '',
        departamento: program.departamento || '',
        eixo: program.eixo || '',
        programa: program.programa,
        descricao: program.descricao || '',
        justificativa: program.justificativa || '',
        objetivos: program.objetivos || '',
        diretrizes: program.diretrizes || '',
        acoes: (actionsData || [])
          .filter(action => action.program_id === program.id)
          .map(action => ({
            id: action.id,
            nome: action.nome,
            produto: action.produto || '',
            unidadeMedida: action.unidade_medida,
            metaFisica: action.meta_fisica,
            orcamento: action.orcamento || '',
            fonte: action.fonte || ''
          })),
        createdAt: new Date(program.created_at)
      }));

      setPrograms(programsWithActions);
    } catch (error) {
      console.error('Erro ao carregar programas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os programas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addProgram = async (program: Omit<Program, "id" | "createdAt">) => {
    try {
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .insert({
          secretaria: program.secretaria,
          departamento: program.departamento,
          eixo: program.eixo,
          programa: program.programa,
          descricao: program.descricao,
          justificativa: program.justificativa,
          objetivos: program.objetivos,
          diretrizes: program.diretrizes
        })
        .select()
        .single();

      if (programError) throw programError;

      // Inserir ações se existirem
      if (program.acoes.length > 0) {
        const actionsToInsert = program.acoes.map(action => ({
          program_id: programData.id,
          nome: action.nome,
          produto: action.produto,
          meta_fisica: action.metaFisica,
          unidade_medida: action.unidadeMedida,
          orcamento: action.orcamento,
          fonte: action.fonte
        }));

        const { error: actionsError } = await supabase
          .from('actions')
          .insert(actionsToInsert);

        if (actionsError) throw actionsError;
      }

      toast({
        title: "Programa cadastrado",
        description: "O programa foi cadastrado com sucesso!",
      });

      loadPrograms();
    } catch (error) {
      console.error('Erro ao adicionar programa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o programa.",
        variant: "destructive"
      });
    }
  };

  const updateProgram = async (updatedProgram: Program) => {
    try {
      const { error: programError } = await supabase
        .from('programs')
        .update({
          secretaria: updatedProgram.secretaria,
          departamento: updatedProgram.departamento,
          eixo: updatedProgram.eixo,
          programa: updatedProgram.programa,
          descricao: updatedProgram.descricao,
          justificativa: updatedProgram.justificativa,
          objetivos: updatedProgram.objetivos,
          diretrizes: updatedProgram.diretrizes,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedProgram.id);

      if (programError) throw programError;

      // Remover ações existentes
      const { error: deleteError } = await supabase
        .from('actions')
        .delete()
        .eq('program_id', updatedProgram.id);

      if (deleteError) throw deleteError;

   


      // Inserir novas ações
      if (updatedProgram.acoes.length > 0) {
        const actionsToInsert = updatedProgram.acoes.map(action => ({
          program_id: updatedProgram.id,
          nome: action.nome,
          produto: action.produto,
          meta_fisica: action.metaFisica,
          unidade_medida: action.unidadeMedida,
          orcamento: action.orcamento,
          fonte: action.fonte
        }));

        const { error: actionsError } = await supabase
          .from('actions')
          .insert(actionsToInsert);

        if (actionsError) throw actionsError;
      }

      toast({
        title: "Programa atualizado",
        description: "As alterações foram salvas com sucesso!",
      });

      loadPrograms();
    } catch (error) {
      console.error('Erro ao atualizar programa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o programa.",
        variant: "destructive"
      });
    }
  };

  const deleteProgram = async (programId: string) => {
    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', programId);

      if (error) throw error;

      toast({
        title: "Programa excluído",
        description: "O programa foi removido com sucesso!",
      });

      loadPrograms();
    } catch (error) {
      console.error('Erro ao excluir programa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o programa.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  return {
    programs,
    loading,
    addProgram,
    updateProgram,
    deleteProgram,
    refreshPrograms: loadPrograms
  };
};
