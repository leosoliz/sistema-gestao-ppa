
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";
import { Program } from "@/pages/Index";

interface ProgramActionsTabProps {
  program: Program;
}

export const ProgramActionsTab = ({ program }: ProgramActionsTabProps) => {
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
      {program.acoes.map((acao, index) => (
        <Card key={acao.id} className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg text-green-900">
                  {acao.nome}
                </CardTitle>
                {acao.produto && (
                  <CardDescription className="mt-1">
                    Produto: {acao.produto}
                  </CardDescription>
                )}
              </div>
              <Badge variant="outline">
                Ação #{index + 1}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Meta Física</h4>
                <p className="text-gray-600">
                  {acao.metaFisica} {acao.unidadeMedida}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Orçamento</h4>
                <p className="text-gray-600 font-medium">
                  {acao.orcamento || "Não informado"}
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
      ))}
    </div>
  );
};
