
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Target } from "lucide-react";
import { Program, Idea } from "@/pages/Index";
import { ProgramEditForm } from "./ProgramEditForm";
import { ProgramHeader } from "./ProgramHeader";
import { ProgramInfoTab } from "./ProgramInfoTab";
import { generateProgramPDF } from "@/utils/pdfGenerator";
import { ActionsManager } from "./ActionsManager";
import { generateProgramExcel } from "@/utils/excelGenerator";

interface ProgramDetailProps {
  program: Program;
  ideas: Idea[];
  onUpdate: (program: Program) => void;
  onAddToIdeasBank: (idea: Omit<Idea, "id" | "createdAt">) => void;
  refreshPrograms: () => void;
  refreshIdeas: () => void;
}

/**
 * Componente principal para exibir os detalhes de um programa.
 * Orquestra a exibição de informações, ações e o modo de edição.
 */
export const ProgramDetail = ({ program, ideas, onUpdate, onAddToIdeasBank, refreshPrograms, refreshIdeas }: ProgramDetailProps) => {
  // Estado para controlar se o formulário de edição do programa está visível.
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Calcula o orçamento total de uma única ação, somando os valores dos 4 anos.
   * Converte as strings de moeda para números antes de somar.
   * @param acao A ação para a qual o total será calculado.
   * @returns O valor total do orçamento da ação.
   */
  const calculateTotal = (acao) => {
    const vals = [acao.orcamento2026, acao.orcamento2027, acao.orcamento2028, acao.orcamento2029].map(
      v => parseFloat((v || "0").replace(/[^\d,]/g, '').replace(',', '.') || "0")
    );
    return vals.reduce((s, v) => s + v, 0);
  };

  // Handler para o botão de gerar PDF. Chama a função utilitária correspondente.
  const handleGeneratePDF = () => {
    generateProgramPDF(program);
  };
  
  // Handler para o botão de gerar Excel. Chama a função utilitária correspondente.
  const handleGenerateExcel = () => {
    generateProgramExcel(program);
  };

  // Se o modo de edição estiver ativo, renderiza o formulário de edição em vez dos detalhes.
  if (isEditing) {
    return (
      <ProgramEditForm
        program={program}
        ideas={ideas}
        onUpdate={onUpdate}
        onAddToIdeasBank={onAddToIdeasBank}
        // Passa uma função para desativar o modo de edição ao clicar em "Cancelar".
        onCancel={() => setIsEditing(false)}
        refreshPrograms={refreshPrograms}
        refreshIdeas={refreshIdeas}
      />
    );
  }

  // Calcula o orçamento total do programa somando os totais de todas as suas ações.
  const totalOrcamento = program.acoes.reduce((total, acao) => {
    return total + calculateTotal(acao);
  }, 0);

  // Renderização principal do componente de detalhe do programa.
  return (
    <div className="space-y-6">
      {/* Cabeçalho com o título, botões de ação (Editar, PDF, Excel) e informações resumidas. */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <ProgramHeader
          program={program}
          totalOrcamento={totalOrcamento}
          onEdit={() => setIsEditing(true)} // Ativa o modo de edição ao clicar.
          onGeneratePDF={handleGeneratePDF}
          onGenerateExcel={handleGenerateExcel}
        />
      </Card>

      {/* Sistema de abas para separar "Informações do Programa" e "Ações". */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Informações do Programa
          </TabsTrigger>
          <TabsTrigger value="acoes" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Ações ({program.acoes.length})
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo da aba de Informações */}
        <TabsContent value="info" className="space-y-6">
          <ProgramInfoTab program={program} />
        </TabsContent>

        {/* Conteúdo da aba de Ações */}
        <TabsContent value="acoes" className="space-y-6">
          {/* O componente ActionsManager cuida de toda a lógica de CRUD para as ações. */}
          <ActionsManager
            actions={program.acoes}
            onActionsChange={() => refreshPrograms()} // Recarrega os programas para refletir mudanças.
            ideas={ideas}
            onAddToIdeasBank={onAddToIdeasBank}
            programId={program.id}
            refreshIdeas={refreshIdeas}
            refreshPrograms={refreshPrograms}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
