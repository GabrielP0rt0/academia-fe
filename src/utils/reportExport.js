/**
 * Export evaluation report to PDF
 * @param {Object} reportData - Report data from API
 * @param {string} studentName - Student name for filename
 */
export async function exportToPDF(reportData, studentName = 'aluno') {
  try {
    // Dynamic import of jsPDF and html2canvas
    const { default: jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    // Get the report element
    const reportElement = document.querySelector('[data-report-content]');
    if (!reportElement) {
      // Fallback: try to find the modal content
      const modalContent = document.querySelector('.bg-white.rounded-lg.shadow-xl');
      if (!modalContent) {
        throw new Error('Elemento do relatório não encontrado');
      }
      
      const canvas = await html2canvas(modalContent, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `relatorio_${studentName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      return;
    }

    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = `relatorio_${studentName}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Erro ao exportar PDF. Certifique-se de que todas as bibliotecas estão instaladas.');
  }
}

/**
 * Export evaluation report to Excel
 * @param {Object} reportData - Report data from API
 * @param {string} studentName - Student name for filename
 */
export async function exportToExcel(reportData, studentName = 'aluno') {
  try {
    const XLSX = (await import('xlsx')).default;
    const { evaluation, student, summary } = reportData;

    // Prepare data for Excel
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Relatório de Avaliação Física'],
      ['Aluno:', student.name],
      ['Data:', evaluation.date],
      [''],
      ['Métricas Principais'],
      ['Peso (kg)', evaluation.weight_kg?.toFixed(2) || '-'],
      ['Altura (m)', evaluation.height_m?.toFixed(2) || '-'],
      ['IMC', evaluation.imc?.toFixed(2) || '-'],
      ['% Gordura', evaluation.fat_percentage?.toFixed(2) || '-'],
      ['% Massa Magra', evaluation.lean_mass_percentage?.toFixed(2) || '-'],
      ['Metabolismo Basal (kcal)', evaluation.basal_metabolism?.toFixed(0) || '-'],
      ['Idade Corporal (anos)', evaluation.body_age?.toFixed(1) || '-'],
      ['Gordura Visceral', evaluation.visceral_fat?.toFixed(1) || '-'],
      ['Frequência Cardíaca (bpm)', evaluation.heart_rate_rest?.toFixed(0) || '-'],
      [''],
      ['Condições de Saúde'],
      ['Cardiopatia', evaluation.cardiopathy ? 'Sim' : 'Não'],
      ['Hipertensão', evaluation.hypertension ? 'Sim' : 'Não'],
      ['Diabetes', evaluation.diabetes ? 'Sim' : 'Não'],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    // Skinfolds Sheet
    const skinfoldsData = [
      ['Dobras Cutâneas (mm)'],
      ['Tríceps', evaluation.skinfold_triceps?.toFixed(1) || '-'],
      ['Subescapular', evaluation.skinfold_subscapular?.toFixed(1) || '-'],
      ['Subaxilar', evaluation.skinfold_subaxillary?.toFixed(1) || '-'],
      ['Suprailíaca', evaluation.skinfold_suprailiac?.toFixed(1) || '-'],
      ['Abdominal', evaluation.skinfold_abdominal?.toFixed(1) || '-'],
      ['Quadríceps', evaluation.skinfold_quadriceps?.toFixed(1) || '-'],
      ['Panturrilha', evaluation.skinfold_calf?.toFixed(1) || '-'],
    ];

    const skinfoldsSheet = XLSX.utils.aoa_to_sheet(skinfoldsData);
    XLSX.utils.book_append_sheet(workbook, skinfoldsSheet, 'Dobras Cutâneas');

    // Perimeters Sheet
    const perimetersData = [
      ['Perímetros (cm)'],
      ['Tórax', evaluation.perimeter_chest?.toFixed(1) || '-'],
      ['Braço Direito', evaluation.perimeter_arm_r?.toFixed(1) || '-'],
      ['Braço Esquerdo', evaluation.perimeter_arm_l?.toFixed(1) || '-'],
      ['Braço Contratado D', evaluation.perimeter_arm_contracted_r?.toFixed(1) || '-'],
      ['Braço Contratado E', evaluation.perimeter_arm_contracted_l?.toFixed(1) || '-'],
      ['Antebraço Direito', evaluation.perimeter_forearm_r?.toFixed(1) || '-'],
      ['Antebraço Esquerdo', evaluation.perimeter_forearm_l?.toFixed(1) || '-'],
      ['Cintura', evaluation.perimeter_waist?.toFixed(1) || '-'],
      ['Abdominal', evaluation.perimeter_abdominal?.toFixed(1) || '-'],
      ['Quadril', evaluation.perimeter_hip?.toFixed(1) || '-'],
      ['Coxa Direita', evaluation.perimeter_thigh_r?.toFixed(1) || '-'],
      ['Coxa Esquerda', evaluation.perimeter_thigh_l?.toFixed(1) || '-'],
      ['Perna Direita', evaluation.perimeter_leg_r?.toFixed(1) || '-'],
      ['Perna Esquerda', evaluation.perimeter_leg_l?.toFixed(1) || '-'],
    ];

    const perimetersSheet = XLSX.utils.aoa_to_sheet(perimetersData);
    XLSX.utils.book_append_sheet(workbook, perimetersSheet, 'Perímetros');

    // Flexibility Tests Sheet
    const flexibilityData = [
      ['Testes de Flexibilidade'],
      ['Teste de Sentar e Alcançar (cm)', evaluation.wells_sit_reach_test?.toFixed(1) || '-'],
      ['Teste de Flexão do Tronco (cm)', evaluation.trunk_flexion_test?.toFixed(1) || '-'],
    ];

    const flexibilitySheet = XLSX.utils.aoa_to_sheet(flexibilityData);
    XLSX.utils.book_append_sheet(workbook, flexibilitySheet, 'Flexibilidade');

    // Comparison Sheet
    if (summary.comparison_with_previous) {
      const comparison = summary.comparison_with_previous;
      const comparisonData = [
        ['Comparação com Avaliação Anterior'],
        ['Data da Avaliação Anterior', comparison.previous_date || '-'],
        ['Variação de Peso (kg)', comparison.weight_change_kg?.toFixed(2) || '-'],
        ['Variação de IMC', comparison.imc_change?.toFixed(2) || '-'],
        ['Variação de % Gordura', comparison.fat_percentage_change?.toFixed(2) || '-'],
        ['Tendência', comparison.trend === 'improving' ? 'Melhorando' : 
                    comparison.trend === 'maintaining' ? 'Mantendo' : 
                    'Precisa de atenção'],
      ];

      const comparisonSheet = XLSX.utils.aoa_to_sheet(comparisonData);
      XLSX.utils.book_append_sheet(workbook, comparisonSheet, 'Comparação');
    }

    // Notes Sheet
    if (evaluation.notes) {
      const notesData = [
        ['Observações'],
        [evaluation.notes],
      ];
      const notesSheet = XLSX.utils.aoa_to_sheet(notesData);
      XLSX.utils.book_append_sheet(workbook, notesSheet, 'Observações');
    }

    // Save file
    const filename = `relatorio_${studentName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw new Error('Erro ao exportar Excel. Certifique-se de que a biblioteca xlsx está instalada.');
  }
}

