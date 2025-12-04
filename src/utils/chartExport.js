/**
 * Export chart as image (PNG)
 * @param {HTMLCanvasElement|Object} canvasOrChart - Canvas element or Chart.js instance
 * @param {string} filename - Name of the file to download
 */
export function exportChartAsImage(canvasOrChart, filename = 'chart.png') {
  let canvas = canvasOrChart;
  
  // If it's a Chart.js instance, get the canvas
  if (canvasOrChart && typeof canvasOrChart === 'object' && canvasOrChart.canvas) {
    canvas = canvasOrChart.canvas;
  }
  
  // If it's a react-chartjs-2 ref, try to get the canvas
  if (canvasOrChart && canvasOrChart.current) {
    const chartInstance = canvasOrChart.current;
    if (chartInstance.canvas) {
      canvas = chartInstance.canvas;
    } else if (chartInstance.chartInstance && chartInstance.chartInstance.canvas) {
      canvas = chartInstance.chartInstance.canvas;
    }
  }
  
  if (!canvas || !canvas.toDataURL) {
    console.error('Canvas element not found or invalid');
    return;
  }

  // Get the image data URL
  const imageUrl = canvas.toDataURL('image/png');
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(imageUrl);
}

/**
 * Export multiple charts as a ZIP file with images
 * @param {Array<{canvas: HTMLCanvasElement, name: string}>} charts - Array of chart objects
 * @param {string} zipFilename - Name of the ZIP file
 */
export async function exportChartsAsZip(charts, zipFilename = 'graficos.zip') {
  // Dynamic import of JSZip (you may need to install it: npm install jszip)
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    charts.forEach((chart, index) => {
      if (chart.canvas) {
        const imageData = chart.canvas.toDataURL('image/png').split(',')[1]; // Remove data:image/png;base64, prefix
        const filename = chart.name || `grafico_${index + 1}.png`;
        zip.file(filename, imageData, { base64: true });
      }
    });
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = zipFilename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error exporting charts as ZIP:', error);
    // Fallback: export individually
    charts.forEach((chart, index) => {
      if (chart.canvas) {
        const filename = chart.name || `grafico_${index + 1}.png`;
        exportChartAsImage(chart.canvas, filename);
      }
    });
  }
}

