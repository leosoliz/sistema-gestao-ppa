
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ActionsList } from "./ActionsList";
import { ActionForm } from "./ActionForm";
import { supabase } from "@/integrations/supabase/client";
import { markIdeaAsAvailableWhenRemovedFromProgram } from "@/utils/ideaSyncUtils";
import type { Action, Idea } from "@/pages/Index";

interface ActionsManagerProps {
  actions: Action[];
  onActionsChange: (actions: Action[]) => void;
  ideas: Idea[];
  onAddToIdeasBank: (idea: Omit<Idea, "id" | "createdAt">) => void;
  programId: string;
}

export const ActionsManager = ({
  actions,
  onActionsChange,
  ideas,
  onAddToIdeasBank,
  programId,
}: ActionsManagerProps) => {
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Adiciona ou edita ação
  const handleSave = async (actionData: Partial<Action>) => {
    setLoading(true);
    try {
      if (editingAction) {
        // Edit update: obrigatório program_id
        const { error } = await supabase
          .from("actions")
          .update({
            nome: actionData.nome,
            produto: actionData.produto,
            unidade_medida: actionData.unidadeMedida,
            meta_fisica: actionData.metaFisica,
            orcamento: actionData.orcamento,
            fonte: actionData.fonte,
            program_id: programId,
          })
          .eq("id", editingAction.id);

        if (error) throw error;

        const updatedActions = actions.map((a) =>
          a.id === editingAction.id ? { ...a, ...actionData } as Action : a
        );
        onActionsChange(updatedActions);
        toast({ title: "Ação atualizada com sucesso!" });
        setEditingAction(null);
      } else {
        // Novo registro com program_id
        const { data, error } = await supabase
          .from("actions")
          .insert({
            nome: actionData.nome,
            produto: actionData.produto,
            unidade_medida: actionData.unidadeMedida,
            meta_fisica: actionData.metaFisica,
            orcamento: actionData.orcamento,
            fonte: actionData.fonte,
            program_id: programId,
          })
          .select()
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Ação não criada!");

        const newAction: Action = {
          id: data.id,
          nome: data.nome,
          produto: data.produto,
          unidadeMedida: data.unidade_medida,
          metaFisica: data.meta_fisica,
          orcamento: data.orcamento,
          fonte: data.fonte,
        };
        onActionsChange([...actions, newAction]);
        toast({ title: "Ação adicionada!" });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar ação",
        description: error?.message || "Erro inesperado ao salvar.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleDelete = async (action: Action) => {
    setLoading(true);
    try {
      // Remove do BD
      await supabase.from("actions").delete().eq("id", action.id);
      await markIdeaAsAvailableWhenRemovedFromProgram(action.nome, action.produto);
      onActionsChange(actions.filter((a) => a.id !== action.id));
      toast({ title: "Ação excluída!" });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir ação",
        description: error?.message || "Erro inesperado ao deletar.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <ActionForm
        ideas={ideas}
        programId={programId}
        editingAction={editingAction}
        loading={loading}
        onSave={handleSave}
        onSaveToIdeasBank={onAddToIdeasBank}
        onCancel={() => setEditingAction(null)}
      />
      <ActionsList
        actions={actions}
        loading={loading}
        editingId={editingAction ? editingAction.id : null}
        onEdit={setEditingAction}
        onDelete={handleDelete}
      />
    </div>
  );
};
