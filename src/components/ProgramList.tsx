
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash, DollarSign } from "lucide-react";
import { Program } from "@/pages/Index";

interface ProgramListProps {
  programs: Program[];
  onView: (program: Program) => void;
  onDelete: (programId: string) => void;
}

export const ProgramList = ({ programs, onView, onDelete }: ProgramListProps) => {
  // Calcula o orçamento total do programa somando os orçamentos de todos os anos das actions
  const calculateProgramBudget = (program: Program) => {
    return program.acoes.reduce((total, action) => {
      const vals = [action.orcamento2026, action.orcamento2027, action.orcamento2028, action.orcamento2029].map(
        v => parseFloat((v || "0").replace(/[^\d,]/g, '').replace(',', '.') || '0')
      );
      const budget = vals.reduce((s, v) => s + v, 0);
      return total + budget;
    }, 0);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhum programa cadastrado ainda.</p>
        <p className="text-gray-400">Clique em "Novo Programa" para começar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {programs.map((program) => {
        const totalBudget = calculateProgramBudget(program);
        
        return (
          <Card key={program.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg text-blue-900 line-clamp-2">
                    {program.programa}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {program.secretaria} - {program.departamento}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {program.acoes.length} ações
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {program.eixo && (
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Eixo:</span> {program.eixo}
                </p>
              )}
              
              {program.descricao && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {program.descricao}
                </p>
              )}

              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md border border-green-200">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Orçamento: {formatCurrency(totalBudget)}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <p className="text-xs text-gray-500">
                  Criado em {program.createdAt.toLocaleDateString('pt-BR')}
                </p>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(program)}
                    className="h-8"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir este programa?')) {
                        onDelete(program.id);
                      }
                    }}
                    className="h-8"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
