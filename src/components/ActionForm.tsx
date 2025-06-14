
import { useEffect, useState, useMemo } from "react";
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
  // Estado inicial com campos plurianuais
  const [currentAction, setCurrentAction] = useState<Partial<Action>>({
    nome: "",
    produto: "",
    unidadeMedida: "",
    fonte: "",
    metaFisica2026: "",
    metaFisica2027: "",
    metaFisica2028: "",
    metaFisica2029: "",
    orcamento2026: "",
    orcamento2027: "",
    orcamento2028: "",
    orcamento2029: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (editingAction) {
      setCurrentAction({
        ...editingAction,
      });
    } else {
      setCurrentAction({
        nome: "",
        produto: "",
        unidadeMedida: "",
        fonte: "",
        metaFisica2026: "",
        metaFisica2027: "",
        metaFisica2028: "",
        metaFisica2029: "",
        orcamento2026: "",
        orcamento2027: "",
        orcamento2028: "",
        orcamento2029: "",
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

  const parseCurrency = (value: string) => {
    if (!value) return 0;
    // Remove tudo exceto números, vírgula e ponto
    const numeric = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numeric) || 0;
  };

  // Calcule o total dos quatro anos
  const totalOrcamento = useMemo(() => {
    return [
      currentAction.orcamento2026,
      currentAction.orcamento2027,
      currentAction.orcamento2028,
      currentAction.orcamento2029,
    ].reduce((total, orc) => total + parseCurrency(orc || ""), 0);
  }, [
    currentAction.orcamento2026,
    currentAction.orcamento2027,
    currentAction.orcamento2028,
    currentAction.orcamento2029,
  ]);

  const handleInputChange = (field: keyof Action, value: string) => {
    if (field.startsWith("orcamento")) {
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
        fonte: "",
        metaFisica2026: "",
        metaFisica2027: "",
        metaFisica2028: "",
        metaFisica2029: "",
        orcamento2026: "",
        orcamento2027: "",
        orcamento2028: "",
        orcamento2029: "",
      });
    }
  };

  const handleSave = async () => {
    if (!currentAction.nome?.trim()) {
      toast({ title: "Preencha o nome da ação" });
      return;
    }
    await onSave({ ...currentAction });
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

        <div className="bg-green-100/50 border border-green-300 p-3 rounded space-y-3 mt-2">
          <div className="font-medium text-green-700 mb-2">Metas Físicas Plurianuais</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <Label htmlFor="meta2026">Meta Física 2026</Label>
              <Input
                id="meta2026"
                value={currentAction.metaFisica2026 || ""}
                onChange={e => handleInputChange("metaFisica2026", e.target.value)}
                placeholder="Valor"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="meta2027">Meta Física 2027</Label>
              <Input
                id="meta2027"
                value={currentAction.metaFisica2027 || ""}
                onChange={e => handleInputChange("metaFisica2027", e.target.value)}
                placeholder="Valor"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="meta2028">Meta Física 2028</Label>
              <Input
                id="meta2028"
                value={currentAction.metaFisica2028 || ""}
                onChange={e => handleInputChange("metaFisica2028", e.target.value)}
                placeholder="Valor"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="meta2029">Meta Física 2029</Label>
              <Input
                id="meta2029"
                value={currentAction.metaFisica2029 || ""}
                onChange={e => handleInputChange("metaFisica2029", e.target.value)}
                placeholder="Valor"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-100/50 border border-blue-300 p-3 rounded space-y-3">
          <div className="font-medium text-blue-700 mb-2">Orçamentos Plurianuais</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <Label htmlFor="orcamento2026">Orçamento 2026 (R$)</Label>
              <Input
                id="orcamento2026"
                value={currentAction.orcamento2026 || ""}
                onChange={e => handleInputChange("orcamento2026", e.target.value)}
                placeholder="R$ 0,00"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="orcamento2027">Orçamento 2027 (R$)</Label>
              <Input
                id="orcamento2027"
                value={currentAction.orcamento2027 || ""}
                onChange={e => handleInputChange("orcamento2027", e.target.value)}
                placeholder="R$ 0,00"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="orcamento2028">Orçamento 2028 (R$)</Label>
              <Input
                id="orcamento2028"
                value={currentAction.orcamento2028 || ""}
                onChange={e => handleInputChange("orcamento2028", e.target.value)}
                placeholder="R$ 0,00"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="orcamento2029">Orçamento 2029 (R$)</Label>
              <Input
                id="orcamento2029"
                value={currentAction.orcamento2029 || ""}
                onChange={e => handleInputChange("orcamento2029", e.target.value)}
                placeholder="R$ 0,00"
                disabled={loading}
              />
            </div>
          </div>
          <div className="bg-white border border-blue-200 px-4 py-2 rounded mt-2 flex flex-col md:flex-row md:items-center md:justify-between">
            <span className="font-semibold text-blue-900">Orçamento Total (2026-2029):</span>
            <span className="text-xl font-bold text-blue-800">{totalOrcamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
        </div>

        <div className="flex space-x-2 mt-2">
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
