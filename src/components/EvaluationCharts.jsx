import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useFetch } from '../hooks/useFetch';
import api from '../api';
import Loading from './Loading';
import { exportChartAsImage, exportChartsAsZip } from '../utils/chartExport';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function EvaluationCharts({ studentId, studentName }) {
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null);
  const weightChartRef = useRef(null);
  const imcChartRef = useRef(null);
  const bodyCompositionChartRef = useRef(null);
  const perimetersChartRef = useRef(null);
  const skinfoldsChartRef = useRef(null);

  const {
    data: evaluations,
    loading: evaluationsLoading,
  } = useFetch(() => api.evaluations.listByStudent(studentId), [studentId]);

  const {
    data: report,
    loading: reportLoading,
  } = useFetch(
    () => {
      if (!selectedEvaluationId) return Promise.resolve(null);
      return api.evaluations.getReport(selectedEvaluationId);
    },
    [selectedEvaluationId]
  );

  // Set first evaluation as default when evaluations load
  useEffect(() => {
    if (evaluations && evaluations.length > 0 && !selectedEvaluationId) {
      setSelectedEvaluationId(evaluations[0].id);
    }
  }, [evaluations, selectedEvaluationId]);

  const handleExportAllCharts = async () => {
    try {
      const charts = [
        { ref: weightChartRef, name: 'peso' },
        { ref: imcChartRef, name: 'imc' },
        { ref: bodyCompositionChartRef, name: 'composicao' },
        { ref: perimetersChartRef, name: 'perimetros' },
        { ref: skinfoldsChartRef, name: 'dobras' },
      ]
        .map(({ ref, name }) => {
          if (!ref.current) return null;
          return { canvas: ref.current, name: `${studentName || 'aluno'}_${name}.png` };
        })
        .filter(Boolean);

      if (charts.length === 0) {
        toast.warning('Nenhum gráfico disponível para exportar');
        return;
      }

      await exportChartsAsZip(charts, `graficos_${studentName || 'aluno'}_${new Date().toISOString().split('T')[0]}.zip`);
      toast.success('Gráficos exportados com sucesso!');
    } catch (error) {
      console.error('Error exporting charts:', error);
      toast.error('Erro ao exportar gráficos');
    }
  };

  const handleExportChart = (chartRef, chartTitle, chartName) => {
    if (!chartRef.current) {
      toast.warning('Gráfico ainda não está pronto');
      return;
    }
    
    const filename = `${studentName || 'aluno'}_${chartName}_${new Date().toISOString().split('T')[0]}.png`;
    exportChartAsImage(chartRef.current, filename);
    toast.success(`${chartTitle} exportado com sucesso!`);
  };

  if (evaluationsLoading || reportLoading) {
    return <Loading message="Carregando dados da avaliação..." />;
  }

  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Não há avaliações registradas para este aluno.
      </div>
    );
  }

  if (!report || !report.evaluation) {
    return (
      <div className="text-center py-12 text-gray-500">
        Selecione uma avaliação para visualizar os gráficos.
      </div>
    );
  }

  const { evaluation, student } = report;

  // Prepare data for charts
  const allEvaluations = evaluations.sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = allEvaluations.map((e) => formatDate(e.date));
  
  // Weight and IMC chart data
  const weightData = {
    labels,
    datasets: [
      {
        label: 'Peso (kg)',
        data: allEvaluations.map((e) => e.weight_kg),
        borderColor: 'rgb(255, 107, 53)',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        yAxisID: 'y',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const imcData = {
    labels,
    datasets: [
      {
        label: 'IMC',
        data: allEvaluations.map((e) => e.imc),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Body composition chart
  const bodyCompositionData = {
    labels: ['Gordura (%)', 'Massa Magra (%)'],
    datasets: [
      {
        label: 'Composição Corporal',
        data: [
          evaluation.fat_percentage || 0,
          evaluation.lean_mass_percentage || 0,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Perimeters chart
  const perimetersData = {
    labels: [
      'Tórax',
      'Braço D',
      'Braço E',
      'Antebraço D',
      'Antebraço E',
      'Cintura',
      'Abdominal',
      'Quadril',
      'Coxa D',
      'Coxa E',
      'Perna D',
      'Perna E',
    ],
    datasets: [
      {
        label: 'Perímetros (cm)',
        data: [
          evaluation.perimeter_chest,
          evaluation.perimeter_arm_r,
          evaluation.perimeter_arm_l,
          evaluation.perimeter_forearm_r,
          evaluation.perimeter_forearm_l,
          evaluation.perimeter_waist,
          evaluation.perimeter_abdominal,
          evaluation.perimeter_hip,
          evaluation.perimeter_thigh_r,
          evaluation.perimeter_thigh_l,
          evaluation.perimeter_leg_r,
          evaluation.perimeter_leg_l,
        ],
        backgroundColor: 'rgba(147, 51, 234, 0.6)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Skinfolds chart
  const skinfoldsData = {
    labels: [
      'Tríceps',
      'Subescapular',
      'Subaxilar',
      'Suprailíaca',
      'Abdominal',
      'Quadríceps',
      'Panturrilha',
    ],
    datasets: [
      {
        label: 'Dobras Cutâneas (mm)',
        data: [
          evaluation.skinfold_triceps,
          evaluation.skinfold_subscapular,
          evaluation.skinfold_subaxillary,
          evaluation.skinfold_suprailiac,
          evaluation.skinfold_abdominal,
          evaluation.skinfold_quadriceps,
          evaluation.skinfold_calf,
        ],
        backgroundColor: 'rgba(251, 146, 60, 0.6)',
        borderColor: 'rgba(251, 146, 60, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Valor',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Evaluation selector and export button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="evaluation-select" className="label">
            Selecionar Avaliação
          </label>
            <select
              id="evaluation-select"
              value={selectedEvaluationId || ''}
              onChange={(e) => setSelectedEvaluationId(e.target.value)}
              className="input-field max-w-md"
            >
              {evaluations.map((evaluation) => (
                <option key={evaluation.id} value={evaluation.id}>
                  {formatDate(evaluation.date)} - {evaluation.weight_kg}kg
                </option>
              ))}
            </select>
        </div>
        <button
          onClick={handleExportAllCharts}
          className="btn-primary whitespace-nowrap"
        >
          📥 Exportar Todos os Gráficos
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Evolução do Peso</h3>
            <button
              onClick={() => handleExportChart(weightChartRef, 'Gráfico de Peso', 'peso')}
              className="text-sm text-primary hover:text-primary-dark"
            >
              📥 Exportar
            </button>
          </div>
          <div style={{ height: '300px' }}>
            <Line ref={weightChartRef} data={weightData} options={lineChartOptions} />
          </div>
        </div>

        {/* IMC Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Evolução do IMC</h3>
            <button
              onClick={() => handleExportChart(imcChartRef, 'Gráfico de IMC', 'imc')}
              className="text-sm text-primary hover:text-primary-dark"
            >
              📥 Exportar
            </button>
          </div>
          <div style={{ height: '300px' }}>
            <Line ref={imcChartRef} data={imcData} options={lineChartOptions} />
          </div>
        </div>

        {/* Body Composition Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Composição Corporal</h3>
            <button
              onClick={() => handleExportChart(bodyCompositionChartRef, 'Gráfico de Composição', 'composicao')}
              className="text-sm text-primary hover:text-primary-dark"
            >
              📥 Exportar
            </button>
          </div>
          <div style={{ height: '300px' }}>
            <Bar ref={bodyCompositionChartRef} data={bodyCompositionData} options={chartOptions} />
          </div>
        </div>

        {/* Perimeters Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Perímetros Corporais</h3>
            <button
              onClick={() => handleExportChart(perimetersChartRef, 'Gráfico de Perímetros', 'perimetros')}
              className="text-sm text-primary hover:text-primary-dark"
            >
              📥 Exportar
            </button>
          </div>
          <div style={{ height: '300px' }}>
            <Bar ref={perimetersChartRef} data={perimetersData} options={chartOptions} />
          </div>
        </div>

        {/* Skinfolds Chart */}
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Dobras Cutâneas</h3>
            <button
              onClick={() => handleExportChart(skinfoldsChartRef, 'Gráfico de Dobras', 'dobras')}
              className="text-sm text-primary hover:text-primary-dark"
            >
              📥 Exportar
            </button>
          </div>
          <div style={{ height: '300px' }}>
            <Bar ref={skinfoldsChartRef} data={skinfoldsData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

