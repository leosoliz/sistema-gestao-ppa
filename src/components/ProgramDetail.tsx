import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const calculateTotal = (orcamento: string) => {
    if (!orcamento) return 0;
    // Remove formatação da moeda e converte para número
    const cleaned = orcamento.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = 25;

    // Função para adicionar texto com quebra de linha automática
    const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize: number = 10, align: 'left' | 'center' | 'right' = 'left') => {
      pdf.setFontSize(fontSize);
      if (maxWidth) {
        const lines = pdf.splitTextToSize(text, maxWidth);
        if (align === 'center') {
          lines.forEach((line: string, index: number) => {
            pdf.text(line, x + maxWidth / 2, y + (index * fontSize * 0.4), { align: 'center' });
          });
        } else {
          pdf.text(lines, x, y);
        }
        return y + (lines.length * (fontSize * 0.4));
      } else {
        pdf.text(text, x, y, { align });
        return y + (fontSize * 0.4);
      }
    };

    // Função para verificar se precisa de nova página
    const checkNewPage = (neededSpace: number = 25) => {
      if (yPosition + neededSpace > pageHeight - margin - 15) {
        pdf.addPage();
        yPosition = addHeader();
      }
    };

    // Função para adicionar cabeçalho oficial
    const addHeader = () => {
      // Fundo do cabeçalho
      pdf.setFillColor(0, 100, 0); // Verde escuro oficial
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      // Brasão da cidade (simulado com círculo e texto)
      pdf.setFillColor(255, 255, 255);
      pdf.circle(30, 25, 15, 'F');
      pdf.setFillColor(0, 100, 0);
      pdf.circle(30, 25, 12, 'F');
      
      // Estrela no brasão (simulada)
      pdf.setFillColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("★", 30, 27, { align: 'center' });
      
      // Texto do cabeçalho
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("PREFEITURA MUNICIPAL DE PRESIDENTE GETÚLIO", pageWidth / 2, 18, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Estado de Santa Catarina", pageWidth / 2, 28, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text("Plano Plurianual 2026-2029 | Sistema de Gestão de Programas", pageWidth / 2, 38, { align: 'center' });
      
      // Linha separadora
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 45, pageWidth - margin, 45);
      
      // Resetar cor do texto
      pdf.setTextColor(0, 0, 0);
      
      return 60;
    };

    // Adicionar cabeçalho na primeira página
    yPosition = addHeader();

    // Título da ficha em destaque
    pdf.setFillColor(240, 248, 255);
    pdf.rect(margin, yPosition - 5, contentWidth, 25, 'F');
    pdf.setDrawColor(70, 130, 180);
    pdf.setLineWidth(1);
    pdf.rect(margin, yPosition - 5, contentWidth, 25);
    
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(70, 130, 180);
    yPosition = addText("FICHA TÉCNICA DO PROGRAMA", margin + 5, yPosition + 8, contentWidth - 10, 16, 'center');
    yPosition += 15;

    // Caixa de informações básicas
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPosition, contentWidth, 40, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, yPosition, contentWidth, 40);
    
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    yPosition = addText(program.programa, margin + 5, yPosition + 10, contentWidth - 10, 14);
    yPosition += 5;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    yPosition = addText(`Secretaria: ${program.secretaria || "Não informado"}`, margin + 5, yPosition, contentWidth - 10, 10);
    yPosition = addText(`Departamento: ${program.departamento || "Não informado"}`, margin + 5, yPosition, contentWidth - 10, 10);
    yPosition = addText(`Eixo: ${program.eixo || "Não informado"}`, margin + 5, yPosition, contentWidth - 10, 10);
    
    const totalOrcamento = program.acoes.reduce((total, acao) => total + calculateTotal(acao.orcamento), 0);
    yPosition = addText(`Data de Criação: ${program.createdAt.toLocaleDateString('pt-BR')} | Orçamento Total: ${totalOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, margin + 5, yPosition, contentWidth - 10, 10);
    yPosition += 15;

    // Seções do programa com layout melhorado
    const sections = [
      { title: "DESCRIÇÃO DO PROGRAMA", content: program.descricao, color: [34, 139, 34] },
      { title: "JUSTIFICATIVA", content: program.justificativa, color: [255, 140, 0] },
      { title: "OBJETIVOS", content: program.objetivos, color: [70, 130, 180] },
      { title: "DIRETRIZES", content: program.diretrizes, color: [148, 0, 211] }
    ];

    sections.forEach(section => {
      if (section.content) {
        checkNewPage(35);
        
        // Cabeçalho da seção
        pdf.setFillColor(section.color[0], section.color[1], section.color[2]);
        pdf.rect(margin, yPosition, contentWidth, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(section.title, margin + 3, yPosition + 5.5);
        yPosition += 12;
        
        // Conteúdo da seção
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        yPosition = addText(section.content, margin + 3, yPosition, contentWidth - 6, 9);
        yPosition += 8;
      }
    });

    // Ações com layout tabular
    if (program.acoes.length > 0) {
      checkNewPage(50);
      
      // Cabeçalho das ações
      pdf.setFillColor(46, 125, 50);
      pdf.rect(margin, yPosition, contentWidth, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(`AÇÕES DO PROGRAMA (${program.acoes.length})`, margin + 3, yPosition + 6.5);
      yPosition += 15;

      program.acoes.forEach((acao, index) => {
        checkNewPage(45);

        // Caixa da ação
        pdf.setFillColor(index % 2 === 0 ? 250 : 245, 250, 250);
        pdf.rect(margin, yPosition, contentWidth, 35, 'F');
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(margin, yPosition, contentWidth, 35);

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        yPosition = addText(`${index + 1}. ${acao.nome}`, margin + 3, yPosition + 6, contentWidth - 6, 11);
        yPosition += 3;

        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        
        if (acao.produto) {
          yPosition = addText(`Produto: ${acao.produto}`, margin + 6, yPosition, contentWidth - 12, 9);
        }
        
        yPosition = addText(`Meta Física: ${acao.metaFisica} ${acao.unidadeMedida}`, margin + 6, yPosition, contentWidth - 12, 9);
        
        if (acao.orcamento) {
          yPosition = addText(`Orçamento: ${acao.orcamento}`, margin + 6, yPosition, contentWidth - 12, 9);
        }
        
        if (acao.fonte) {
          yPosition = addText(`Fonte: ${acao.fonte}`, margin + 6, yPosition, contentWidth - 12, 9);
        }
        
        yPosition += 15;
      });
    }

    // Rodapé em todas as páginas
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Linha separadora do rodapé
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineWidth(0.3);
      pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 8, { align: 'right' });
      pdf.text("Prefeitura Municipal de Presidente Getúlio - SC", margin, pageHeight - 8);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
    }

    // Salvar o PDF
    const fileName = `programa-${program.programa.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`;
    pdf.save(fileName);
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
    return total + calculateTotal(acao.orcamento);
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
                Orçamento Total: {totalOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                        <p className="text-gray-600 font-medium">
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
