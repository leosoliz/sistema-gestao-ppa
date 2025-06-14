
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

function resumoMetas(a: Action) {
  return (
    <span>
      2026: {a.metaFisica2026 || '-'} | 2027: {a.metaFisica2027 || '-'} | 2028: {a.metaFisica2028 || '-'} | 2029: {a.metaFisica2029 || '-'}
    </span>
  );
}

function resumoOrcamento(a: Action) {
  function total() {
    const vals = [a.orcamento2026, a.orcamento2027, a.orcamento2028, a.orcamento2029].map(
      v => parseFloat((v || "0").replace(/[^\d,]/g, '').replace(',', '.') || "0")
    );
    return vals.reduce((s, v) => s + v, 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  return (
    <span>
      2026: {a.orcamento2026 || '-'} | 2027: {a.orcamento2027 || '-'} | 2028: {a.orcamento2028 || '-'} | 2029: {a.orcamento2029 || '-'}
      <br />
      <strong className="text-blue-800">Total: {total()}</strong>
    </span>
  );
}

export const ActionsList = ({
  actions,
  loading,
  editingId,
  onEdit,
  onDelete,
}: ActionsListProps) => {
  const sortedActions = [...actions].sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

  if (!actions.length) return null;
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Ações Cadastradas ({actions.length})</h3>
      <div className="space-y-3">
        {sortedActions.map((action) => (
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
                      <span className="font-medium">Metas:</span> {resumoMetas(action)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Orçamento:</span> {resumoOrcamento(action)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Fonte:</span> {action.fonte}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Unidade:</span> {action.unidadeMedida}
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
