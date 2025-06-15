
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

/**
 * Componente para gerenciar (adicionar, editar, excluir) as ações de um programa.
 * Ele contém o formulário de ação e a lista de ações existentes, tratando a lógica de negócio.
 */
export const ActionsManager = ({
  actions,
  onActionsChange,
  ideas,
  onAddToIdeasBank,
  programId,
  refreshIdeas,
  refreshPrograms
}: ActionsManagerProps) => {
  // Estado para guardar a ação que está sendo editada no momento. Se for `null`, o formulário é para uma nova ação.
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  // Estado de loading para desabilitar botões durante operações assíncronas (chamadas ao DB).
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Salva uma ação (cria uma nova ou atualiza uma existente).
   * @param actionData - Os dados do formulário da ação.
   */
  const handleSave = async (actionData: Partial<Action>) => {
    setLoading(true);
    try {
      // Se `editingAction` não for nulo, estamos atualizando uma ação existente.
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

        // Atualiza a lista de ações no estado local para refletir a mudança imediatamente.
        const updatedActions = actions.map((a) =>
          a.id === editingAction.id
            ? { ...a, ...actionData } // Substitui a ação antiga pela nova
            : a
        );
        onActionsChange(updatedActions);
        toast({ title: "Ação atualizada com sucesso!" });
        setEditingAction(null); // Reseta o formulário para o modo de criação.
        if (refreshPrograms) refreshPrograms(); // Força a atualização dos dados do programa.
      } else {
        // Se `editingAction` for nulo, estamos criando uma nova ação.
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

        // Constrói o objeto da nova ação com os dados retornados do DB.
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

        // Se a ação foi criada a partir de uma ideia (o nome corresponde), marca a ideia como "usada".
        if (newAction.nome) {
          await supabase
            .from('ideas')
            .update({ is_used: true })
            .eq('titulo', newAction.nome);
          if (refreshIdeas) refreshIdeas(); // Atualiza a lista de ideias na UI.
        }

        onActionsChange([...actions, newAction]); // Adiciona a nova ação à lista local.
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

  /**
   * Exclui uma ação do banco de dados e da lista local.
   * @param action A ação a ser excluída.
   */
  const handleDelete = async (action: Action) => {
    setLoading(true);
    try {
      await supabase.from("actions").delete().eq("id", action.id);

      // Marca a ideia correspondente como disponível novamente no banco de ideias.
      // Isso é importante para que a ideia possa ser reutilizada em outros programas.
      if (action.nome) {
        await supabase
          .from('ideas')
          .update({ is_used: false })
          .eq('titulo', action.nome);
        if (refreshIdeas) refreshIdeas();
      }

      await markIdeaAsAvailableWhenRemovedFromProgram(action.nome, action.produto);
      // Remove a ação da lista localmente para atualizar a UI.
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
      {/* Formulário para adicionar/editar ações. */}
      <ActionForm
        ideas={ideas}
        programId={programId}
        editingAction={editingAction}
        loading={loading}
        onSave={handleSave}
        onSaveToIdeasBank={onAddToIdeasBank}
        onCancel={() => setEditingAction(null)} // Limpa o estado de edição ao cancelar.
      />
      {/* Lista de ações existentes. */}
      <ActionsList
        actions={actions}
        loading={loading}
        editingId={editingAction ? editingAction.id : null}
        onEdit={setEditingAction} // Define qual ação editar ao clicar no botão de edição.
        onDelete={handleDelete}
      />
    </div>
  );
};
