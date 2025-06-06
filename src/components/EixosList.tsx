
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash } from "lucide-react";
import { Eixo } from "@/types/eixo";
import { EixoForm } from "./EixoForm";

interface EixosListProps {
  eixos: Eixo[];
  onUpdate: (eixo: Eixo) => void;
  onDelete: (eixoId: string) => void;
}

export const EixosList = ({ eixos, onUpdate, onDelete }: EixosListProps) => {
  const [editingEixo, setEditingEixo] = useState<Eixo | null>(null);

  const handleUpdate = (updatedData: Omit<Eixo, "id" | "createdAt">) => {
    if (editingEixo) {
      onUpdate({
        ...editingEixo,
        ...updatedData
      });
      setEditingEixo(null);
    }
  };

  if (eixos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhum eixo cadastrado ainda.</p>
        <p className="text-gray-400">Cadastre um novo eixo para começar.</p>
      </div>
    );
  }

  if (editingEixo) {
    return (
      <EixoForm
        onSubmit={handleUpdate}
        initialData={editingEixo}
        onCancel={() => setEditingEixo(null)}
        isEditing={true}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {eixos.map((eixo) => (
        <Card key={eixo.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg text-blue-900 line-clamp-2">
                  {eixo.nome}
                </CardTitle>
                <CardDescription className="mt-1">
                  Criado em {eixo.createdAt.toLocaleDateString('pt-BR')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {eixo.descricao && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {eixo.descricao}
              </p>
            )}
            
            <div className="flex items-center justify-end space-x-2 pt-3 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingEixo(eixo)}
                className="h-8"
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir este eixo?')) {
                    onDelete(eixo.id);
                  }
                }}
                className="h-8"
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
