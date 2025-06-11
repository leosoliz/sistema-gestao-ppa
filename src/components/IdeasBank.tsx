import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash, Search, CheckCircle, EyeOff, RefreshCw, Edit, Eye } from "lucide-react";
import { Idea, Program } from "@/pages/Index";
import { getIdeaUsageInfo, checkIdeaUsageInDatabase } from "@/utils/ideaUtils";
import { getAvailableIdeas } from "@/utils/availableIdeasUtils";

interface IdeasBankProps {
  ideas: Idea[];
  programs: Program[];
  onAdd: (idea: Omit<Idea, "id" | "createdAt">) => void;
  onDelete: (ideaId: string) => void;
  onUpdate?: (ideaId: string, idea: Omit<Idea, "id" | "createdAt">) => void;
}

export const IdeasBank = ({ ideas, programs, onAdd, onDelete, onUpdate }: IdeasBankProps) => {
  const [newIdea, setNewIdea] = useState({
    nome: "",
    produto: "",
    unidadeMedida: "",
    categoria: "",
  });
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [editForm, setEditForm] = useState({
    nome: "",
    produto: "",
    unidadeMedida: "",
    categoria: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showUsedIdeas, setShowUsedIdeas] = useState(false);
  const [databaseUsageInfo, setDatabaseUsageInfo] = useState<Record<string, { isUsed: boolean; programNames: string[] }>>({});
  const [manuallyHiddenIdeas, setManuallyHiddenIdeas] = useState<Set<string>>(new Set());
  const [isCheckingDatabase, setIsCheckingDatabase] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const categories = Array.from(new Set(ideas.map(idea => idea.categoria).filter(Boolean)));
  const availableIdeas = getAvailableIdeas(ideas, programs);
  
  // Filtra ideias considerando também as manualmente ocultas
  const filteredAvailableIdeas = availableIdeas.filter(idea => !manuallyHiddenIdeas.has(idea.id));
  const ideasToShow = showUsedIdeas ? ideas : filteredAvailableIdeas;

  // Função para verificar uso no banco de dados
  const checkDatabaseUsage = async () => {
    setIsCheckingDatabase(true);
    console.log('Iniciando verificação no banco de dados para', ideas.length, 'ideias');
    
    const usageInfo: Record<string, { isUsed: boolean; programNames: string[] }> = {};
    
    for (const idea of ideas) {
      console.log('Verificando ideia:', idea.nome);
      const dbUsage = await checkIdeaUsageInDatabase(idea);
      usageInfo[idea.id] = dbUsage;
      console.log('Resultado para', idea.nome, ':', dbUsage);
    }
    
    console.log('Verificação completa. Resultados:', usageInfo);
    setDatabaseUsageInfo(usageInfo);
    setIsCheckingDatabase(false);
  };

  // Verificar uso no banco ao carregar o componente
  useEffect(() => {
    if (ideas.length > 0) {
      checkDatabaseUsage();
    }
  }, [ideas.length]);

  const filteredIdeas = ideasToShow.filter(idea => {
    const matchesSearch = idea.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.produto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || idea.categoria === filterCategory;
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

  const handleEditClick = (idea: Idea) => {
    setEditingIdea(idea);
    setEditForm({
      nome: idea.nome,
      produto: idea.produto,
      unidadeMedida: idea.unidadeMedida,
      categoria: idea.categoria,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editForm.nome.trim() || !editingIdea) {
      alert("Por favor, preencha pelo menos o nome da ideia.");
      return;
    }

    if (onUpdate) {
      onUpdate(editingIdea.id, {
        ...editForm,
        categoria: editForm.categoria || "Geral",
      });
    }

    setIsEditDialogOpen(false);
    setEditingIdea(null);
  };

  const toggleIdeaVisibility = (ideaId: string) => {
    const newHiddenIdeas = new Set(manuallyHiddenIdeas);
    if (newHiddenIdeas.has(ideaId)) {
      newHiddenIdeas.delete(ideaId);
    } else {
      newHiddenIdeas.add(ideaId);
    }
    setManuallyHiddenIdeas(newHiddenIdeas);
  };

  const usedIdeasCount = ideas.length - filteredAvailableIdeas.length;

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
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={checkDatabaseUsage}
          disabled={isCheckingDatabase}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingDatabase ? 'animate-spin' : ''}`} />
          Verificar BD
        </Button>

        <Button
          variant={showUsedIdeas ? "default" : "outline"}
          onClick={() => setShowUsedIdeas(!showUsedIdeas)}
          className="w-full sm:w-auto"
        >
          <EyeOff className="h-4 w-4 mr-2" />
          {showUsedIdeas ? "Ocultar Usadas" : "Mostrar Usadas"}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {showUsedIdeas ? `Todas as Ideias (${filteredIdeas.length})` : `Ideias Disponíveis (${filteredIdeas.length})`}
          </h3>
          {usedIdeasCount > 0 && !showUsedIdeas && (
            <p className="text-sm text-gray-600">
              {usedIdeasCount} ideia{usedIdeasCount > 1 ? 's' : ''} em uso (oculta{usedIdeasCount > 1 ? 's' : ''})
            </p>
          )}
        </div>
        
        {filteredIdeas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                {ideas.length === 0 
                  ? "Nenhuma ideia cadastrada ainda." 
                  : showUsedIdeas 
                    ? "Nenhuma ideia encontrada com os filtros aplicados."
                    : "Nenhuma ideia disponível com os filtros aplicados."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map((idea) => {
              const localUsageInfo = getIdeaUsageInfo(idea, programs);
              const dbUsageInfo = databaseUsageInfo[idea.id];
              const finalUsageInfo = dbUsageInfo || localUsageInfo;
              const isManuallyHidden = manuallyHiddenIdeas.has(idea.id);
              
              return (
                <Card 
                  key={idea.id} 
                  className={`hover:shadow-md transition-shadow ${
                    finalUsageInfo.isUsed || isManuallyHidden
                      ? "border-green-300 bg-green-50" 
                      : "border-gray-200"
                  }`}
                >
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-blue-900 line-clamp-2">
                            {idea.nome}
                          </h4>
                          {(finalUsageInfo.isUsed || isManuallyHidden) && (
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        {finalUsageInfo.isUsed && finalUsageInfo.programNames.length > 0 && (
                          <p className="text-xs text-green-700 mb-2">
                            Utilizada em: {finalUsageInfo.programNames.join(", ")}
                          </p>
                        )}
                        {isManuallyHidden && !finalUsageInfo.isUsed && (
                          <p className="text-xs text-green-700 mb-2">
                            Marcada como utilizada manualmente
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Dialog open={isEditDialogOpen && editingIdea?.id === idea.id} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(idea)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Ideia</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                              <div>
                                <Label htmlFor="editNome">Nome da Ideia *</Label>
                                <Input
                                  id="editNome"
                                  value={editForm.nome}
                                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                                  placeholder="Nome da ideia/ação"
                                  required
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="editProduto">Produto</Label>
                                <Input
                                  id="editProduto"
                                  value={editForm.produto}
                                  onChange={(e) => setEditForm({ ...editForm, produto: e.target.value })}
                                  placeholder="Produto esperado"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="editUnidade">Unidade de Medida</Label>
                                <Input
                                  id="editUnidade"
                                  value={editForm.unidadeMedida}
                                  onChange={(e) => setEditForm({ ...editForm, unidadeMedida: e.target.value })}
                                  placeholder="Ex: Unidade, %, Km"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="editCategoria">Categoria</Label>
                                <Input
                                  id="editCategoria"
                                  value={editForm.categoria}
                                  onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                                  placeholder="Ex: Educação, Saúde, Infraestrutura"
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                                  Salvar Alterações
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                  Cancelar
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant={isManuallyHidden ? "default" : "outline"}
                          onClick={() => toggleIdeaVisibility(idea.id)}
                          title={isManuallyHidden ? "Mostrar ideia" : "Marcar como utilizada"}
                        >
                          {isManuallyHidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>

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
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {idea.categoria}
                        </Badge>
                        {finalUsageInfo.isUsed && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            {dbUsageInfo ? "BD Confirmado" : "Detectado Local"}
                          </Badge>
                        )}
                        {isManuallyHidden && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            Manual
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {idea.createdAt.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
