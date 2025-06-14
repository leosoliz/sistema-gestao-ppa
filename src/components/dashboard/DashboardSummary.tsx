
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import type { Program, Idea } from "@/pages/Index";
import type { Eixo } from "@/types/eixo";

interface DashboardSummaryProps {
  programs: Program[];
  ideas: Idea[];
  eixos: Eixo[];
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });
};

export const DashboardSummary = ({ programs, ideas, eixos }: DashboardSummaryProps) => {
  const totalBudget = programs.reduce((total, program) => {
    const programBudget = program.acoes.reduce((programTotal, action) => {
      const totalOrc =
        [action.orcamento2026, action.orcamento2027, action.orcamento2028, action.orcamento2029]
          .map(x => parseFloat((x || "0").replace(/[^\d,]/g, '').replace(',', '.') || '0'))
          .reduce((sum, val) => sum + val, 0);
      return programTotal + totalOrc;
    }, 0);
    return total + programBudget;
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total de Programas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{programs.length}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total de Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {programs.reduce((total, program) => total + program.acoes.length, 0)}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Banco de Ideias</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{ideas.length}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Eixos Temáticos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{eixos.length}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
        <CardHeader className="pb-2 flex flex-row items-center space-y-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Orçamento Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold" title={formatCurrency(totalBudget)}>
            {formatCurrency(totalBudget)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
