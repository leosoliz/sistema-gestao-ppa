
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import type { Program, Idea } from "@/pages/Index";
import type { Eixo } from "@/types/eixo";

interface DashboardSummaryProps {
  programs: Program[];
  ideas: Idea[];
  eixos: Eixo[];
}

/**
 * Formata um valor numérico como moeda brasileira (BRL).
 * @param value O número a ser formatado.
 * @returns A string formatada, ex: "R$ 1.234,56".
 */
const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });
};

/**
 * Converte uma string de moeda no formato brasileiro para um número.
 * @param value A string a ser convertida.
 * @returns O valor numérico.
 */
const parseCurrency = (value: string | undefined | null): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.') || '0');
};

/**
 * Componente que exibe os cards de resumo no topo do dashboard, com os principais
 * indicadores do sistema (total de programas, ações, orçamentos, etc.).
 */
export const DashboardSummary = ({ programs, ideas, eixos }: DashboardSummaryProps) => {
  // Calcula o orçamento agregado por ano, iterando sobre todos os programas e suas ações.
  const budgetByYear = programs.reduce((acc, program) => {
    program.acoes.forEach(action => {
      acc.budget2026 += parseCurrency(action.orcamento2026);
      acc.budget2027 += parseCurrency(action.orcamento2027);
      acc.budget2028 += parseCurrency(action.orcamento2028);
      acc.budget2029 += parseCurrency(action.orcamento2029);
    });
    return acc;
  }, { budget2026: 0, budget2027: 0, budget2028: 0, budget2029: 0 });

  // Calcula o orçamento total somando os totais anuais.
  const totalBudget = budgetByYear.budget2026 + budgetByYear.budget2027 + budgetByYear.budget2028 + budgetByYear.budget2029;
  
  // Contabiliza as ideias que já foram utilizadas em programas e as que ainda estão disponíveis.
  const usedIdeasCount = ideas.filter(idea => idea.isUsed).length;
  const availableIdeasCount = ideas.length - usedIdeasCount;

  // Renderiza a grade de cards com os dados calculados.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {/* Card: Total de Programas */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total de Programas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{programs.length}</p>
        </CardContent>
      </Card>
      
      {/* Card: Total de Ações */}
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
      
      {/* Card: Banco de Ideias */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Banco de Ideias</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{ideas.length}</p>
          <div className="text-xs mt-2 space-y-0.5">
            <div className="flex justify-between items-center">
              <span>Utilizadas:</span>
              <span className="font-semibold">{usedIdeasCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Disponíveis:</span>
              <span className="font-semibold">{availableIdeasCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card: Eixos Temáticos */}
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Eixos Temáticos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{eixos.length}</p>
        </CardContent>
      </Card>

      {/* Card: Orçamentos Detalhados */}
      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Orçamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>2026:</span>
              <span className="font-semibold">{formatCurrency(budgetByYear.budget2026)}</span>
            </div>
            <div className="flex justify-between">
              <span>2027:</span>
              <span className="font-semibold">{formatCurrency(budgetByYear.budget2027)}</span>
            </div>
            <div className="flex justify-between">
              <span>2028:</span>
              <span className="font-semibold">{formatCurrency(budgetByYear.budget2028)}</span>
            </div>
            <div className="flex justify-between">
              <span>2029:</span>
              <span className="font-semibold">{formatCurrency(budgetByYear.budget2029)}</span>
            </div>
          </div>
          <hr className="my-2 border-white/30" />
          <div className="flex justify-between items-center">
            <span className="text-base font-medium">Total:</span>
            <p className="text-lg font-bold">
              {formatCurrency(totalBudget)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
