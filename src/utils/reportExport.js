/**
 * Helper function to format date to Brazilian format
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

/**
 * Helper function to format number with 2 decimals
 */
function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '-';
  return Number(value).toFixed(decimals);
}

/**
 * Helper function to format change indicator
 */
function formatChange(value) {
  if (value === null || value === undefined || value === 0) return '-';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

/**
 * Helper function to get BMI classification
 */
function getBMIClassification(bmi) {
  if (!bmi) return '-';
  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidade';
}

/**
 * Helper function to add a new page if needed
 */
function checkPageBreak(pdf, y, marginBottom = 20) {
  const pageHeight = pdf.internal.pageSize.height;
  if (y + marginBottom > pageHeight) {
    pdf.addPage();
    return 15; // Return new Y position
  }
  return y;
}

/**
 * Helper function to add a section header
 */
function addSectionHeader(pdf, y, title) {
  y = checkPageBreak(pdf, y, 15);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, 15, y);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(10);
  return y + 8;
}

/**
 * Helper function to add a two-column row
 */
function addTwoColumnRow(pdf, y, label, value, x1 = 15, x2 = 100, maxWidth = 80) {
  y = checkPageBreak(pdf, y, 10);
  pdf.setFontSize(9);
  pdf.setFont(undefined, 'normal');
  pdf.text(label, x1, y);
  
  // Wrap text if too long
  const lines = pdf.splitTextToSize(String(value), maxWidth);
  pdf.setFont(undefined, 'bold');
  pdf.text(lines, x2, y);
  pdf.setFont(undefined, 'normal');
  
  return y + (lines.length * 5) + 2;
}

/**
 * Helper function to capture chart as image with better quality and proportions
 * Improved to match page appearance more accurately
 */
async function captureChartElement(selector) {
  const html2canvas = (await import('html2canvas')).default;
  const element = document.querySelector(`[data-chart="${selector}"]`);
  if (!element) return null;
  
  try {
    // Wait a bit to ensure chart is fully rendered
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get the actual dimensions of the element
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Use higher scale for better quality (4x for crisp images)
    const scale = 4;
    
    // Calculate proper dimensions maintaining aspect ratio
    const aspectRatio = width / height;
    
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: width,
      height: height,
      windowWidth: width,
      windowHeight: height,
      // Ensure charts are rendered properly
      allowTaint: false,
      removeContainer: false,
      // Better rendering options
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        // Ensure the cloned element maintains the same styles
        const clonedElement = clonedDoc.querySelector(`[data-chart="${selector}"]`);
        if (clonedElement) {
          clonedElement.style.width = `${width}px`;
          clonedElement.style.height = `${height}px`;
        }
      },
    });
    
    // Ensure canvas maintains aspect ratio
    const canvasAspectRatio = canvas.width / canvas.height;
    let finalWidth = canvas.width;
    let finalHeight = canvas.height;
    
    // Adjust if aspect ratio doesn't match
    if (Math.abs(canvasAspectRatio - aspectRatio) > 0.01) {
      if (canvasAspectRatio > aspectRatio) {
        finalWidth = Math.round(canvas.height * aspectRatio);
      } else {
        finalHeight = Math.round(canvas.width / aspectRatio);
      }
    }
    
    return {
      dataUrl: canvas.toDataURL('image/png', 1.0), // Maximum quality PNG
      width: finalWidth,
      height: finalHeight,
      originalWidth: width,
      originalHeight: height,
    };
  } catch (error) {
    console.error(`Error capturing chart ${selector}:`, error);
    return null;
  }
}

/**
 * Export evaluation report to PDF (generated directly with charts)
 * @param {Object} reportData - Report data from API
 * @param {string} studentName - Student name for filename
 */
export async function exportToPDF(reportData, studentName = 'aluno') {
  try {
    // Dynamic import of jsPDF
    const { default: jsPDF } = await import('jspdf');
    
    const { evaluation, student, summary } = reportData;
    const comparison = summary.comparison_with_previous || {};
    const keyMetrics = summary.key_metrics || {};
    const healthConditions = summary.health_conditions || {};
    
    // Initialize PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let y = 15; // Starting Y position
    
    // Set default font
    pdf.setFont('helvetica');
    pdf.setFontSize(10);
    
    // Header
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text('Relatório de Avaliação Física', 15, y);
    y += 8;
    
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Aluno: ${student.name}`, 15, y);
    y += 6;
    pdf.text(`Data: ${formatDate(evaluation.date)}`, 15, y);
    y += 10;
    
    // Draw line separator
    pdf.setLineWidth(0.5);
    pdf.line(15, y, 195, y);
    y += 8;
    
    // Key Metrics Section
    y = addSectionHeader(pdf, y, 'Métricas Principais');
    
    y = addTwoColumnRow(pdf, y, 'Peso:', `${formatNumber(keyMetrics.weight_kg)} kg`);
    if (comparison.weight_change_kg !== undefined) {
      const changeText = `${formatChange(comparison.weight_change_kg)} kg desde ${comparison.previous_date ? formatDate(comparison.previous_date) : 'última avaliação'}`;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(changeText, 100, y - 2);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
    }
    y += 2;
    
    y = addTwoColumnRow(pdf, y, 'Altura:', `${formatNumber(keyMetrics.height_m, 2)} m`);
    y += 2;
    
    const bmiValue = formatNumber(keyMetrics.imc);
    const bmiClass = getBMIClassification(keyMetrics.imc);
    y = addTwoColumnRow(pdf, y, 'IMC:', `${bmiValue} (${bmiClass})`);
    if (comparison.imc_change !== undefined) {
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Variação: ${formatChange(comparison.imc_change)}`, 100, y - 2);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
    }
    y += 2;
    
    y = addTwoColumnRow(pdf, y, '% Gordura Corporal:', `${formatNumber(keyMetrics.fat_percentage)}%`);
    if (comparison.fat_percentage_change !== undefined) {
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Variação: ${formatChange(comparison.fat_percentage_change)}%`, 100, y - 2);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
    }
    y += 2;
    
    y = addTwoColumnRow(pdf, y, '% Massa Magra:', `${formatNumber(keyMetrics.lean_mass_percentage)}%`);
    y += 2;
    
    y = addTwoColumnRow(pdf, y, 'Metabolismo Basal:', `${formatNumber(keyMetrics.basal_metabolism, 0)} kcal`);
    y += 2;
    
    y = addTwoColumnRow(pdf, y, 'Idade Corporal:', `${formatNumber(keyMetrics.body_age, 1)} anos`);
    y += 2;
    
    y = addTwoColumnRow(pdf, y, 'Gordura Visceral:', formatNumber(keyMetrics.visceral_fat, 1));
    y += 2;
    
    y = addTwoColumnRow(pdf, y, 'Frequência Cardíaca:', `${formatNumber(evaluation.heart_rate_rest, 0)} bpm`);
    y += 8;
    
    // Health Conditions Section
    if (healthConditions.cardiopathy || healthConditions.hypertension || healthConditions.diabetes) {
      y = addSectionHeader(pdf, y, 'Condições de Saúde');
      
      if (healthConditions.cardiopathy) {
        y = addTwoColumnRow(pdf, y, 'Cardiopatia:', 'Sim');
        if (evaluation.cardiopathy_notes) {
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          const notesLines = pdf.splitTextToSize(evaluation.cardiopathy_notes, 80);
          pdf.text(notesLines, 100, y - 2);
          y += notesLines.length * 4;
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(9);
        }
        y += 2;
      }
      
      if (healthConditions.hypertension) {
        y = addTwoColumnRow(pdf, y, 'Hipertensão:', 'Sim');
        if (evaluation.hypertension_notes) {
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          const notesLines = pdf.splitTextToSize(evaluation.hypertension_notes, 80);
          pdf.text(notesLines, 100, y - 2);
          y += notesLines.length * 4;
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(9);
        }
        y += 2;
      }
      
      if (healthConditions.diabetes) {
        y = addTwoColumnRow(pdf, y, 'Diabetes:', 'Sim');
        if (evaluation.diabetes_notes) {
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          const notesLines = pdf.splitTextToSize(evaluation.diabetes_notes, 80);
          pdf.text(notesLines, 100, y - 2);
          y += notesLines.length * 4;
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(9);
        }
        y += 2;
      }
      
      y += 5;
    }
    
    // Flexibility Tests Section
    y = addSectionHeader(pdf, y, 'Testes de Flexibilidade');
    y = addTwoColumnRow(pdf, y, 'Teste de Sentar e Alcançar:', `${formatNumber(evaluation.wells_sit_reach_test, 1)} cm`);
    y += 2;
    y = addTwoColumnRow(pdf, y, 'Teste de Flexão do Tronco:', `${formatNumber(evaluation.trunk_flexion_test, 1)} cm`);
    y += 8;
    
    // Skinfold Measurements Section
    y = addSectionHeader(pdf, y, 'Dobras Cutâneas (mm)');
    
    const skinfolds = [
      { label: 'Tríceps', value: evaluation.skinfold_triceps },
      { label: 'Subescapular', value: evaluation.skinfold_subscapular },
      { label: 'Subaxilar', value: evaluation.skinfold_subaxillary },
      { label: 'Suprailíaca', value: evaluation.skinfold_suprailiac },
      { label: 'Abdominal', value: evaluation.skinfold_abdominal },
      { label: 'Quadríceps', value: evaluation.skinfold_quadriceps },
      { label: 'Panturrilha', value: evaluation.skinfold_calf },
    ];
    
    // Two columns for skinfolds
    let col1Y = y;
    let col2Y = y;
    const col1X = 15;
    const col2X = 100;
    
    skinfolds.forEach((item, index) => {
      const targetY = index < 4 ? col1Y : col2Y;
      const targetX = index < 4 ? col1X : col2X;
      
      if (index === 4) {
        col2Y = y; // Reset second column Y
      }
      
      const newY = addTwoColumnRow(pdf, targetY, `${item.label}:`, formatNumber(item.value, 1), targetX, targetX + 50, 40);
      
      if (index < 4) {
        col1Y = newY;
      } else {
        col2Y = newY;
      }
    });
    
    y = Math.max(col1Y, col2Y) + 8;
    
    // Perimeter Measurements Section
    y = addSectionHeader(pdf, y, 'Perímetros (cm)');
    
    const perimeters = [
      { label: 'Tórax', value: evaluation.perimeter_chest },
      { label: 'Braço Direito', value: evaluation.perimeter_arm_r },
      { label: 'Braço Esquerdo', value: evaluation.perimeter_arm_l },
      { label: 'Braço Contratado D', value: evaluation.perimeter_arm_contracted_r },
      { label: 'Braço Contratado E', value: evaluation.perimeter_arm_contracted_l },
      { label: 'Antebraço Direito', value: evaluation.perimeter_forearm_r },
      { label: 'Antebraço Esquerdo', value: evaluation.perimeter_forearm_l },
      { label: 'Cintura', value: evaluation.perimeter_waist },
      { label: 'Abdominal', value: evaluation.perimeter_abdominal },
      { label: 'Quadril', value: evaluation.perimeter_hip },
      { label: 'Coxa Direita', value: evaluation.perimeter_thigh_r },
      { label: 'Coxa Esquerda', value: evaluation.perimeter_thigh_l },
      { label: 'Perna Direita', value: evaluation.perimeter_leg_r },
      { label: 'Perna Esquerda', value: evaluation.perimeter_leg_l },
    ];
    
    // Three columns for perimeters
    let pCol1Y = y;
    let pCol2Y = y;
    let pCol3Y = y;
    const pCol1X = 15;
    const pCol2X = 70;
    const pCol3X = 125;
    
    perimeters.forEach((item, index) => {
      let targetY, targetX;
      if (index < 5) {
        targetY = pCol1Y;
        targetX = pCol1X;
      } else if (index < 10) {
        targetY = pCol2Y;
        targetX = pCol2X;
        if (index === 5) pCol2Y = y;
      } else {
        targetY = pCol3Y;
        targetX = pCol3X;
        if (index === 10) pCol3Y = y;
      }
      
      const newY = addTwoColumnRow(pdf, targetY, `${item.label}:`, formatNumber(item.value, 1), targetX, targetX + 40, 30);
      
      if (index < 5) {
        pCol1Y = newY;
      } else if (index < 10) {
        pCol2Y = newY;
      } else {
        pCol3Y = newY;
      }
    });
    
    y = Math.max(pCol1Y, pCol2Y, pCol3Y) + 8;
    
    // Notes Section
    if (evaluation.notes) {
      y = addSectionHeader(pdf, y, 'Observações');
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      const notesLines = pdf.splitTextToSize(evaluation.notes, 180);
      y = checkPageBreak(pdf, y, notesLines.length * 5);
      pdf.text(notesLines, 15, y);
      y += notesLines.length * 5 + 8;
    }
    
    // Summary Footer
    y = checkPageBreak(pdf, y, 15);
    pdf.setLineWidth(0.3);
    pdf.line(15, y, 195, y);
    y += 5;
    
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Avaliação #${summary.evaluation_number || '-'} de ${summary.total_evaluations || '-'} total`, 15, y);
    
    if (comparison.trend) {
      y += 4;
      const trendText = comparison.trend === 'improving' ? 'Melhorando' : 
                       comparison.trend === 'maintaining' ? 'Mantendo' : 
                       'Precisa de atenção';
      pdf.text(`Tendência: ${trendText}`, 15, y);
    }
    
    // Charts Section - Capture and add charts to PDF
    y += 10;
    y = checkPageBreak(pdf, y, 50);
    y = addSectionHeader(pdf, y, 'Análises Avançadas - Gráficos');
    y += 5;
    
    // Wait a bit for charts to render
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Chart configurations: [selector, title, width, height]
    // Updated dimensions to better match page proportions
    const charts = [
      ['fat-distribution', 'Distribuição de Gordura Corporal', 85, 65],
      ['muscle-balance', 'Equilíbrio Muscular', 85, 65],
      ['body-composition', 'Gordura vs Massa Muscular', 85, 65],
      ['perimeter-ratios', 'Relação de Perímetros', 85, 65],
      ['body-classification', 'Classificação Corporal', 85, 65],
    ];
    
    for (let i = 0; i < charts.length; i++) {
      const [selector, title, chartWidth, chartHeight] = charts[i];
      
      // Check if we need a new page
      y = checkPageBreak(pdf, y, chartHeight + 20);
      
      // Add chart title
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text(title, 15, y);
      y += 5;
      
      // Capture chart with improved quality
      const chartImage = await captureChartElement(selector);
      
      if (chartImage && chartImage.dataUrl) {
        try {
          // Calculate proper dimensions maintaining aspect ratio
          let finalWidth = chartWidth;
          let finalHeight = chartHeight;
          
          // Use original dimensions if available to maintain aspect ratio
          if (chartImage.originalWidth && chartImage.originalHeight) {
            const aspectRatio = chartImage.originalWidth / chartImage.originalHeight;
            // Maintain aspect ratio within PDF constraints
            if (aspectRatio > chartWidth / chartHeight) {
              finalHeight = chartWidth / aspectRatio;
            } else {
              finalWidth = chartHeight * aspectRatio;
            }
          }
          
          // Add chart image to PDF with proper dimensions
          pdf.addImage(chartImage.dataUrl, 'PNG', 15, y, finalWidth, finalHeight);
          y += finalHeight + 8;
        } catch (error) {
          console.error(`Error adding chart ${selector} to PDF:`, error);
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          pdf.text(`Gráfico não disponível`, 15, y);
          pdf.setTextColor(0, 0, 0);
          y += 10;
        }
      } else {
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Gráfico não disponível`, 15, y);
        pdf.setTextColor(0, 0, 0);
        y += 10;
      }
      
      // Add spacing between charts (except for the last one)
      if (i < charts.length - 1) {
        y += 5;
      }
    }
    
    // Save PDF
    const filename = `relatorio_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Erro ao exportar PDF. Certifique-se de que a biblioteca jsPDF está instalada.');
  }
}

/**
 * Export evaluation report to Excel
 * Note: Currently exports data only. To add charts/images, consider using exceljs library
 * which supports image insertion. The captureChartElement function is already optimized
 * for high-quality chart capture.
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

