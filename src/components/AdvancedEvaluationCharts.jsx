import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut, Radar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

export default function AdvancedEvaluationCharts({ evaluation }) {
  const fatDistributionRef = useRef(null);
  const muscleBalanceRef = useRef(null);
  const bodyCompositionRef = useRef(null);
  const perimeterRatioRef = useRef(null);
  const bodyClassificationRef = useRef(null);

  if (!evaluation) return null;

  // Calculate body classification
  const getBodyClassification = () => {
    const bmi = evaluation.imc || 0;
    const fatPercentage = evaluation.fat_percentage || 0;
    
    if (bmi < 18.5) return { level: 'Abaixo do Peso', color: '#3B82F6', value: 1 };
    if (bmi >= 18.5 && bmi < 25 && fatPercentage < 15) return { level: 'Atlético', color: '#10B981', value: 5 };
    if (bmi >= 18.5 && bmi < 25) return { level: 'Normal', color: '#22C55E', value: 4 };
    if (bmi >= 25 && bmi < 30) return { level: 'Sobrepeso', color: '#F59E0B', value: 3 };
    if (bmi >= 30 && fatPercentage > 25) return { level: 'Obeso', color: '#EF4444', value: 2 };
    return { level: 'Sobrepeso', color: '#F59E0B', value: 3 };
  };

  const bodyClass = getBodyClassification();

  // Fat Distribution Chart (Radar)
  const fatDistributionData = {
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
        label: 'Distribuição de Gordura (mm)',
        data: [
          evaluation.skinfold_triceps || 0,
          evaluation.skinfold_subscapular || 0,
          evaluation.skinfold_subaxillary || 0,
          evaluation.skinfold_suprailiac || 0,
          evaluation.skinfold_abdominal || 0,
          evaluation.skinfold_quadriceps || 0,
          evaluation.skinfold_calf || 0,
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(239, 68, 68, 1)',
      },
    ],
  };

  // Muscle Balance Chart (comparison left vs right)
  const muscleBalanceData = {
    labels: ['Braço', 'Antebraço', 'Coxa', 'Perna'],
    datasets: [
      {
        label: 'Direito',
        data: [
          evaluation.perimeter_arm_r || 0,
          evaluation.perimeter_forearm_r || 0,
          evaluation.perimeter_thigh_r || 0,
          evaluation.perimeter_leg_r || 0,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
      {
        label: 'Esquerdo',
        data: [
          evaluation.perimeter_arm_l || 0,
          evaluation.perimeter_forearm_l || 0,
          evaluation.perimeter_thigh_l || 0,
          evaluation.perimeter_leg_l || 0,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Fat vs Muscle Mass Chart (Doughnut)
  const bodyCompositionData = {
    labels: ['Gordura', 'Massa Magra'],
    datasets: [
      {
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

  // Perimeter Ratios Chart
  const calculateRatios = () => {
    const waist = evaluation.perimeter_waist || 1;
    const hip = evaluation.perimeter_hip || 1;
    const chest = evaluation.perimeter_chest || 1;
    const waistHeight = waist / ((evaluation.height_m || 1) * 100);
    
    return {
      waistHip: (waist / hip).toFixed(2),
      waistChest: (waist / chest).toFixed(2),
      waistHeight: (waistHeight * 100).toFixed(1),
    };
  };

  const ratios = calculateRatios();
  const perimeterRatioData = {
    labels: ['Cintura/Quadril', 'Cintura/Tórax', 'Cintura/Altura (%)'],
    datasets: [
      {
        label: 'Relação',
        data: [
          parseFloat(ratios.waistHip),
          parseFloat(ratios.waistChest),
          parseFloat(ratios.waistHeight),
        ],
        backgroundColor: [
          'rgba(147, 51, 234, 0.6)',
          'rgba(236, 72, 153, 0.6)',
          'rgba(251, 146, 60, 0.6)',
        ],
        borderColor: [
          'rgba(147, 51, 234, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(251, 146, 60, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Body Classification Chart
  const bodyClassificationData = {
    labels: ['Abaixo do Peso', 'Obeso', 'Sobrepeso', 'Normal', 'Atlético'],
    datasets: [
      {
        label: 'Classificação Corporal',
        data: [0, 0, 0, 0, 0].map((_, index) => 
          index + 1 === bodyClass.value ? 100 : 0
        ),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(16, 185, 129, 0.6)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(16, 185, 129, 1)',
        ],
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
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Análises Avançadas</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fat Distribution Radar */}
        <div className="card">
          <h4 className="text-lg font-semibold mb-4">Distribuição de Gordura Corporal</h4>
          <div style={{ height: '300px' }}>
            <Radar ref={fatDistributionRef} data={fatDistributionData} options={radarOptions} />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Visualização da distribuição de gordura em diferentes regiões do corpo
          </p>
        </div>

        {/* Muscle Balance */}
        <div className="card">
          <h4 className="text-lg font-semibold mb-4">Equilíbrio Muscular</h4>
          <div style={{ height: '300px' }}>
            <Bar ref={muscleBalanceRef} data={muscleBalanceData} options={chartOptions} />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Comparação entre lado direito e esquerdo para identificar assimetrias
          </p>
        </div>

        {/* Body Composition Doughnut */}
        <div className="card">
          <h4 className="text-lg font-semibold mb-4">Gordura vs Massa Muscular</h4>
          <div style={{ height: '300px' }}>
            <Doughnut ref={bodyCompositionRef} data={bodyCompositionData} options={chartOptions} />
          </div>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-red-600">
                {evaluation.fat_percentage?.toFixed(1) || 0}%
              </div>
              <div className="text-gray-600">Gordura</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">
                {evaluation.lean_mass_percentage?.toFixed(1) || 0}%
              </div>
              <div className="text-gray-600">Massa Magra</div>
            </div>
          </div>
        </div>

        {/* Perimeter Ratios */}
        <div className="card">
          <h4 className="text-lg font-semibold mb-4">Relação de Perímetros</h4>
          <div style={{ height: '300px' }}>
            <Bar ref={perimeterRatioRef} data={perimeterRatioData} options={chartOptions} />
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cintura/Quadril:</span>
              <span className="font-semibold">{ratios.waistHip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cintura/Tórax:</span>
              <span className="font-semibold">{ratios.waistChest}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cintura/Altura:</span>
              <span className="font-semibold">{ratios.waistHeight}%</span>
            </div>
          </div>
        </div>

        {/* Body Classification */}
        <div className="card lg:col-span-2">
          <h4 className="text-lg font-semibold mb-4">Classificação Corporal</h4>
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div style={{ height: '250px', width: '250px' }} className="flex-shrink-0">
              <Doughnut ref={bodyClassificationRef} data={bodyClassificationData} options={chartOptions} />
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <div 
                  className="inline-block px-4 py-2 rounded-lg text-white font-semibold text-lg"
                  style={{ backgroundColor: bodyClass.color }}
                >
                  {bodyClass.level}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">IMC:</span>
                  <span className="font-semibold">{evaluation.imc?.toFixed(2) || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">% Gordura:</span>
                  <span className="font-semibold">{evaluation.fat_percentage?.toFixed(2) || '-'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Metabolismo Basal:</span>
                  <span className="font-semibold">{evaluation.basal_metabolism?.toFixed(0) || '-'} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Idade Corporal:</span>
                  <span className="font-semibold">{evaluation.body_age?.toFixed(1) || '-'} anos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

