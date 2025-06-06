
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eixo } from "@/types/eixo";

interface EixoFormProps {
  onSubmit: (eixo: Omit<Eixo, "id" | "createdAt">) => void;
  initialData?: Eixo;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const EixoForm = ({ onSubmit, initialData, onCancel, isEditing = false }: EixoFormProps) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || "",
    descricao: initialData?.descricao || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert("Por favor, preencha o nome do eixo.");
      return;
    }

    onSubmit(formData);

    if (!isEditing) {
      setFormData({
        nome: "",
        descricao: "",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Eixo" : "Cadastrar Novo Eixo"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Eixo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Ex: Habitação e Bem estar"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Descreva o eixo..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end space-x-4">
            {isEditing && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isEditing ? "Salvar Alterações" : "Cadastrar Eixo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
