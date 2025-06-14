
import * as XLSX from 'xlsx';
import { Program } from '@/pages/Index';

// Helper to parse currency string to number
const parseCurrency = (value: string | undefined | null): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.') || '0');
};

export const generateProgramExcel = (program: Program) => {
    // --- Create Workbook and Sheets ---
    const wb = XLSX.utils.book_new();

    // --- Sheet 1: Program Information ---
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
    const wsInfo = XLSX.utils.aoa_to_sheet(programInfoData);
    
    wsInfo['!cols'] = [{ wch: 20 }, { wch: 120 }];
    wsInfo['!rows'] = programInfoData.map(row => (row[0] && typeof row[0] === 'object' && row[1]) ? { hpt: Math.ceil(String(row[1]).length / 120) * 15 } : { hpt: 15 } );
    wsInfo["A9"].s.alignment = { wrapText: true };
    wsInfo["A11"].s.alignment = { wrapText: true };
    wsInfo["A13"].s.alignment = { wrapText: true };
    wsInfo["A15"].s.alignment = { wrapText: true };
    wsInfo["B9"].s.alignment = { wrapText: true };
    wsInfo["B11"].s.alignment = { wrapText: true };
    wsInfo["B13"].s.alignment = { wrapText: true };
    wsInfo["B15"].s.alignment = { wrapText: true };
    wsInfo['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];


    XLSX.utils.book_append_sheet(wb, wsInfo, 'Informações do Programa');

    // --- Sheet 2: Actions ---
    if (program.acoes.length > 0) {
        const header = [
            'Ação', 'Produto/Serviço', 'Unidade de Medida', 'Fonte',
            'Meta 2026', 'Orçamento 2026',
            'Meta 2027', 'Orçamento 2027',
            'Meta 2028', 'Orçamento 2028',
            'Meta 2029', 'Orçamento 2029',
            'Total Orçamento Ação'
        ];
        
        const actionsData = program.acoes.map(acao => {
            const orcamento2026 = parseCurrency(acao.orcamento2026);
            const orcamento2027 = parseCurrency(acao.orcamento2027);
            const orcamento2028 = parseCurrency(acao.orcamento2028);
            const orcamento2029 = parseCurrency(acao.orcamento2029);
            const totalAcao = orcamento2026 + orcamento2027 + orcamento2028 + orcamento2029;

            return [
                acao.nome,
                acao.produto,
                acao.unidadeMedida,
                acao.fonte,
                acao.metaFisica2026,
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

        const totalOrcamentoPrograma = program.acoes.reduce((total, acao) => {
            const totalAcao = parseCurrency(acao.orcamento2026) + parseCurrency(acao.orcamento2027) + parseCurrency(acao.orcamento2028) + parseCurrency(acao.orcamento2029);
            return total + totalAcao;
        }, 0);

        const footer = [
            '', '', '', '', '', '', '', '', '', '', '', 'TOTAL PROGRAMA', { t: 'n', v: totalOrcamentoPrograma, z: 'R$ #,##0.00' }
        ];

        const wsActions = XLSX.utils.aoa_to_sheet([header, ...actionsData, [], footer]);
        
        wsActions['!cols'] = [
            { wch: 40 }, { wch: 30 }, { wch: 20 }, { wch: 20 },
            { wch: 15 }, { wch: 18 },
            { wch: 15 }, { wch: 18 },
            { wch: 15 }, { wch: 18 },
            { wch: 15 }, { wch: 18 },
            { wch: 20 }
        ];
        
        const headerStyle = { font: { bold: true } };
        header.forEach((_, colIndex) => {
            const cellRef = XLSX.utils.encode_cell({c: colIndex, r: 0});
            if (wsActions[cellRef]) wsActions[cellRef].s = headerStyle;
        });

        const footerRowIndex = actionsData.length + 2;
        const totalLabelCell = XLSX.utils.encode_cell({c: 11, r: footerRowIndex});
        const totalValueCell = XLSX.utils.encode_cell({c: 12, r: footerRowIndex});
        if (wsActions[totalLabelCell]) wsActions[totalLabelCell].s = { font: { bold: true } };
        if (wsActions[totalValueCell]) wsActions[totalValueCell].s = { font: { bold: true } };

        XLSX.utils.book_append_sheet(wb, wsActions, 'Ações do Programa');
    }

    // --- Save file ---
    const fileName = `programa-${program.programa.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.xlsx`;
    XLSX.writeFile(wb, fileName);
};
