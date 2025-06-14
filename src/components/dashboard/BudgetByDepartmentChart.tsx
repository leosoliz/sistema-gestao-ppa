
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Program } from "@/pages/Index";

const parseCurrency = (value: string | undefined | null): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.') || '0');
};

const formatCurrencyForAxis = (value: number) => {
  if (value >= 1_000_000) return `R$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$${(value / 1_000).toFixed(0)}k`;
  return `R$${value}`;
};

const formatCurrencyForTooltip = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

interface BudgetByDepartmentChartProps {
  programs: Program[];
}

export const BudgetByDepartmentChart = ({ programs }: BudgetByDepartmentChartProps) => {
  const budgetByDepartment = programs.reduce((acc, program) => {
    const department = program.departamento || "Não especificado";
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

  const chartData = Object.entries(budgetByDepartment)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  const chartConfig = {
    total: {
      label: "Orçamento",
      color: "hsl(var(--chart-1))",
    },
  };

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamento por Departamento</CardTitle>
        <CardDescription>Distribuição de recursos entre os departamentos</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                right: 16,
              }}
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
