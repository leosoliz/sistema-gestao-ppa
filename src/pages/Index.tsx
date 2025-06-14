import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Lightbulb, Eye, Target, DollarSign } from "lucide-react";
import { ProgramForm } from "@/components/ProgramForm";
import { ProgramList } from "@/components/ProgramList";
import { IdeasBank } from "@/components/IdeasBank";
import { ProgramDetail } from "@/components/ProgramDetail";
import { EixosManager } from "@/components/EixosManager";
import { usePrograms } from "@/hooks/usePrograms";
import { useIdeas } from "@/hooks/useIdeas";
import { useEixos } from "@/hooks/useEixos";

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

export interface Idea {
  id: string;
  nome: string;
  produto: string;
  unidadeMedida: string;
  categoria: string;
  createdAt: Date;
  isUsed?: boolean;
}

const Index = () => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const { programs, loading: programsLoading, addProgram, updateProgram, deleteProgram, refreshPrograms } = usePrograms();
  const { ideas, loading: ideasLoading, addIdea, deleteIdea, updateIdea, markIdeaAsUsed, syncIdeasUsageStatus, refreshIdeas } = useIdeas();
  const { eixos, loading: eixosLoading } = useEixos();

  // Refresh ideas list when switching to ideas tab
  useEffect(() => {
    if (activeTab === "ideias") {
      refreshIdeas();
    }
  }, [activeTab, refreshIdeas]);

  const viewProgram = (program: Program) => {
    setSelectedProgram(program);
    setActiveTab("view");
  };

  const handleUpdateProgram = (updatedProgram: Program) => {
    updateProgram(updatedProgram);
    setSelectedProgram(updatedProgram);
    refreshPrograms(); // Atualiza lista após edição! Opcional, mas recomendado para sincronia
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/e00a40bf-e999-462e-bf44-4324f7b7e85f.png" 
                alt="Brasão Presidente Getúlio" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-blue-900">
                  Sistema de Gestão de Programas
                </h1>
                <p className="text-sm text-blue-600">
                  Prefeitura Municipal de Presidente Getúlio
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur">
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
                  programs={programs}
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
                refreshPrograms={refreshPrograms} // NOVO!
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
