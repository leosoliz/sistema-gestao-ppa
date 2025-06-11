import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Idea } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

export const useIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedIdeas: Idea[] = (data || []).map(idea => ({
        id: idea.id,
        nome: idea.titulo,
        produto: idea.descricao || '',
        unidadeMedida: '',
        categoria: idea.categoria || 'Geral',
        createdAt: new Date(idea.created_at)
      }));

      setIdeas(formattedIdeas);
    } catch (error) {
      console.error('Erro ao carregar ideias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as ideias.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addIdea = async (idea: Omit<Idea, "id" | "createdAt">) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .insert({
          titulo: idea.nome,
          descricao: idea.produto,
          categoria: idea.categoria
        });

      if (error) throw error;

      toast({
        title: "Ideia cadastrada",
        description: "A ideia foi adicionada ao banco de ideias!",
      });

      loadIdeas();
    } catch (error) {
      console.error('Erro ao adicionar ideia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a ideia.",
        variant: "destructive"
      });
    }
  };

  const updateIdea = async (ideaId: string, idea: Omit<Idea, "id" | "createdAt">) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .update({
          titulo: idea.nome,
          descricao: idea.produto,
          categoria: idea.categoria
        })
        .eq('id', ideaId);

      if (error) throw error;

      toast({
        title: "Ideia atualizada",
        description: "A ideia foi atualizada com sucesso!",
      });

      loadIdeas();
    } catch (error) {
      console.error('Erro ao atualizar ideia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a ideia.",
        variant: "destructive"
      });
    }
  };

  const deleteIdea = async (ideaId: string) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId);

      if (error) throw error;

      toast({
        title: "Ideia removida",
        description: "A ideia foi removida do banco de ideias!",
      });

      loadIdeas();
    } catch (error) {
      console.error('Erro ao remover ideia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a ideia.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  return {
    ideas,
    loading,
    addIdea,
    updateIdea,
    deleteIdea,
    refreshIdeas: loadIdeas
  };
};
