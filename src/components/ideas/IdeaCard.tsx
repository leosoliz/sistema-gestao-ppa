
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash, CheckCircle, EyeOff, Edit, Eye } from "lucide-react";
import { Idea } from "@/pages/Index";

interface IdeaCardProps {
  idea: Idea;
  onDelete: (ideaId: string) => void;
  onUpdate?: (ideaId: string, idea: Omit<Idea, "id" | "createdAt" | "isUsed">) => void;
  onMarkAsUsed?: (ideaId: string, isUsed: boolean) => void;
}

export const IdeaCard = ({ idea, onDelete, onUpdate, onMarkAsUsed }: IdeaCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: idea.nome,
    produto: idea.produto,
    unidadeMedida: idea.unidadeMedida,
    categoria: idea.categoria,
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.nome.trim()) {
      alert("Por favor, preencha pelo menos o nome da ideia.");
      return;
    }
    if (onUpdate) {
      onUpdate(idea.id, {
        ...editForm,
        categoria: editForm.categoria || "Geral",
      });
    }
    setIsEditDialogOpen(false);
  };
  
  const toggleIdeaUsage = (ideaId: string, currentStatus: boolean) => {
    if (onMarkAsUsed) {
      onMarkAsUsed(ideaId, !currentStatus);
    }
  };

  const isUsed = idea.isUsed || false;

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${
        isUsed ? "border-green-300 bg-green-50" : "border-gray-200"
      }`}
    >
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-blue-900 line-clamp-2">{idea.nome}</h4>
              {isUsed && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
            </div>
            {isUsed && <p className="text-xs text-green-700 mb-2">Utilizada em programa</p>}
          </div>
          <div className="flex gap-1">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => setIsEditDialogOpen(true)}>
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
                    <Input id="editNome" value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="editProduto">Produto</Label>
                    <Input id="editProduto" value={editForm.produto} onChange={(e) => setEditForm({ ...editForm, produto: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="editUnidade">Unidade de Medida</Label>
                    <Input id="editUnidade" value={editForm.unidadeMedida} onChange={(e) => setEditForm({ ...editForm, unidadeMedida: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="editCategoria">Categoria</Label>
                    <Input id="editCategoria" value={editForm.categoria} onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Salvar Alterações</Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            {onMarkAsUsed && (
              <Button size="sm" variant={isUsed ? "default" : "outline"} onClick={() => toggleIdeaUsage(idea.id, isUsed)} title={isUsed ? "Marcar como disponível" : "Marcar como utilizada"} className={isUsed ? "bg-green-600 hover:bg-green-700" : ""}>
                {isUsed ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => { if (window.confirm('Tem certeza que deseja excluir esta ideia?')) { onDelete(idea.id); } }}>
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {idea.produto && <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Produto:</span> {idea.produto}</p>}
        {idea.unidadeMedida && <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Unidade:</span> {idea.unidadeMedida}</p>}
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs">{idea.categoria}</Badge>
            {isUsed && <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Em Uso</Badge>}
          </div>
          <p className="text-xs text-gray-500">{idea.createdAt.toLocaleDate-String('pt-BR')}</p>
        </div>
      </CardContent>
    </Card>
  );
};
