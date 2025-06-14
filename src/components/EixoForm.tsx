
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eixo } from "@/types/eixo";

interface EixoFormProps {
  onSubmit: (eixo: Omit<Eixo, "id" | "createdAt" | "isUsed">) => void;
  initialData?: Eixo;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const EixoForm = ({ onSubmit, initialData, onCancel, isEditing = false }: EixoFormProps) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || "",
    descricao: initialData?.descricao || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert("Por favor, preencha o nome do eixo.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      if (!isEditing) {
        setFormData({
          nome: "",
          descricao: "",
        });
      }
    } catch (error) {
      console.error('Erro ao salvar eixo:', error);
    } finally {
      setIsSubmitting(false);
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-4">
            {isEditing && onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar Eixo")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
