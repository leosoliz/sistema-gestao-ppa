
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

    // Cores da paleta municipal (azul institucional e verde)
    const colors = {
      primary: [41, 98, 149],     // Azul institucional
      secondary: [34, 139, 34],   // Verde municipal
      accent: [70, 130, 180],     // Azul claro
      text: [51, 51, 51],         // Cinza escuro
      lightGray: [245, 245, 245], // Cinza claro para fundos
      darkBlue: [25, 70, 120]     // Azul escuro
    };

    // Função para adicionar texto com quebra de linha automática
    const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize: number = 10, align: 'left' | 'center' | 'right' = 'left') => {
      pdf.setFontSize(fontSize);
      if (maxWidth) {
        const lines = pdf.splitTextToSize(text, maxWidth);
        if (align === 'center') {
          lines.forEach((line: string, index: number) => {
            pdf.text(line, x + maxWidth / 2, y + (index * fontSize * 0.35), { align: 'center' });
          });
        } else {
          pdf.text(lines, x, y);
        }
        return y + (lines.length * (fontSize * 0.35));
      } else {
        pdf.text(text, x, y, { align });
        return y + (fontSize * 0.35);
      }
    };

    // Função para verificar se precisa de nova página
    const checkNewPage = (neededSpace: number = 30) => {
      if (yPosition + neededSpace > pageHeight - margin - 20) {
        pdf.addPage();
        yPosition = addHeader();
      }
    };

    // Função para adicionar cabeçalho clean e profissional
    const addHeader = () => {
      // Cabeçalho principal com gradiente azul
      pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Linha de destaque verde
      pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.rect(0, 35, pageWidth, 3, 'F');
      
      // Texto do cabeçalho
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("PREFEITURA MUNICIPAL DE PRESIDENTE GETÚLIO", pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Estado de Santa Catarina", pageWidth / 2, 24, { align: 'center' });
      
      pdf.setFontSize(9);
      pdf.text("Plano Plurianual 2026-2029", pageWidth / 2, 31, { align: 'center' });
      
      // Resetar cor do texto
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      
      return 50;
    };

    // Adicionar cabeçalho na primeira página
    yPosition = addHeader();

    // Título do documento
    pdf.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    pdf.rect(margin, yPosition, contentWidth, 20, 'F');
    pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition, contentWidth, 20);
    
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.darkBlue[0], colors.darkBlue[1], colors.darkBlue[2]);
    yPosition = addText("FICHA TÉCNICA DO PROGRAMA", margin, yPosition + 12, contentWidth, 16, 'center');
    yPosition += 15;

    // Dados gerais em layout clean
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    
    // Nome do programa em destaque
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, yPosition, contentWidth, 25, 'F');
    pdf.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.setLineWidth(1);
    pdf.rect(margin, yPosition, contentWidth, 25);
    
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    yPosition = addText(program.programa, margin + 5, yPosition + 8, contentWidth - 10, 14);
    yPosition += 20;
    
    // Informações organizacionais em grid
    const infoBoxHeight = 35;
    pdf.setFillColor(250, 252, 255);
    pdf.rect(margin, yPosition, contentWidth, infoBoxHeight, 'F');
    pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, yPosition, contentWidth, infoBoxHeight);
    
    // Grid de informações 2x2
    const halfWidth = contentWidth / 2;
    const quarterHeight = infoBoxHeight / 2;
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.darkBlue[0], colors.darkBlue[1], colors.darkBlue[2]);
    
    // Linha superior
    pdf.text("SECRETARIA:", margin + 5, yPosition + 8);
    pdf.text("DEPARTAMENTO:", margin + halfWidth + 5, yPosition + 8);
    
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.text(program.secretaria || "Não informado", margin + 5, yPosition + 14);
    pdf.text(program.departamento || "Não informado", margin + halfWidth + 5, yPosition + 14);
    
    // Linha inferior
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.darkBlue[0], colors.darkBlue[1], colors.darkBlue[2]);
    pdf.text("EIXO:", margin + 5, yPosition + 23);
    pdf.text("DATA DE CRIAÇÃO:", margin + halfWidth + 5, yPosition + 23);
    
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.text(program.eixo || "Não informado", margin + 5, yPosition + 29);
    pdf.text(program.createdAt.toLocaleDateString('pt-BR'), margin + halfWidth + 5, yPosition + 29);
    
    // Orçamento total em destaque
    const totalOrcamento = program.acoes.reduce((total, acao) => total + calculateTotal(acao.orcamento), 0);
    if (totalOrcamento > 0) {
      yPosition += infoBoxHeight + 5;
      pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.rect(margin, yPosition, contentWidth, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`ORÇAMENTO TOTAL: ${totalOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, pageWidth / 2, yPosition + 8, { align: 'center' });
      yPosition += 17;
    } else {
      yPosition += infoBoxHeight + 10;
    }

    // Seções do programa com layout profissional
    const sections = [
      { title: "DESCRIÇÃO", content: program.descricao, color: colors.primary },
      { title: "JUSTIFICATIVA", content: program.justificativa, color: colors.accent },
      { title: "OBJETIVOS", content: program.objetivos, color: colors.secondary },
      { title: "DIRETRIZES", content: program.diretrizes, color: colors.darkBlue }
    ];

    sections.forEach(section => {
      if (section.content) {
        checkNewPage(40);
        
        // Cabeçalho da seção com linha colorida
        pdf.setFillColor(section.color[0], section.color[1], section.color[2]);
        pdf.rect(margin, yPosition, 5, 8, 'F');
        
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin + 5, yPosition, contentWidth - 5, 8, 'F');
        
        pdf.setTextColor(section.color[0], section.color[1], section.color[2]);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(section.title, margin + 8, yPosition + 5.5);
        yPosition += 12;
        
        // Conteúdo da seção
        pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        yPosition = addText(section.content, margin + 3, yPosition, contentWidth - 6, 9);
        yPosition += 10;
      }
    });

    // Ações com layout tabular profissional
    if (program.acoes.length > 0) {
      checkNewPage(60);
      
      // Cabeçalho das ações
      pdf.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.rect(margin, yPosition, contentWidth, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(`AÇÕES DO PROGRAMA (${program.acoes.length})`, margin + 5, yPosition + 8);
      yPosition += 18;

      program.acoes.forEach((acao, index) => {
        checkNewPage(50);

        // Cartão da ação
        const cardHeight = 40;
        pdf.setFillColor(index % 2 === 0 ? 255 : 252, 254, 255);
        pdf.rect(margin, yPosition, contentWidth, cardHeight, 'F');
        pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, yPosition, contentWidth, cardHeight);

        // Linha colorida lateral
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.rect(margin, yPosition, 3, cardHeight, 'F');

        // Número da ação
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.circle(margin + 15, yPosition + 8, 6, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(String(index + 1), margin + 15, yPosition + 10, { align: 'center' });

        // Nome da ação
        pdf.setTextColor(colors.darkBlue[0], colors.darkBlue[1], colors.darkBlue[2]);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        yPosition = addText(acao.nome, margin + 25, yPosition + 10, contentWidth - 30, 11);
        
        // Detalhes em grid
        pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        
        let detailY = yPosition + 3;
        if (acao.produto) {
          pdf.setFont("helvetica", "bold");
          pdf.text("Produto:", margin + 25, detailY);
          pdf.setFont("helvetica", "normal");
          pdf.text(acao.produto, margin + 45, detailY);
          detailY += 6;
        }
        
        // Grid de informações
        const col1X = margin + 25;
        const col2X = margin + (contentWidth / 2) + 10;
        
        pdf.setFont("helvetica", "bold");
        pdf.text("Meta:", col1X, detailY);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${acao.metaFisica} ${acao.unidadeMedida}`, col1X + 20, detailY);
        
        if (acao.orcamento) {
          pdf.setFont("helvetica", "bold");
          pdf.text("Orçamento:", col2X, detailY);
          pdf.setFont("helvetica", "normal");
          pdf.text(acao.orcamento, col2X + 30, detailY);
        }
        
        detailY += 6;
        if (acao.fonte) {
          pdf.setFont("helvetica", "bold");
          pdf.text("Fonte:", col1X, detailY);
          pdf.setFont("helvetica", "normal");
          pdf.text(acao.fonte, col1X + 20, detailY);
        }
        
        yPosition += cardHeight + 5;
      });
    }

    // Rodapé profissional
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Linha separadora
      pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setLineWidth(0.3);
      pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      // Texto do rodapé
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 12, { align: 'right' });
      pdf.text("Prefeitura Municipal de Presidente Getúlio - SC", margin, pageHeight - 12);
      pdf.text(`Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    }

    // Salvar o PDF
    const fileName = `ficha-programa-${program.programa.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`;
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
