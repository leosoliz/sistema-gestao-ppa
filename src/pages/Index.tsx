
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Lightbulb, Eye } from "lucide-react";
import { ProgramForm } from "@/components/ProgramForm";
import { ProgramList } from "@/components/ProgramList";
import { IdeasBank } from "@/components/IdeasBank";
import { ProgramDetail } from "@/components/ProgramDetail";
import { useToast } from "@/hooks/use-toast";

export interface Action {
  id: string;
  nome: string;
  produto: string;
  unidadeMedida: string;
  metaFisica: string;
  orcamento: string;
  fonte: string;
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
}

const Index = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  const addProgram = (program: Omit<Program, "id" | "createdAt">) => {
    const newProgram: Program = {
      ...program,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setPrograms([...programs, newProgram]);
    toast({
      title: "Programa cadastrado",
      description: "O programa foi cadastrado com sucesso!",
    });
  };

  const updateProgram = (updatedProgram: Program) => {
    setPrograms(programs.map(p => p.id === updatedProgram.id ? updatedProgram : p));
    setSelectedProgram(updatedProgram);
    toast({
      title: "Programa atualizado",
      description: "As alterações foram salvas com sucesso!",
    });
  };

  const deleteProgram = (programId: string) => {
    setPrograms(programs.filter(p => p.id !== programId));
    if (selectedProgram?.id === programId) {
      setSelectedProgram(null);
      setActiveTab("dashboard");
    }
    toast({
      title: "Programa excluído",
      description: "O programa foi removido com sucesso!",
    });
  };

  const addIdea = (idea: Omit<Idea, "id" | "createdAt">) => {
    const newIdea: Idea = {
      ...idea,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setIdeas([...ideas, newIdea]);
    toast({
      title: "Ideia cadastrada",
      description: "A ideia foi adicionada ao banco de ideias!",
    });
  };

  const deleteIdea = (ideaId: string) => {
    setIdeas(ideas.filter(i => i.id !== ideaId));
    toast({
      title: "Ideia removida",
      description: "A ideia foi removida do banco de ideias!",
    });
  };

  const viewProgram = (program: Program) => {
    setSelectedProgram(program);
    setActiveTab("view");
  };

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
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur">
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
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  onAdd={addIdea}
                  onDelete={deleteIdea}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view">
            {selectedProgram && (
              <ProgramDetail 
                program={selectedProgram}
                ideas={ideas}
                onUpdate={updateProgram}
                onAddToIdeasBank={addIdea}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
