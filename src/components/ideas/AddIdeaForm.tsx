
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Idea } from "@/pages/Index";

interface AddIdeaFormProps {
  onAdd: (idea: Omit<Idea, "id" | "createdAt" | "isUsed">) => void;
}

export const AddIdeaForm = ({ onAdd }: AddIdeaFormProps) => {
  const [newIdea, setNewIdea] = useState({
    nome: "",
    produto: "",
    unidadeMedida: "",
    categoria: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.nome.trim()) {
      alert("Por favor, preencha pelo menos o nome da ideia.");
      return;
    }
    onAdd({
      ...newIdea,
      categoria: newIdea.categoria || "Geral",
    });
    setNewIdea({
      nome: "",
      produto: "",
      unidadeMedida: "",
      categoria: "",
    });
  };

  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardHeader>
        <CardTitle className="text-lg">Adicionar Nova Ideia</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ideaNome">Nome da Ideia *</Label>
              <Input
                id="ideaNome"
                value={newIdea.nome}
                onChange={(e) => setNewIdea({ ...newIdea, nome: e.target.value })}
                placeholder="Nome da ideia/ação"
                required
              />
            </div>
            <div>
              <Label htmlFor="ideaProduto">Produto</Label>
              <Input
                id="ideaProduto"
                value={newIdea.produto}
                onChange={(e) => setNewIdea({ ...newIdea, produto: e.target.value })}
                placeholder="Produto esperado"
              />
            </div>
            <div>
              <Label htmlFor="ideaUnidade">Unidade de Medida</Label>
              <Input
                id="ideaUnidade"
                value={newIdea.unidadeMedida}
                onChange={(e) => setNewIdea({ ...newIdea, unidadeMedida: e.target.value })}
                placeholder="Ex: Unidade, %, Km"
              />
            </div>
            <div>
              <Label htmlFor="ideaCategoria">Categoria</Label>
              <Input
                id="ideaCategoria"
                value={newIdea.categoria}
                onChange={(e) => setNewIdea({ ...newIdea, categoria: e.target.value })}
                placeholder="Ex: Educação, Saúde, Infraestrutura"
              />
            </div>
          </div>
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Ideia
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
