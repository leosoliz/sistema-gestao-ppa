import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Lightbulb, Eye, Target } from "lucide-react";
import { ProgramForm } from "@/components/ProgramForm";
import { ProgramList } from "@/components/ProgramList";
import { IdeasBank } from "@/components/IdeasBank";
import { ProgramDetail } from "@/components/ProgramDetail";
import { EixosManager } from "@/components/EixosManager";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { BudgetByDepartmentChart } from "@/components/dashboard/BudgetByDepartmentChart";
import { usePrograms } from "@/hooks/usePrograms";
import { useIdeas } from "@/hooks/useIdeas";
import { useEixos } from "@/hooks/useEixos";

/** Interface para uma Ação de um programa. */
export interface Action {
  id: string;
  nome: string;
  produto: string;
  unidadeMedida: string;
  fonte: string;
  metaFisica2026?: string;
  metaFisica2027?: string;
  metaFisica2028?: string;
  metaFisica2029?: string;
  orcamento2026?: string;
  orcamento2027?: string;
  orcamento2028?: string;
  orcamento2029?: string;
}

/** Interface para um Programa. */
export interface Program {
  id: string;
  secretaria: string;
  departamento: string;
  eixo: string;
  programa: string;
  descricao: string;
  justificativa: string;
  objetivos: string;
  diretrizes: string;
  acoes: Action[];
  createdAt: Date;
}

/** Interface para uma Ideia do banco de ideias. */
export interface Idea {
  id: string;
  nome: string;
  produto: string;
  unidadeMedida: string;
  categoria: string;
  createdAt: Date;
  isUsed?: boolean;
}

/**
 * Componente principal da aplicação (Página Index).
 * Orquestra a exibição das diferentes seções (Dashboard, Programas, Ideias, etc.)
 * e gerencia o estado global da aplicação, como o programa selecionado.
 */
const Index = () => {
  // Estado para armazenar o programa que está sendo visualizado em detalhe.
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  // Estado para controlar a aba ativa na interface principal.
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Hooks customizados para buscar e gerenciar os dados de programas, ideias e eixos.
  const { programs, loading: programsLoading, addProgram, updateProgram, deleteProgram, refreshPrograms } = usePrograms();
  const { ideas, loading: ideasLoading, addIdea, deleteIdea, updateIdea, markIdeaAsUsed, syncIdeasUsageStatus, refreshIdeas } = useIdeas();
  const { eixos, loading: eixosLoading } = useEixos();

  // Efeito para manter o `selectedProgram` sincronizado com a lista principal `programs`.
  // Isso é crucial para que as atualizações feitas em um programa (ex: edição) sejam refletidas
  // na tela de detalhes sem precisar de recarregamento manual.
  useEffect(() => {
    if (selectedProgram) {
      const freshProgram = programs.find(p => p.id === selectedProgram.id);
      if (freshProgram) {
        // Compara os objetos para evitar re-renderizações desnecessárias.
        if (JSON.stringify(selectedProgram) !== JSON.stringify(freshProgram)) {
          setSelectedProgram(freshProgram);
        }
      } else {
        // Se o programa não for encontrado na lista, ele pode ter sido excluído.
        setSelectedProgram(null);
        setActiveTab("dashboard");
      }
    }
  }, [programs, selectedProgram]);

  // Efeito para recarregar a lista de ideias quando o usuário navega para a aba "Banco de Ideias".
  // Garante que os dados exibidos (especialmente o status 'isUsed') estejam sempre atualizados.
  useEffect(() => {
    if (activeTab === "ideias") {
      refreshIdeas();
    }
  }, [activeTab, refreshIdeas]);

  // Função para definir um programa como selecionado e navegar para a aba de visualização.
  const viewProgram = (program: Program) => {
    setSelectedProgram(program);
    setActiveTab("view");
  };

  // Manipulador para a atualização de um programa.
  const handleUpdateProgram = (updatedProgram: Program) => {
    updateProgram(updatedProgram);
    setSelectedProgram(updatedProgram); // Atualiza o estado local imediatamente.
    refreshPrograms(); // Força a atualização da lista principal para garantir consistência.
  };

  // Novo cálculo do orçamento total usando todos os anos das ações:
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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  // Exibe uma tela de carregamento enquanto os dados principais estão sendo buscados.
  if (programsLoading || ideasLoading || eixosLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Renderização principal da página.
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img 
                src="/lovable-uploads/e00a40bf-e999-462e-bf44-4324f7b7e85f.png" 
                alt="Brasão Presidente Getúlio" 
                className="h-10 sm:h-12 w-auto"
              />
              <div>
                <h1 className="text-base sm:text-xl font-bold text-blue-900">
                  Sistema de Gestão de Programas
                </h1>
                <p className="text-xs sm:text-sm text-blue-600">
                  Prefeitura Municipal de Presidente Getúlio
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navegação por Select em telas pequenas */}
          <div className="sm:hidden px-1">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma seção..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">
                  <div className="flex items-center gap-2"><FileText className="h-4 w-4" />Dashboard</div>
                </SelectItem>
                <SelectItem value="novo">
                  <div className="flex items-center gap-2"><Plus className="h-4 w-4" />Novo Programa</div>
                </SelectItem>
                <SelectItem value="ideias">
                  <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4" />Banco de Ideias</div>
                </SelectItem>
                <SelectItem value="view" disabled={!selectedProgram}>
                  <div className="flex items-center gap-2"><Eye className="h-4 w-4" />Visualizar</div>
                </SelectItem>
                <SelectItem value="configuracoes">
                  <div className="flex items-center gap-2"><Target className="h-4 w-4" />Eixos Temáticos</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Navegação por Tabs em telas maiores */}
          <TabsList className="hidden sm:grid w-full grid-cols-5 bg-white/50 backdrop-blur">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="novo" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Programa
            </TabsTrigger>
            <TabsTrigger value="ideias" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Banco de Ideias
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center gap-2" disabled={!selectedProgram}>
              <Eye className="h-4 w-4" />
              Visualizar
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Eixos Temáticos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardSummary programs={programs} ideas={ideas} eixos={eixos} />

            <BudgetByDepartmentChart programs={programs} />

            <Card>
              <CardHeader>
                <CardTitle>Programas Cadastrados</CardTitle>
                <CardDescription>
                  Gerencie todos os programas municipais cadastrados no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgramList 
                  programs={programs} 
                  onView={viewProgram}
                  onDelete={deleteProgram}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="novo">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Novo Programa</CardTitle>
                <CardDescription>
                  Preencha todos os campos para cadastrar um novo programa municipal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgramForm 
                  onSubmit={addProgram} 
                  ideas={ideas}
                  onAddToIdeasBank={addIdea}
                  refreshPrograms={refreshPrograms}
                  refreshIdeas={refreshIdeas}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ideias">
            <Card>
              <CardHeader>
                <CardTitle>Banco de Ideias</CardTitle>
                <CardDescription>
                  Gerencie ideias de ações que podem ser reutilizadas em diferentes programas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IdeasBank 
                  ideas={ideas}
                  onAdd={addIdea}
                  onDelete={deleteIdea}
                  onUpdate={updateIdea}
                  onMarkAsUsed={markIdeaAsUsed}
                  onSyncUsage={syncIdeasUsageStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view">
            {selectedProgram && (
              <ProgramDetail 
                program={selectedProgram}
                ideas={ideas}
                onUpdate={handleUpdateProgram}
                onAddToIdeasBank={addIdea}
                refreshPrograms={refreshPrograms}
                refreshIdeas={refreshIdeas}
              />
            )}
          </TabsContent>

          <TabsContent value="configuracoes">
            <EixosManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
