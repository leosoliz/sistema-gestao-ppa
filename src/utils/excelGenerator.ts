
import * as XLSX from 'xlsx';
import { Program } from '@/pages/Index';

/**
 * Converte uma string de moeda no formato brasileiro (ex: "R$ 1.234,56") para um número.
 * Remove todos os caracteres não numéricos, exceto a vírgula, que é substituída por um ponto.
 * @param value A string de moeda a ser convertida.
 * @returns O valor numérico correspondente.
 */
const parseCurrency = (value: string | undefined | null): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.') || '0');
};

/**
 * Gera um arquivo Excel (.xlsx) a partir dos dados de um programa.
 * O arquivo contém duas planilhas: uma com informações gerais e outra com as ações detalhadas.
 * @param program O objeto do programa contendo todos os dados.
 */
export const generateProgramExcel = (program: Program) => {
    // --- 1. Criação do Workbook ---
    // O workbook é o contêiner principal do arquivo Excel, que abrigará as planilhas.
    const wb = XLSX.utils.book_new();

    // --- 2. Planilha 1: Informações Gerais do Programa ---
    // Estrutura dos dados da primeira planilha. Cada array interno representa uma linha.
    // O formato {v: 'valor', s: { ... }} permite aplicar estilos (style) diretamente na célula.
    const programInfoData = [
        [{v: 'INFORMAÇÕES GERAIS DO PROGRAMA', s: { font: { bold: true, sz: 14 }, alignment: { vertical: 'center' } }}],
        [],
        [{v: 'SECRETARIA', s: { font: { bold: true } }}, program.secretaria],
        [{v: 'DEPARTAMENTO', s: { font: { bold: true } }}, program.departamento],
        [{v: 'EIXO TEMÁTICO', s: { font: { bold: true } }}, program.eixo],
        [{v: 'PROGRAMA', s: { font: { bold: true } }}, program.programa],
        [{v: 'DATA CRIAÇÃO', s: { font: { bold: true } }}, program.createdAt.toLocaleDateString('pt-BR')],
        [],
        [{v: 'DESCRIÇÃO', s: { font: { bold: true } }}, program.descricao],
        [],
        [{v: 'JUSTIFICATIVA', s: { font: { bold: true } }}, program.justificativa],
        [],
        [{v: 'OBJETIVOS', s: { font: { bold: true } }}, program.objetivos],
        [],
        [{v: 'DIRETRIZES', s: { font: { bold: true } }}, program.diretrizes],
    ];
    // Converte a estrutura de array de arrays (AOA) para um objeto de planilha (worksheet).
    const wsInfo = XLSX.utils.aoa_to_sheet(programInfoData);
    
    // --- 3. Estilização da Planilha 1 ---
    // Define a largura das colunas A e B. 'wch' significa "width in characters".
    wsInfo['!cols'] = [{ wch: 20 }, { wch: 120 }];
    // Define a altura das linhas dinamicamente, para que textos longos não sejam cortados.
    wsInfo['!rows'] = programInfoData.map(row => (row[0] && typeof row[0] === 'object' && row[1]) ? { hpt: Math.ceil(String(row[1] || '').length / 120) * 15 } : { hpt: 15 } );
    
    // Habilita a quebra de linha automática (wrap text) para células com conteúdo longo.
    const cellsToWrap = ["A9", "B9", "A11", "B11", "A13", "B13", "A15", "B15"];
    cellsToWrap.forEach(cellRef => {
        const cell = wsInfo[cellRef];
        if (cell) { // Garante que a célula exista antes de tentar aplicar estilo.
            if (!cell.s) cell.s = {}; // Cria o objeto de estilo se ele não existir.
            cell.s.alignment = { ...cell.s.alignment, wrapText: true, vertical: 'top' };
        }
    });
    
    // Mescla as células A1 e B1 para criar um título que abrange duas colunas.
    wsInfo['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];


    // Adiciona a planilha 'wsInfo' ao workbook, nomeando-a como 'Informações do Programa'.
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Informações do Programa');

    // --- 4. Planilha 2: Ações do Programa ---
    // Esta planilha só é criada se o programa tiver pelo menos uma ação.
    if (program.acoes.length > 0) {
        const header = [
            'Ação', 'Produto/Serviço', 'Unidade de Medida', 'Fonte',
            'Meta 2026', 'Orçamento 2026',
            'Meta 2027', 'Orçamento 2027',
            'Meta 2028', 'Orçamento 2028',
            'Meta 2029', 'Orçamento 2029',
            'Total Orçamento Ação'
        ];
        
        // Mapeia os dados de cada ação para o formato de linha da planilha.
        const actionsData = program.acoes.map(acao => {
            // Converte os orçamentos de string para número para permitir cálculos.
            const orcamento2026 = parseCurrency(acao.orcamento2026);
            const orcamento2027 = parseCurrency(acao.orcamento2027);
            const orcamento2028 = parseCurrency(acao.orcamento2028);
            const orcamento2029 = parseCurrency(acao.orcamento2029);
            // Calcula o total orçamentário para esta ação específica.
            const totalAcao = orcamento2026 + orcamento2027 + orcamento2028 + orcamento2029;

            // Retorna um array que representa a linha da ação.
            return [
                acao.nome,
                acao.produto,
                acao.unidadeMedida,
                acao.fonte,
                acao.metaFisica2026,
                // Formata os valores de orçamento como número com o formato de moeda do Excel.
                // t:'n' (type: number), v:'value', z:'number format'
                { t: 'n', v: orcamento2026, z: 'R$ #,##0.00' },
                acao.metaFisica2027,
                { t: 'n', v: orcamento2027, z: 'R$ #,##0.00' },
                acao.metaFisica2028,
                { t: 'n', v: orcamento2028, z: 'R$ #,##0.00' },
                acao.metaFisica2029,
                { t: 'n', v: orcamento2029, z: 'R$ #,##0.00' },
                { t: 'n', v: totalAcao, z: 'R$ #,##0.00' },
            ];
        });

        // Calcula o orçamento total do programa somando os totais de todas as ações.
        const totalOrcamentoPrograma = program.acoes.reduce((total, acao) => {
            const totalAcao = parseCurrency(acao.orcamento2026) + parseCurrency(acao.orcamento2027) + parseCurrency(acao.orcamento2028) + parseCurrency(acao.orcamento2029);
            return total + totalAcao;
        }, 0);

        // Cria a linha de rodapé com o valor total do programa.
        const footer = [
            '', '', '', '', '', '', '', '', '', '', '', 'TOTAL PROGRAMA', { t: 'n', v: totalOrcamentoPrograma, z: 'R$ #,##0.00' }
        ];

        // Cria a planilha de ações, juntando cabeçalho, dados e rodapé.
        const wsActions = XLSX.utils.aoa_to_sheet([header, ...actionsData, [], footer]);
        
        // --- 5. Estilização da Planilha 2 ---
        wsActions['!cols'] = [
            { wch: 40 }, { wch: 30 }, { wch: 20 }, { wch: 20 },
            { wch: 15 }, { wch: 18 },
            { wch: 15 }, { wch: 18 },
            { wch: 15 }, { wch: 18 },
            { wch: 15 }, { wch: 18 },
            { wch: 20 }
        ];
        
        // Aplica o estilo de negrito a todas as células do cabeçalho.
        const headerStyle = { font: { bold: true } };
        header.forEach((_, colIndex) => {
            const cellRef = XLSX.utils.encode_cell({c: colIndex, r: 0});
            if (wsActions[cellRef]) wsActions[cellRef].s = headerStyle;
        });

        // Aplica o estilo de negrito à linha de total no rodapé.
        const footerRowIndex = actionsData.length + 2; // +1 for header, +1 for the empty row
        const totalLabelCell = XLSX.utils.encode_cell({c: 11, r: footerRowIndex});
        const totalValueCell = XLSX.utils.encode_cell({c: 12, r: footerRowIndex});
        if (wsActions[totalLabelCell]) wsActions[totalLabelCell].s = { font: { bold: true } };
        if (wsActions[totalValueCell]) wsActions[totalValueCell].s = { font: { bold: true } };

        // Adiciona a planilha de ações ao workbook.
        XLSX.utils.book_append_sheet(wb, wsActions, 'Ações do Programa');
    }

    // --- 6. Geração e Download do Arquivo ---
    // Define um nome de arquivo amigável, removendo caracteres especiais e convertendo para minúsculas.
    const fileName = `programa-${program.programa.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.xlsx`;
    // Escreve o conteúdo do workbook em um arquivo .xlsx e dispara o download no navegador.
    XLSX.writeFile(wb, fileName);
};
