
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Calendar, Printer, Sheet } from "lucide-react";
import { Program } from "@/pages/Index";

// Define a interface para as propriedades que o componente ProgramHeader espera receber.
interface ProgramHeaderProps {
  /** O objeto completo do programa a ser exibido. */
  program: Program;
  /** O valor total do orçamento do programa, já calculado. */
  totalOrcamento: number;
  /** Função de callback para ser chamada quando o botão "Editar" for clicado. */
  onEdit: () => void;
  /** Função de callback para gerar o PDF. */
  onGeneratePDF: () => void;
  /** Função de callback para gerar o Excel. */
  onGenerateExcel: () => void;
}

/**
 * Componente responsável por renderizar o cabeçalho da página de detalhes de um programa.
 * Exibe o título, informações resumidas (secretaria, departamento) e botões de ação.
 */
export const ProgramHeader = ({ program, totalOrcamento, onEdit, onGeneratePDF, onGenerateExcel }: ProgramHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        {/* Seção do Título e Descrição */}
        <div className="flex-1">
          <CardTitle className="text-2xl text-blue-900 mb-2">
            {program.programa}
          </CardTitle>
          <CardDescription className="text-lg">
            {program.secretaria} - {program.departamento}
          </CardDescription>
        </div>
        {/* Seção de Botões de Ação */}
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
      
      {/* Seção de Metadados com Badges */}
      <div className="flex flex-wrap gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Criado em {program.createdAt.toLocaleDateString('pt-BR')}
          </span>
        </div>
        
        <Badge variant="secondary" className="text-sm">
          {program.acoes.length} {program.acoes.length === 1 ? 'ação' : 'ações'}
        </Badge>
        
        {/* O badge de orçamento só é exibido se o valor for maior que zero. */}
        {totalOrcamento > 0 && (
          <Badge variant="outline" className="text-sm">
            Orçamento Total: {totalOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Badge>
        )}
      </div>
    </CardHeader>
  );
};
