
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, Search } from "lucide-react";
import { Idea } from "@/pages/Index";

interface IdeasBankProps {
  ideas: Idea[];
  onAdd: (idea: Omit<Idea, "id" | "createdAt">) => void;
  onDelete: (ideaId: string) => void;
}

export const IdeasBank = ({ ideas, onAdd, onDelete }: IdeasBankProps) => {
  const [newIdea, setNewIdea] = useState({
    nome: "",
    produto: "",
    unidadeMedida: "",
    categoria: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  const categories = Array.from(new Set(ideas.map(idea => idea.categoria).filter(Boolean)));

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.produto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || idea.categoria === filterCategory;
    return matchesSearch && matchesCategory;
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
    <div className="space-y-6">
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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar ideias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium">
          Ideias Cadastradas ({filteredIdeas.length})
        </h3>
        
        {filteredIdeas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                {ideas.length === 0 ? "Nenhuma ideia cadastrada ainda." : "Nenhuma ideia encontrada com os filtros aplicados."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map((idea) => (
              <Card key={idea.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-blue-900 line-clamp-2">
                      {idea.nome}
                    </h4>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir esta ideia?')) {
                          onDelete(idea.id);
                        }
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {idea.produto && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Produto:</span> {idea.produto}
                    </p>
                  )}
                  
                  {idea.unidadeMedida && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Unidade:</span> {idea.unidadeMedida}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {idea.categoria}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {idea.createdAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
