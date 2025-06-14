
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Eixo } from '@/types/eixo';
import { useToast } from '@/hooks/use-toast';

export const useEixos = () => {
  const [eixos, setEixos] = useState<Eixo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadEixos = async () => {
    try {
      const { data, error } = await supabase
        .from('eixos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;

      const eixosWithDates: Eixo[] = (data || []).map(eixo => ({
        id: eixo.id,
        nome: eixo.nome,
        descricao: eixo.descricao || '',
        isUsed: eixo.is_used || false,
        createdAt: new Date(eixo.created_at)
      }));

      setEixos(eixosWithDates);
    } catch (error) {
      console.error('Erro ao carregar eixos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eixos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addEixo = async (eixo: Omit<Eixo, "id" | "createdAt" | "isUsed">) => {
    try {
      const { error } = await supabase
        .from('eixos')
        .insert({
          nome: eixo.nome,
          descricao: eixo.descricao,
          is_used: false
        });

      if (error) throw error;

      toast({
        title: "Eixo cadastrado",
        description: "O eixo foi cadastrado com sucesso!",
      });

      await loadEixos();
    } catch (error) {
      console.error('Erro ao adicionar eixo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o eixo.",
        variant: "destructive"
      });
    }
  };

  const updateEixo = async (updatedEixo: Eixo) => {
    try {
      const { error } = await supabase
        .from('eixos')
        .update({
          nome: updatedEixo.nome,
          descricao: updatedEixo.descricao
        })
        .eq('id', updatedEixo.id);

      if (error) throw error;

      toast({
        title: "Eixo atualizado",
        description: "As alterações foram salvas com sucesso!",
      });

      await loadEixos();
    } catch (error) {
      console.error('Erro ao atualizar eixo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o eixo.",
        variant: "destructive"
      });
    }
  };

  const deleteEixo = async (eixoId: string) => {
    try {
      // Verificar se o eixo está sendo usado
      const eixoToDelete = eixos.find(e => e.id === eixoId);
      if (eixoToDelete?.isUsed) {
        toast({
          title: "Não é possível excluir",
          description: "Este eixo está sendo utilizado em programas ativos.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('eixos')
        .delete()
        .eq('id', eixoId);

      if (error) throw error;

      toast({
        title: "Eixo excluído",
        description: "O eixo foi removido com sucesso!",
      });

      await loadEixos();
    } catch (error) {
      console.error('Erro ao excluir eixo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o eixo.",
        variant: "destructive"
      });
    }
  };

  const syncEixosUsageStatus = async () => {
    try {
      // Primeiro, marca todos os eixos como não utilizados
      const { error: resetError } = await supabase
        .from('eixos')
        .update({ is_used: false });

      if (resetError) throw resetError;

      // Depois, busca todos os programas para marcar os eixos correspondentes como utilizados
      const { data: programs, error: programsError } = await supabase
        .from('programs')
        .select('eixo');

      if (programsError) throw programsError;

      if (programs && programs.length > 0) {
        // Para cada programa, marca o eixo correspondente como utilizado
        const uniqueEixos = [...new Set(programs.map(p => p.eixo).filter(Boolean))];
        
        for (const eixoName of uniqueEixos) {
          await supabase
            .from('eixos')
            .update({ is_used: true })
            .eq('nome', eixoName);
        }
      }

      await loadEixos();
    } catch (error) {
      console.error('Erro ao sincronizar status dos eixos:', error);
    }
  };

  useEffect(() => {
    loadEixos();
  }, []);

  return {
    eixos,
    loading,
    addEixo,
    updateEixo,
    deleteEixo,
    syncEixosUsageStatus,
    refreshEixos: loadEixos
  };
};
