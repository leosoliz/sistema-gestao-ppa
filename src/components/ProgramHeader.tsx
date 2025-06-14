
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Calendar, Printer, Sheet } from "lucide-react";
import { Program } from "@/pages/Index";

interface ProgramHeaderProps {
  program: Program;
  totalOrcamento: number;
  onEdit: () => void;
  onGeneratePDF: () => void;
  onGenerateExcel: () => void;
}

export const ProgramHeader = ({ program, totalOrcamento, onEdit, onGeneratePDF, onGenerateExcel }: ProgramHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <CardTitle className="text-2xl text-blue-900 mb-2">
            {program.programa}
          </CardTitle>
          <CardDescription className="text-lg">
            {program.secretaria} - {program.departamento}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={onGenerateExcel} 
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Sheet className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button 
            onClick={onGeneratePDF} 
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir PDF
          </Button>
          <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="h-4 w-4 mr-2" />
            Editar Programa
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Criado em {program.createdAt.toLocaleDateString('pt-BR')}
          </span>
        </div>
        
        <Badge variant="secondary" className="text-sm">
          {program.acoes.length} ações
        </Badge>
        
        {totalOrcamento > 0 && (
          <Badge variant="outline" className="text-sm">
            Orçamento Total: {totalOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Badge>
        )}
      </div>
    </CardHeader>
  );
};
