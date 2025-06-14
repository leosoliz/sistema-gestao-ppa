
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, Edit } from "lucide-react";
import { Action, Idea } from "@/pages/Index";
import { markIdeaAsAvailableWhenRemovedFromProgram } from "@/utils/ideaSyncUtils";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActionsManagerProps {
  actions: Action[];
  onActionsChange: (actions: Action[]) => void;
  ideas: Idea[];
  onAddToIdeasBank: (idea: Omit<Idea, "id" | "createdAt">) => void;
}

// Helper para gerar UUID v4 simples (fallback)
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const ActionsManager = ({ actions, onActionsChange, ideas, onAddToIdeasBank }: ActionsManagerProps) => {
  const [currentAction, setCurrentAction] = useState<Partial<Action>>({
    nome: "",
    produto: "",
    unidadeMedida: "",
    metaFisica: "",
    orcamento: "",
    fonte: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false); // indica operação de CRUD
  const { toast } = useToast();

  // Carregar ações do Supabase sempre que actions mudar externamente (ideal seria centralizar o state, mas mantendo padrão do projeto)
  // O CRUD local (onActionsChange) serve como fallback e p/ manter interface reativa.
  // Se necessário pode-se adaptar para buscar de supabase direto (fetchAcoes).
  
  // Funções utilitárias
  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const cents = parseInt(numbers) || 0;
    const reais = cents / 100;
    return reais.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleInputChange = (field: keyof Action, value: string) => {
    if (field === 'orcamento') {
      const formattedValue = formatCurrency(value);
      setCurrentAction(prev => ({ ...prev, [field]: formattedValue }));
    } else {
      setCurrentAction(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSelectIdea = (ideaId: string) => {
    const selectedIdea = ideas.find(idea => idea.id === ideaId);
    if (selectedIdea) {
      setCurrentAction({
        nome: selectedIdea.nome,
        produto: selectedIdea.produto,
        unidadeMedida: selectedIdea.unidadeMedida,
        metaFisica: "",
        orcamento: "",
        fonte: "",
      });
    }
  };

  // Adicionar ou editar ação no Supabase e atualizar lista local
  const addAction = async () => {
    if (!currentAction.nome?.trim()) {
      alert("Por favor, preencha pelo menos o nome da ação.");
      return;
    }

    setLoading(true);
    let isEdit = editingIndex !== null;
    let actionId = isEdit ? (actions[editingIndex!]?.id || generateUUID()) : generateUUID();

    const actionToSave: Action = {
      id: actionId,
      nome: currentAction.nome || "",
      produto: currentAction.produto || "",
      unidadeMedida: currentAction.unidadeMedida || "",
      metaFisica: currentAction.metaFisica || "",
      orcamento: currentAction.orcamento || "",
      fonte: currentAction.fonte || "",
    };

    try {
      if (isEdit) {
        // Atualiza ação no Supabase
        const { error } = await supabase
          .from("actions")
          .update({
            nome: actionToSave.nome,
            produto: actionToSave.produto,
            unidade_medida: actionToSave.unidadeMedida,
            meta_fisica: actionToSave.metaFisica,
            orcamento: actionToSave.orcamento,
            fonte: actionToSave.fonte,
          })
          .eq("id", actionToSave.id);

        if (error) throw error;
        let updated = [...actions];
        updated[editingIndex!] = actionToSave;
        onActionsChange(updated);

        toast({ title: "Ação atualizada", description: "Ação editada com sucesso." });
      } else {
        // Cria ação no Supabase
        const { data, error } = await supabase
          .from("actions")
          .insert({
            id: actionId,
            nome: actionToSave.nome,
            produto: actionToSave.produto,
            unidade_medida: actionToSave.unidadeMedida,
            meta_fisica: actionToSave.metaFisica,
            orcamento: actionToSave.orcamento,
            fonte: actionToSave.fonte,
            // program_id: ?  // Caso você relacione com programa, precisa do id aqui!
          })
          .select()
          .single();

        if (error) throw error;
        onActionsChange([...actions, actionToSave]);
        toast({ title: "Ação adicionada", description: "Nova ação criada com sucesso." });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar a ação",
        description: error?.message || "Erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setCurrentAction({
        nome: "",
        produto: "",
        unidadeMedida: "",
        metaFisica: "",
        orcamento: "",
        fonte: "",
      });
      setEditingIndex(null);
      setLoading(false);
    }
  };

  const editAction = (index: number) => {
    const action = actions[index];
    setCurrentAction({
      nome: action.nome,
      produto: action.produto,
      unidadeMedida: action.unidadeMedida,
      metaFisica: action.metaFisica,
      orcamento: action.orcamento,
      fonte: action.fonte,
    });
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setCurrentAction({
      nome: "",
      produto: "",
      unidadeMedida: "",
      metaFisica: "",
      orcamento: "",
      fonte: "",
    });
  };

  // Excluir ação do Supabase (e local)
  const deleteAction = async (index: number) => {
    const actionToDelete = actions[index];
    if (!actionToDelete.id || actionToDelete.id.length < 30) {
      toast({
        title: "Ação local não registrada",
        description: "Não foi possível encontrar este item no banco de dados. Ela só será removida deste programa.",
      });
      onActionsChange(actions.filter((_, i) => i !== index));
      return;
    }

    setLoading(true);
    try {
      console.log("Tentando excluir ação com id: ", actionToDelete.id);
      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', actionToDelete.id);

      if (error) {
        throw error;
      }

      await markIdeaAsAvailableWhenRemovedFromProgram(
        actionToDelete.nome,
        actionToDelete.produto
      );
      onActionsChange(actions.filter((_, i) => i !== index));

      toast({
        title: "Ação excluída",
        description: "A ação foi removida com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir ação",
        description: error?.message || "Erro inesperado ao tentar remover a ação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Salva no banco de ideias (sem interação com Supabase actions)
  const saveToIdeasBank = () => {
    if (!currentAction.nome?.trim()) {
      alert("Por favor, preencha pelo menos o nome da ação para salvá-la no banco de ideias.");
      return;
    }

    onAddToIdeasBank({
      nome: currentAction.nome,
      produto: currentAction.produto || "",
      unidadeMedida: currentAction.unidadeMedida || "",
      categoria: "Geral",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg">
            {editingIndex !== null ? "Editar Ação" : "Nova Ação"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingIndex === null && (
            <div>
              <Label htmlFor="selectIdea">Selecionar do Banco de Ideias (opcional)</Label>
              <Select onValueChange={handleSelectIdea}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma ideia ou crie uma nova ação" />
                </SelectTrigger>
                <SelectContent>
                  {ideas.filter((idea) => idea.isUsed === false).map((idea) => (
                    <SelectItem key={idea.id} value={idea.id}>
                      {idea.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomeAcao">Nome da Ação *</Label>
              <Input
                id="nomeAcao"
                value={currentAction.nome || ""}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder="Nome da ação"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="produto">Produto</Label>
              <Input
                id="produto"
                value={currentAction.produto || ""}
                onChange={(e) => handleInputChange("produto", e.target.value)}
                placeholder="Produto esperado"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
              <Input
                id="unidadeMedida"
                value={currentAction.unidadeMedida || ""}
                onChange={(e) => handleInputChange("unidadeMedida", e.target.value)}
                placeholder="Ex: Unidade, %, Km"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="metaFisica">Meta Física</Label>
              <Input
                id="metaFisica"
                value={currentAction.metaFisica || ""}
                onChange={(e) => handleInputChange("metaFisica", e.target.value)}
                placeholder="Meta física"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="orcamento">Orçamento (R$)</Label>
              <Input
                id="orcamento"
                value={currentAction.orcamento || ""}
                onChange={(e) => handleInputChange("orcamento", e.target.value)}
                placeholder="R$ 0,00"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="fonte">Fonte</Label>
              <Input
                id="fonte"
                value={currentAction.fonte || ""}
                onChange={(e) => handleInputChange("fonte", e.target.value)}
                placeholder="Fonte de recursos"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={addAction} className="bg-green-600 hover:bg-green-700" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              {editingIndex !== null ? "Salvar Alterações" : "Adicionar Ação"}
            </Button>
            {editingIndex === null && (
              <Button
                variant="outline"
                onClick={saveToIdeasBank}
                disabled={!currentAction.nome?.trim() || loading}
              >
                Salvar no Banco de Ideias
              </Button>
            )}
            {editingIndex !== null && (
              <Button variant="outline" onClick={cancelEdit} disabled={loading}>
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {actions.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Ações Cadastradas ({actions.length})</h3>
          <div className="space-y-3">
            {actions.map((action, index) => (
              <Card key={action.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                      <div>
                        <p className="font-medium text-blue-900">{action.nome}</p>
                        <p className="text-sm text-gray-600">Produto: {action.produto}</p>
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Meta:</span> {action.metaFisica} {action.unidadeMedida}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Orçamento:</span> {action.orcamento}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Fonte:</span> {action.fonte}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editAction(index)}
                        disabled={editingIndex !== null || loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteAction(index)}
                        disabled={editingIndex !== null || loading}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
