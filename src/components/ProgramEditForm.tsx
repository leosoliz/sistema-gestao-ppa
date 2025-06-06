import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ActionsManager } from "./ActionsManager";
import { EixoForm } from "./EixoForm";
import { Program, Action, Idea } from "@/pages/Index";
import { Eixo } from "@/types/eixo";
import { useEixos } from "@/hooks/useEixos";

interface ProgramEditFormProps {
  program: Program;
  ideas: Idea[];
  onUpdate: (program: Program) => void;
  onAddToIdeasBank: (idea: Omit<Idea, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export const ProgramEditForm = ({ program, ideas, onUpdate, onAddToIdeasBank, onCancel }: ProgramEditFormProps) => {
  const [formData, setFormData] = useState({
    secretaria: program.secretaria,
    departamento: program.departamento,
    eixo: program.eixo,
    programa: program.programa,
    descricao: program.descricao,
    justificativa: program.justificativa,
    objetivos: program.objetivos,
    diretrizes: program.diretrizes,
  });
  
  const [acoes, setAcoes] = useState<Action[]>(program.acoes);
  const [isEixoDialogOpen, setIsEixoDialogOpen] = useState(false);
  
  const { eixos, addEixo } = useEixos();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEixoSelect = (value: string) => {
    if (value === "novo") {
      setIsEixoDialogOpen(true);
    } else {
      handleInputChange("eixo", value);
    }
  };

  const handleNewEixo = async (eixoData: Omit<Eixo, "id" | "createdAt">) => {
    await addEixo(eixoData);
    setFormData(prev => ({ ...prev, eixo: eixoData.nome }));
    setIsEixoDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.programa.trim()) {
      alert("Por favor, preencha pelo menos o nome do programa.");
      return;
    }

    const updatedProgram: Program = {
      ...program,
      ...formData,
      acoes,
    };

    onUpdate(updatedProgram);
    onCancel();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Programa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="secretaria">Secretaria</Label>
                <Input
                  id="secretaria"
                  value={formData.secretaria}
                  onChange={(e) => handleInputChange("secretaria", e.target.value)}
                  placeholder="Ex: Desenvolvimento Econômico"
                />
              </div>
              
              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => handleInputChange("departamento", e.target.value)}
                  placeholder="Ex: Turismo"
                />
              </div>
              
              <div>
                <Label htmlFor="eixo">Eixo</Label>
                <div className="flex gap-2">
                  <Select value={formData.eixo} onValueChange={handleEixoSelect}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um eixo" />
                    </SelectTrigger>
                    <SelectContent>
                      {eixos.map((eixo) => (
                        <SelectItem key={eixo.id} value={eixo.nome}>
                          {eixo.nome}
                        </SelectItem>
                      ))}
                      <Separator className="my-1" />
                      <SelectItem value="novo" className="text-blue-600">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Criar novo eixo
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.eixo && (
                  <div className="mt-1 text-sm text-gray-600">
                    Eixo selecionado: {formData.eixo}
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="programa">Programa *</Label>
                <Input
                  id="programa"
                  value={formData.programa}
                  onChange={(e) => handleInputChange("programa", e.target.value)}
                  placeholder="Nome do programa"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  placeholder="Descreva o programa..."
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="justificativa">Justificativa</Label>
                <Textarea
                  id="justificativa"
                  value={formData.justificativa}
                  onChange={(e) => handleInputChange("justificativa", e.target.value)}
                  placeholder="Justifique a necessidade do programa..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="objetivos">Objetivos</Label>
              <Textarea
                id="objetivos"
                value={formData.objetivos}
                onChange={(e) => handleInputChange("objetivos", e.target.value)}
                placeholder="Objetivos do programa..."
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="diretrizes">Diretrizes</Label>
              <Textarea
                id="diretrizes"
                value={formData.diretrizes}
                onChange={(e) => handleInputChange("diretrizes", e.target.value)}
                placeholder="Diretrizes do programa..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Ações do Programa</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionsManager 
                actions={acoes}
                onActionsChange={setAcoes}
                ideas={ideas}
                onAddToIdeasBank={onAddToIdeasBank}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Salvar Alterações
            </Button>
          </div>
        </form>

        <Dialog open={isEixoDialogOpen} onOpenChange={setIsEixoDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Eixo</DialogTitle>
            </DialogHeader>
            <EixoForm 
              onSubmit={handleNewEixo}
              onCancel={() => setIsEixoDialogOpen(false)}
              isEditing={false}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
