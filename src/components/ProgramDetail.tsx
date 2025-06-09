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

    // Cores baseadas no modelo oficial
    const colors = {
      primary: [51, 51, 51],        // Cinza escuro para texto principal
      secondary: [102, 102, 102],   // Cinza médio
      accent: [153, 153, 153],      // Cinza claro
      text: [51, 51, 51],          // Cinza escuro
      lightGray: [245, 245, 245],  // Cinza muito claro
      border: [204, 204, 204]      // Cinza para bordas
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
      if (yPosition + neededSpace > pageHeight - margin - 40) {
        pdf.addPage();
        yPosition = addHeader();
      }
    };

    // Função para adicionar cabeçalho baseado no modelo oficial
    const addHeader = () => {
      // Brasão (placeholder - posicionado onde seria o brasão no modelo)
      const brasaoSize = 25;
      pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, 15, brasaoSize, brasaoSize);
      
      // Placeholder para o brasão
      pdf.setFontSize(8);
      pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.text("BRASÃO", margin + brasaoSize/2, 27, { align: 'center' });
      
      // Cabeçalho principal do município
      const headerStartX = margin + brasaoSize + 10;
      const headerWidth = contentWidth - brasaoSize - 10;
      
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.setFont("helvetica", "bold");
      
      // MUNICÍPIO DE PRESIDENTE GETÚLIO
      pdf.setFontSize(14);
      let currentY = addText("MUNICÍPIO DE PRESIDENTE GETÚLIO", headerStartX, 22, headerWidth, 14, 'center');
      
      // ESTADO DE SANTA CATARINA
      pdf.setFontSize(11);
      currentY = addText("ESTADO DE SANTA CATARINA", headerStartX, currentY + 2, headerWidth, 11, 'center');
      
      // Poder Executivo Municipal
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      currentY = addText("Poder Executivo Municipal", headerStartX, currentY + 2, headerWidth, 10, 'center');
      
      // Linha separadora
      pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 50, pageWidth - margin, 50);
      
      // Resetar cor do texto para o corpo
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      
      return 65; // Retorna a posição Y após o cabeçalho
    };

    // Adicionar cabeçalho na primeira página
    yPosition = addHeader();

    // Título do documento
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    yPosition = addText("FICHA TÉCNICA DO PROGRAMA", margin, yPosition + 10, contentWidth, 16, 'center');
    yPosition += 20;

    // Nome do programa em destaque
    pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition, contentWidth, 20);
    
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    yPosition = addText(program.programa, margin + 5, yPosition + 12, contentWidth - 10, 14, 'center');
    yPosition += 15;
    
    // Informações organizacionais em grid
    const infoBoxHeight = 35;
    pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, yPosition, contentWidth, infoBoxHeight);
    
    // Grid de informações 2x2
    const halfWidth = contentWidth / 2;
    
    // Linha vertical divisória
    pdf.line(margin + halfWidth, yPosition, margin + halfWidth, yPosition + infoBoxHeight);
    // Linha horizontal divisória
    pdf.line(margin, yPosition + infoBoxHeight/2, margin + contentWidth, yPosition + infoBoxHeight/2);
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    
    // Linha superior
    pdf.text("SECRETARIA:", margin + 3, yPosition + 8);
    pdf.text("DEPARTAMENTO:", margin + halfWidth + 3, yPosition + 8);
    
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.text(program.secretaria || "Não informado", margin + 3, yPosition + 14);
    pdf.text(program.departamento || "Não informado", margin + halfWidth + 3, yPosition + 14);
    
    // Linha inferior
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    pdf.text("EIXO TEMÁTICO:", margin + 3, yPosition + 23);
    pdf.text("DATA DE CRIAÇÃO:", margin + halfWidth + 3, yPosition + 23);
    
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.text(program.eixo || "Não informado", margin + 3, yPosition + 29);
    pdf.text(program.createdAt.toLocaleDateString('pt-BR'), margin + halfWidth + 3, yPosition + 29);
    
    yPosition += infoBoxHeight + 15;

    // Orçamento total em destaque (se houver)
    const totalOrcamento = program.acoes.reduce((total, acao) => total + calculateTotal(acao.orcamento), 0);
    if (totalOrcamento > 0) {
      pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, yPosition, contentWidth, 12);
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`ORÇAMENTO TOTAL: ${totalOrcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, pageWidth / 2, yPosition + 8, { align: 'center' });
      yPosition += 20;
    }

    // Seções do programa
    const sections = [
      { title: "DESCRIÇÃO", content: program.descricao },
      { title: "JUSTIFICATIVA", content: program.justificativa },
      { title: "OBJETIVOS", content: program.objetivos },
      { title: "DIRETRIZES", content: program.diretrizes }
    ];

    sections.forEach(section => {
      if (section.content) {
        checkNewPage(40);
        
        // Cabeçalho da seção
        pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, yPosition, contentWidth, 8);
        
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(section.title, margin + 3, yPosition + 5.5);
        yPosition += 12;
        
        // Conteúdo da seção
        pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        yPosition = addText(section.content, margin + 3, yPosition, contentWidth - 6, 9);
        yPosition += 15;
      }
    });

    // Ações do programa
    if (program.acoes.length > 0) {
      checkNewPage(60);
      
      // Cabeçalho das ações
      pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      pdf.setLineWidth(0.3);
      pdf.rect(margin, yPosition, contentWidth, 12);
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(`AÇÕES DO PROGRAMA (${program.acoes.length})`, margin + 5, yPosition + 8);
      yPosition += 20;

      program.acoes.forEach((acao, index) => {
        checkNewPage(45);

        // Cartão da ação
        const cardHeight = 35;
        pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, yPosition, contentWidth, cardHeight);

        // Número da ação
        pdf.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.setLineWidth(1);
        pdf.circle(margin + 12, yPosition + 8, 5);
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(String(index + 1), margin + 12, yPosition + 10, { align: 'center' });

        // Nome da ação
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        yPosition = addText(acao.nome, margin + 22, yPosition + 10, contentWidth - 25, 11);
        
        // Detalhes da ação
        pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        
        let detailY = yPosition + 3;
        if (acao.produto) {
          pdf.setFont("helvetica", "bold");
          pdf.text("Produto:", margin + 22, detailY);
          pdf.setFont("helvetica", "normal");
          pdf.text(acao.produto, margin + 38, detailY);
          detailY += 5;
        }
        
        // Informações em duas colunas
        const col1X = margin + 22;
        const col2X = margin + (contentWidth / 2) + 10;
        
        pdf.setFont("helvetica", "bold");
        pdf.text("Meta:", col1X, detailY);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${acao.metaFisica} ${acao.unidadeMedida}`, col1X + 16, detailY);
        
        if (acao.orcamento) {
          pdf.setFont("helvetica", "bold");
          pdf.text("Orçamento:", col2X, detailY);
          pdf.setFont("helvetica", "normal");
          pdf.text(acao.orcamento, col2X + 26, detailY);
        }
        
        detailY += 5;
        if (acao.fonte) {
          pdf.setFont("helvetica", "bold");
          pdf.text("Fonte:", col1X, detailY);
          pdf.setFont("helvetica", "normal");
          pdf.text(acao.fonte, col1X + 16, detailY);
        }
        
        yPosition += cardHeight + 5;
      });
    }

    // Rodapé baseado no modelo oficial
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Linha separadora do rodapé
      pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      pdf.setLineWidth(0.3);
      pdf.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
      
      // Endereço e informações de contato (baseado no modelo)
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      
      // Endereço
      pdf.text("Praça Otto Müller, 3º - 10, Centro - Presidente Getúlio - SC", pageWidth / 2, pageHeight - 18, { align: 'center' });
      pdf.text("Fone: (47) 3353-5500", pageWidth / 2, pageHeight - 14, { align: 'center' });
      pdf.text("E-mail: administracao@presidentegetulio.sc.gov.br", pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Número da página
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 6, { align: 'right' });
      pdf.text(`Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`, margin, pageHeight - 6);
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
