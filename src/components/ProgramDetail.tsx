
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Calendar, FileText, Target, Lightbulb, Printer } from "lucide-react";
import { Program, Idea } from "@/pages/Index";
import { ProgramEditForm } from "./ProgramEditForm";
import jsPDF from 'jspdf';

interface ProgramDetailProps {
  program: Program;
  ideas: Idea[];
  onUpdate: (program: Program) => void;
  onAddToIdeasBank: (idea: Omit<Idea, "id" | "createdAt">) => void;
}

export const ProgramDetail = ({ program, ideas, onUpdate, onAddToIdeasBank }: ProgramDetailProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Função para adicionar texto com quebra de linha
    const addText = (text: string, x: number, y: number, maxWidth?: number) => {
      if (maxWidth) {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * 6);
      } else {
        pdf.text(text, x, y);
        return y + 6;
      }
    };

    // Função para adicionar cabeçalho com logotipo
    const addHeader = () => {
      // Adicionar retângulo de fundo verde
      pdf.setFillColor(34, 197, 94); // green-500
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Adicionar texto do cabeçalho em branco
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("PREFEITURA MUNICIPAL", pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text("DE PRESIDENTE GETÚLIO", pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Sistema de Gestão de Programas", pageWidth / 2, 35, { align: 'center' });
      
      // Resetar cor do texto para preto
      pdf.setTextColor(0, 0, 0);
      
      return 50; // Retorna a próxima posição Y após o cabeçalho
    };

    // Adicionar cabeçalho na primeira página
    yPosition = addHeader();

    // Título da ficha
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    yPosition = addText("FICHA DO PROGRAMA", margin, yPosition);
    yPosition += 10;

    // Informações básicas do programa
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    yPosition = addText(`Programa: ${program.programa}`, margin, yPosition);
    yPosition += 5;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    yPosition = addText(`Secretaria: ${program.secretaria || "Não informado"}`, margin, yPosition);
    yPosition = addText(`Departamento: ${program.departamento || "Não informado"}`, margin, yPosition);
    yPosition = addText(`Eixo: ${program.eixo || "Não informado"}`, margin, yPosition);
    yPosition = addText(`Data de Criação: ${program.createdAt.toLocaleDateString('pt-BR')}`, margin, yPosition);
    yPosition += 10;

    // Descrição
    if (program.descricao) {
      pdf.setFont("helvetica", "bold");
      yPosition = addText("DESCRIÇÃO:", margin, yPosition);
      pdf.setFont("helvetica", "normal");
      yPosition = addText(program.descricao, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 5;
    }

    // Justificativa
    if (program.justificativa) {
      pdf.setFont("helvetica", "bold");
      yPosition = addText("JUSTIFICATIVA:", margin, yPosition);
      pdf.setFont("helvetica", "normal");
      yPosition = addText(program.justificativa, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 5;
    }

    // Objetivos
    if (program.objetivos) {
      pdf.setFont("helvetica", "bold");
      yPosition = addText("OBJETIVOS:", margin, yPosition);
      pdf.setFont("helvetica", "normal");
      yPosition = addText(program.objetivos, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 5;
    }

    // Diretrizes
    if (program.diretrizes) {
      pdf.setFont("helvetica", "bold");
      yPosition = addText("DIRETRIZES:", margin, yPosition);
      pdf.setFont("helvetica", "normal");
      yPosition = addText(program.diretrizes, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 10;
    }

    // Ações
    if (program.acoes.length > 0) {
      // Verificar se precisa de nova página
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = addHeader(); // Adicionar cabeçalho na nova página
      }

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      yPosition = addText(`AÇÕES CADASTRADAS (${program.acoes.length})`, margin, yPosition);
      yPosition += 10;

      program.acoes.forEach((acao, index) => {
        // Verificar se precisa de nova página para a ação
        if (yPosition > 220) {
          pdf.addPage();
          yPosition = addHeader(); // Adicionar cabeçalho na nova página
        }

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        yPosition = addText(`${index + 1}. ${acao.nome}`, margin, yPosition);
        yPosition += 5;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        
        if (acao.produto) {
          yPosition = addText(`Produto: ${acao.produto}`, margin + 5, yPosition);
        }
        
        yPosition = addText(`Meta Física: ${acao.metaFisica} ${acao.unidadeMedida}`, margin + 5, yPosition);
        
        if (acao.orcamento) {
          yPosition = addText(`Orçamento: ${acao.orcamento}`, margin + 5, yPosition);
        }
        
        if (acao.fonte) {
          yPosition = addText(`Fonte: ${acao.fonte}`, margin + 5, yPosition);
        }
        
        yPosition += 8;
      });
    }

    // Rodapé
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pdf.internal.pageSize.getHeight() - 10);
      pdf.text("Prefeitura Municipal de Presidente Getúlio", margin, pdf.internal.pageSize.getHeight() - 10);
    }

    // Salvar o PDF
    pdf.save(`programa-${program.programa.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`);
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
    const valor = parseFloat(acao.orcamento.replace(/[^\d,]/g, '').replace(',', '.'));
    return total + (isNaN(valor) ? 0 : valor);
  }, 0);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
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
            <div className="flex gap-2">
              <Button 
                onClick={generatePDF} 
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir PDF
              </Button>
              <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
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
                Orçamento Total: R$ {totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Badge>
            )}
          </div>
        </CardHeader>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Dados Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Secretaria</h4>
                  <p className="text-gray-600">{program.secretaria || "Não informado"}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Departamento</h4>
                  <p className="text-gray-600">{program.departamento || "Não informado"}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Eixo</h4>
                  <p className="text-gray-600">{program.eixo || "Não informado"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-900">Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {program.descricao || "Nenhuma descrição fornecida."}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-orange-900">Justificativa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {program.justificativa || "Nenhuma justificativa fornecida."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-purple-900">Objetivos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {program.objetivos || "Nenhum objetivo definido."}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-indigo-900">Diretrizes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {program.diretrizes || "Nenhuma diretriz definida."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acoes" className="space-y-6">
          {program.acoes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhuma ação cadastrada ainda.</p>
                <p className="text-gray-400">Edite o programa para adicionar ações.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {program.acoes.map((acao, index) => (
                <Card key={acao.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-green-900">
                          {acao.nome}
                        </CardTitle>
                        {acao.produto && (
                          <CardDescription className="mt-1">
                            Produto: {acao.produto}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="outline">
                        Ação #{index + 1}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Meta Física</h4>
                        <p className="text-gray-600">
                          {acao.metaFisica} {acao.unidadeMedida}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Orçamento</h4>
                        <p className="text-gray-600">
                          {acao.orcamento || "Não informado"}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Fonte</h4>
                        <p className="text-gray-600">
                          {acao.fonte || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
