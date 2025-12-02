import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function EvalChart({ chartData }) {
  const chartRef = useRef(null);

  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Não há dados suficientes para exibir o gráfico.
        <br />
        <span className="text-sm">
          Registre pelo menos uma avaliação para visualizar a evolução.
        </span>
      </div>
    );
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Peso (kg)',
        data: chartData.weights,
        borderColor: 'rgb(255, 107, 53)',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        yAxisID: 'y',
        tension: 0.1,
      },
      {
        label: 'IMC',
        data: chartData.imc,
        borderColor: 'rgb(107, 114, 128)',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        yAxisID: 'y1',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolução do Peso e IMC',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Peso (kg)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'IMC',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="w-full" style={{ height: '400px' }}>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}

