
import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Program } from "@/pages/Index";

// Converte string de moeda para número.
const parseCurrency = (value: string | undefined | null): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.') || '0');
};

// Formata um número grande para uma string curta para os eixos do gráfico (ex: 1.5M, 250k).
const formatCurrencyForAxis = (value: number) => {
  if (value >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$${(value / 1_000).toFixed(0)}k`;
  return `R$${value}`;
};

// Formata um número como moeda completa para a dica de ferramenta (tooltip).
const formatCurrencyForTooltip = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

interface BudgetByDepartmentChartProps {
  programs: Program[];
}

/**
 * Componente que exibe um gráfico de barras com o orçamento por departamento ou por programa,
 * com um controle para alternar entre as duas visualizações.
 */
export const BudgetByDepartmentChart = ({ programs }: BudgetByDepartmentChartProps) => {
  // Estado para alternar a visualização entre 'departamento' e 'programa'.
  const [view, setView] = useState<'department' | 'program'>('department');

  // `useMemo` é usado para recalcular os dados do gráfico apenas quando os programas ou a visualização mudam.
  // Isso otimiza a performance, evitando recálculos desnecessários a cada renderização.
  const chartData = useMemo(() => {
    let data;

    // Lógica para agrupar o orçamento por departamento.
    if (view === 'department') {
      const budgetByDepartment = programs.reduce((acc, program) => {
        const department = program.departamento || "Não especificado";
        // Soma o orçamento total de um programa (todos os anos de todas as ações).
        const programTotalBudget = program.acoes.reduce((sum, action) => {
          return sum +
            parseCurrency(action.orcamento2026) +
            parseCurrency(action.orcamento2027) +
            parseCurrency(action.orcamento2028) +
            parseCurrency(action.orcamento2029);
        }, 0);

        if (!acc[department]) {
          acc[department] = 0;
        }
        acc[department] += programTotalBudget;
        return acc;
      }, {} as Record<string, number>);

      // Converte o objeto para o formato que o gráfico espera: [{ name: 'Dept A', total: 1000 }]
      data = Object.entries(budgetByDepartment).map(([name, total]) => ({ name, total }));
    } else {
      // Lógica para listar o orçamento individual de cada programa.
      data = programs.map(program => {
        const total = program.acoes.reduce((sum, action) => {
          return sum +
            parseCurrency(action.orcamento2026) +
            parseCurrency(action.orcamento2027) +
            parseCurrency(action.orcamento2028) +
            parseCurrency(action.orcamento2029);
        }, 0);
        return { name: program.programa, total };
      });
    }
    
    // Ordena os dados para que a barra com maior valor apareça no topo do gráfico.
    return data.sort((a, b) => b.total - a.total);
  }, [programs, view]);

  // Configuração para o componente de gráfico (cores, labels, etc.).
  const chartConfig = {
    total: {
      label: "Orçamento",
      color: "hsl(var(--chart-1))",
    },
  };

  // Não renderiza o componente se não houver dados para exibir.
  if (chartData.length === 0) {
    return null;
  }

  // Títulos e descrições dinâmicos baseados na visualização atual.
  const cardTitle = view === 'department' ? 'Orçamento por Departamento' : 'Orçamento por Programa';
  const cardDescription = view === 'department'
    ? 'Distribuição de recursos entre os departamentos'
    : 'Distribuição de recursos entre os programas';

  return (
    <Card>
      <CardHeader className="flex-col sm:flex-row flex items-start justify-between gap-4">
        <div>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </div>
        {/* Botões de alternância para mudar a visualização do gráfico. */}
        <ToggleGroup
          type="single"
          defaultValue="department"
          value={view}
          onValueChange={(value) => {
            if (value) setView(value as 'department' | 'program');
          }}
          className="bg-background"
        >
          <ToggleGroupItem value="department" aria-label="Ver por departamento">
            Departamento
          </ToggleGroupItem>
          <ToggleGroupItem value="program" aria-label="Ver por programa">
            Programa
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="pl-2">
        {/* Container do gráfico da biblioteca recharts. */}
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              layout="vertical" // Define o gráfico como barras horizontais.
              margin={{ right: 16 }}
            >
              <XAxis
                type="number"
                dataKey="total"
                tickFormatter={formatCurrencyForAxis}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={150}
                className="text-xs truncate"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent
                  formatter={(value) => formatCurrencyForTooltip(value as number)}
                  indicator="dot"
                />}
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
