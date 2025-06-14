
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
  refreshIdeas: () => void;
  refreshPrograms: () => void;
}

export const ActionsManager = ({
  actions,
  onActionsChange,
  ideas,
  onAddToIdeasBank,
  programId,
  refreshIdeas,
  refreshPrograms
}: ActionsManagerProps) => {
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Adiciona ou edita ação
  const handleSave = async (actionData: Partial<Action>) => {
    setLoading(true);
    try {
      if (editingAction) {
        const { error } = await supabase
          .from("actions")
          .update({
            nome: actionData.nome,
            produto: actionData.produto,
            unidade_medida: actionData.unidadeMedida,
            fonte: actionData.fonte,
            meta_fisica_2026: actionData.metaFisica2026,
            meta_fisica_2027: actionData.metaFisica2027,
            meta_fisica_2028: actionData.metaFisica2028,
            meta_fisica_2029: actionData.metaFisica2029,
            orcamento_2026: actionData.orcamento2026,
            orcamento_2027: actionData.orcamento2027,
            orcamento_2028: actionData.orcamento2028,
            orcamento_2029: actionData.orcamento2029,
            program_id: programId,
            meta_fisica: [actionData.metaFisica2026, actionData.metaFisica2027, actionData.metaFisica2028, actionData.metaFisica2029].join(" / "),
            orcamento: [actionData.orcamento2026, actionData.orcamento2027, actionData.orcamento2028, actionData.orcamento2029].join(" / ")
          })
          .eq("id", editingAction.id);

        if (error) throw error;

        const updatedActions = actions.map((a) =>
          a.id === editingAction.id
            ? { ...a, ...actionData }
            : a
        );
        onActionsChange(updatedActions);
        toast({ title: "Ação atualizada com sucesso!" });
        setEditingAction(null);
        if (refreshPrograms) refreshPrograms();
      } else {
        const { data, error } = await supabase
          .from("actions")
          .insert({
            nome: actionData.nome,
            produto: actionData.produto,
            unidade_medida: actionData.unidadeMedida,
            fonte: actionData.fonte,
            meta_fisica_2026: actionData.metaFisica2026,
            meta_fisica_2027: actionData.metaFisica2027,
            meta_fisica_2028: actionData.metaFisica2028,
            meta_fisica_2029: actionData.metaFisica2029,
            orcamento_2026: actionData.orcamento2026,
            orcamento_2027: actionData.orcamento2027,
            orcamento_2028: actionData.orcamento2028,
            orcamento_2029: actionData.orcamento2029,
            program_id: programId,
            meta_fisica: [actionData.metaFisica2026, actionData.metaFisica2027, actionData.metaFisica2028, actionData.metaFisica2029].join(" / "),
            orcamento: [actionData.orcamento2026, actionData.orcamento2027, actionData.orcamento2028, actionData.orcamento2029].join(" / ")
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
          fonte: data.fonte,
          metaFisica2026: data.meta_fisica_2026,
          metaFisica2027: data.meta_fisica_2027,
          metaFisica2028: data.meta_fisica_2028,
          metaFisica2029: data.meta_fisica_2029,
          orcamento2026: data.orcamento_2026,
          orcamento2027: data.orcamento_2027,
          orcamento2028: data.orcamento_2028,
          orcamento2029: data.orcamento_2029,
        };

        if (newAction.nome) {
          await supabase
            .from('ideas')
            .update({ is_used: true })
            .eq('titulo', newAction.nome);
          if (refreshIdeas) refreshIdeas();
        }

        onActionsChange([...actions, newAction]);
        toast({ title: "Ação adicionada!" });
        if (refreshPrograms) refreshPrograms();
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
      await supabase.from("actions").delete().eq("id", action.id);

      if (action.nome) {
        await supabase
          .from('ideas')
          .update({ is_used: false })
          .eq('titulo', action.nome);
        if (refreshIdeas) refreshIdeas();
      }

      await markIdeaAsAvailableWhenRemovedFromProgram(action.nome, action.produto);
      onActionsChange(actions.filter((a) => a.id !== action.id));
      toast({ title: "Ação excluída!" });
      if (refreshPrograms) refreshPrograms();
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
