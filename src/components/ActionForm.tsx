
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Action, Idea } from "@/pages/Index";

interface ActionFormProps {
  ideas: Idea[];
  programId: string;
  editingAction: Action | null;
  loading: boolean;
  onSave: (action: Partial<Action>) => Promise<void>;
  onSaveToIdeasBank: (idea: Omit<Idea, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export const ActionForm = ({
  ideas,
  programId,
  editingAction,
  loading,
  onSave,
  onSaveToIdeasBank,
  onCancel,
}: ActionFormProps) => {
  const [currentAction, setCurrentAction] = useState<Partial<Action>>({
    nome: "",
    produto: "",
    unidadeMedida: "",
    metaFisica: "",
    orcamento: "",
    fonte: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (editingAction) {
      setCurrentAction(editingAction);
    } else {
      setCurrentAction({
        nome: "",
        produto: "",
        unidadeMedida: "",
        metaFisica: "",
        orcamento: "",
        fonte: "",
      });
    }
  }, [editingAction]);

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const cents = parseInt(numbers) || 0;
    const reais = cents / 100;
    return reais.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleInputChange = (field: keyof Action, value: string) => {
    if (field === "orcamento") {
      const formattedValue = formatCurrency(value);
      setCurrentAction((prev) => ({ ...prev, [field]: formattedValue }));
    } else {
      setCurrentAction((prev) => ({ ...prev, [field]: value }));
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

  const handleSave = async () => {
    if (!currentAction.nome?.trim()) {
      toast({ title: "Preencha o nome da ação" });
      return;
    }
    await onSave({ ...currentAction, program_id: programId });
  };

  const handleSaveToIdeasBank = () => {
    if (!currentAction.nome?.trim()) {
      toast({ title: "Preencha o nome da ação para salvar no banco de ideias." });
      return;
    }
    onSaveToIdeasBank({
      nome: currentAction.nome || "",
      produto: currentAction.produto || "",
      unidadeMedida: currentAction.unidadeMedida || "",
      categoria: "Geral",
    });
  };

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader>
        <CardTitle className="text-lg">
          {editingAction ? "Editar Ação" : "Nova Ação"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editingAction && (
          <div>
            <Label htmlFor="selectIdea">Selecionar do Banco de Ideias (opcional)</Label>
            <Select onValueChange={handleSelectIdea}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma ideia ou crie uma nova ação" />
              </SelectTrigger>
              <SelectContent>
                {ideas.filter((idea) => !idea.isUsed).map((idea) => (
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
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {editingAction ? "Salvar Alterações" : "Adicionar Ação"}
          </Button>
          {!editingAction && (
            <Button
              variant="outline"
              onClick={handleSaveToIdeasBank}
              disabled={!currentAction.nome?.trim() || loading}
            >
              Salvar no Banco de Ideias
            </Button>
          )}
          {editingAction && (
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
