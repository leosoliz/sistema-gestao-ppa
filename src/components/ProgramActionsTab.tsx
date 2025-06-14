
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, CheckCircle } from "lucide-react";
import { Program } from "@/pages/Index";
import { getActionUsageInfo } from "@/utils/actionUtils";
import { usePrograms } from "@/hooks/usePrograms";

interface ProgramActionsTabProps {
  program: Program;
}

function resumoMetas(a) {
  return [
    `2026: ${a.metaFisica2026 || "-"}`,
    `2027: ${a.metaFisica2027 || "-"}`,
    `2028: ${a.metaFisica2028 || "-"}`,
    `2029: ${a.metaFisica2029 || "-"}`
  ].join(" | ");
}

function resumoOrcamento(a) {
  const vals = [a.orcamento2026, a.orcamento2027, a.orcamento2028, a.orcamento2029].map(
    v => parseFloat((v || "0").replace(/[^\d,]/g, '').replace(',', '.'))
  );
  const total = vals.reduce((s, v) => s + v, 0);
  return [
    `2026: ${a.orcamento2026 || "-"}`,
    `2027: ${a.orcamento2027 || "-"}`,
    `2028: ${a.orcamento2028 || "-"}`,
    `2029: ${a.orcamento2029 || "-"}`
  ].join(" | ") + `\nTotal: ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
}

export const ProgramActionsTab = ({ program }: ProgramActionsTabProps) => {
  const { programs } = usePrograms();

  if (program.acoes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhuma ação cadastrada ainda.</p>
          <p className="text-gray-400">Edite o programa para adicionar ações.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {program.acoes.map((acao, index) => {
        const usageInfo = getActionUsageInfo(acao, program.id, programs);
        return (
          <Card key={acao.id} className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg text-green-900">
                      {acao.nome}
                    </CardTitle>
                    {usageInfo.isUsed && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">
                          Em uso
                        </span>
                      </div>
                    )}
                  </div>
                  {acao.produto && (
                    <CardDescription className="mt-1">
                      Produto: {acao.produto}
                    </CardDescription>
                  )}
                  {usageInfo.isUsed && (
                    <CardDescription className="mt-1 text-blue-600">
                      Também utilizada em: {usageInfo.programNames.join(", ")}
                    </CardDescription>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline">
                    Ação #{index + 1}
                  </Badge>
                  {usageInfo.isUsed && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                      Reutilizada
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Meta Física</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line">
                    {resumoMetas(acao)} {acao.unidadeMedida}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Orçamento</h4>
                  <p className="text-gray-600 font-medium text-sm whitespace-pre-line">
                    {resumoOrcamento(acao)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Fonte</h4>
                  <p className="text-gray-600">
                    {acao.fonte || "Não informado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
