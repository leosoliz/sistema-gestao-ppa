
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, List, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { EixoForm } from "./EixoForm";
import { EixosList } from "./EixosList";
import { useEixos } from "@/hooks/useEixos";

export const EixosManager = () => {
  const [activeTab, setActiveTab] = useState("list");
  const { eixos, loading, addEixo, updateEixo, deleteEixo, syncEixosUsageStatus } = useEixos();

  const handleAddEixo = async (eixoData: any) => {
    await addEixo(eixoData);
    setActiveTab("list");
  };

  const handleSyncUsage = async () => {
    await syncEixosUsageStatus();
  };

  const eixosEmUso = eixos.filter(e => e.isUsed).length;
  const eixosDisponiveis = eixos.filter(e => !e.isUsed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Eixos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{eixos.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Em Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{eixosEmUso}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{eixosDisponiveis}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sincronização</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              onClick={handleSyncUsage}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista de Eixos
          </TabsTrigger>
          <TabsTrigger value="novo" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Eixo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eixos Cadastrados</CardTitle>
              <CardDescription>
                Gerencie todos os eixos que podem ser utilizados nos programas. 
                Eixos em uso não podem ser excluídos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EixosList 
                eixos={eixos}
                onUpdate={updateEixo}
                onDelete={deleteEixo}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="novo">
          <EixoForm onSubmit={handleAddEixo} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
