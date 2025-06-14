
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, AlertCircle, CheckCircle } from "lucide-react";
import { Eixo } from "@/types/eixo";
import { EixoForm } from "./EixoForm";

interface EixosListProps {
  eixos: Eixo[];
  onUpdate: (eixo: Eixo) => void;
  onDelete: (eixoId: string) => void;
}

export const EixosList = ({ eixos, onUpdate, onDelete }: EixosListProps) => {
  const [editingEixo, setEditingEixo] = useState<Eixo | null>(null);

  const handleUpdate = async (updatedData: Omit<Eixo, "id" | "createdAt" | "isUsed">) => {
    if (editingEixo) {
      await onUpdate({
        ...editingEixo,
        ...updatedData
      });
      setEditingEixo(null);
    }
  };

  const handleDelete = async (eixo: Eixo) => {
    if (eixo.isUsed) {
      alert('Este eixo não pode ser excluído pois está sendo utilizado em programas ativos.');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir este eixo?')) {
      await onDelete(eixo.id);
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
        <Card key={eixo.id} className={`hover:shadow-lg transition-shadow ${eixo.isUsed ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-200'}`}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg text-blue-900 line-clamp-2">
                    {eixo.nome}
                  </CardTitle>
                  {eixo.isUsed ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Em uso
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Disponível
                    </Badge>
                  )}
                </div>
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
                variant={eixo.isUsed ? "secondary" : "destructive"}
                onClick={() => handleDelete(eixo)}
                className={`h-8 ${eixo.isUsed ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={eixo.isUsed}
                title={eixo.isUsed ? 'Não é possível excluir eixos em uso' : 'Excluir eixo'}
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
