import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Target } from "lucide-react";
import { Program, Idea } from "@/pages/Index";
import { ProgramEditForm } from "./ProgramEditForm";
import { ProgramHeader } from "./ProgramHeader";
import { ProgramInfoTab } from "./ProgramInfoTab";
import { ProgramActionsTab } from "./ProgramActionsTab";
import { generateProgramPDF } from "@/utils/pdfGenerator";

interface ProgramDetailProps {
  program: Program;
  ideas: Idea[];
  onUpdate: (program: Program) => void;
  onAddToIdeasBank: (idea: Omit<Idea, "id" | "createdAt">) => void;
  refreshPrograms: () => void;
  refreshIdeas: () => void;
}

export const ProgramDetail = ({ program, ideas, onUpdate, onAddToIdeasBank, refreshPrograms, refreshIdeas }: ProgramDetailProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const calculateTotal = (acao) => {
    // Soma os 4 anos de orçamento da action:
    const vals = [acao.orcamento2026, acao.orcamento2027, acao.orcamento2028, acao.orcamento2029].map(
      v => parseFloat((v || "0").replace(/[^\d,]/g, '').replace(',', '.') || "0")
    );
    return vals.reduce((s, v) => s + v, 0);
  };

  const handleGeneratePDF = () => {
    generateProgramPDF(program);
  };

  if (isEditing) {
    return (
      <ProgramEditForm
        program={program}
        ideas={ideas}
        onUpdate={onUpdate}
        onAddToIdeasBank={onAddToIdeasBank}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const totalOrcamento = program.acoes.reduce((total, acao) => {
    return total + calculateTotal(acao);
  }, 0);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <ProgramHeader
          program={program}
          totalOrcamento={totalOrcamento}
          onEdit={() => setIsEditing(true)}
          onGeneratePDF={handleGeneratePDF}
        />
      </Card>

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

        <TabsContent value="info" className="space-y-6">
          <ProgramInfoTab program={program} />
        </TabsContent>

        <TabsContent value="acoes" className="space-y-6">
          <ActionsManager
            actions={program.acoes}
            onActionsChange={() => refreshPrograms()} // Quando houver mudanças, recarregue os programas do backend!
            ideas={ideas}
            onAddToIdeasBank={onAddToIdeasBank}
            programId={program.id}
            refreshIdeas={refreshIdeas}
            refreshPrograms={refreshPrograms} // Prop novo!
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
