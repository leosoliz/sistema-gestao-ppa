
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import type { Action } from "@/pages/Index";

interface ActionsListProps {
  actions: Action[];
  loading: boolean;
  editingId: string | null;
  onEdit: (action: Action) => void;
  onDelete: (action: Action) => Promise<void>;
}

export const ActionsList = ({
  actions,
  loading,
  editingId,
  onEdit,
  onDelete,
}: ActionsListProps) => {
  if (!actions.length) return null;
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Ações Cadastradas ({actions.length})</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Card key={action.id} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  <div>
                    <p className="font-medium text-blue-900">{action.nome}</p>
                    <p className="text-sm text-gray-600">Produto: {action.produto}</p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Meta:</span>{" "}
                      {action.metaFisica} {action.unidadeMedida}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Orçamento:</span> {action.orcamento}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Fonte:</span> {action.fonte}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(action)}
                    disabled={!!editingId || loading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(action)}
                    disabled={!!editingId || loading}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
