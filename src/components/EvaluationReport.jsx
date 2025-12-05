import { useFetch } from '../hooks/useFetch';
import api from '../api';
import Loading from './Loading';
import AdvancedEvaluationCharts from './AdvancedEvaluationCharts';
import { formatDate } from '../utils/formatters';
import { exportToPDF } from '../utils/reportExport';
import { toast } from 'react-toastify';

export default function EvaluationReport({ evaluationId, onClose }) {
  const {
    data: reportData,
    loading,
    error,
  } = useFetch(
    () => api.evaluations.getReport(evaluationId),
    [evaluationId]
  );

  if (loading) {
    return <Loading message="Carregando relatório..." />;
  }

  if (error || !reportData) {
    return (
      <div className="card text-center py-8">
        <p className="text-red-600">Erro ao carregar relatório</p>
        {onClose && (
          <button onClick={onClose} className="btn-outline mt-4">
            Fechar
          </button>
        )}
      </div>
    );
  }

  const { evaluation, student, summary } = reportData;
  const comparison = summary.comparison_with_previous || {};
  const keyMetrics = summary.key_metrics || {};
  const healthConditions = summary.health_conditions || {};

  // Helper function to format change indicators
  const formatChange = (value, unit = '') => {
    if (value === null || value === undefined || value === 0) return '-';
    const sign = value > 0 ? '+' : '';
    const color = value > 0 ? 'text-red-600' : value < 0 ? 'text-green-600' : 'text-gray-600';
    return (
      <span className={color}>
        {sign}{value.toFixed(2)} {unit}
      </span>
    );
  };

  // Helper function to get BMI classification
  const getBMIClassification = (bmi) => {
    if (!bmi) return '-';
    if (bmi < 18.5) return { text: 'Abaixo do peso', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Peso normal', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-600' };
    return { text: 'Obesidade', color: 'text-red-600' };
  };

  const bmiClass = getBMIClassification(keyMetrics.imc);

  return (
    <div className="space-y-6" data-report-content>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatório de Avaliação</h2>
          <p className="text-sm text-gray-500 mt-1">
            {student.name} - {formatDate(evaluation.date)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => exportToPDF(reportData, student.name)}
            className="btn-outline text-sm"
          >
            📄 Exportar PDF
          </button>
          {onClose && (
            <button onClick={onClose} className="btn-outline">
              Fechar
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Peso</h3>
          <p className="text-2xl font-bold text-gray-900">
            {keyMetrics.weight_kg?.toFixed(2) || '-'} kg
          </p>
          {comparison.weight_change_kg !== undefined && (
            <p className="text-sm mt-1">
              {formatChange(comparison.weight_change_kg, 'kg')} desde {comparison.previous_date ? formatDate(comparison.previous_date) : 'última avaliação'}
            </p>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">IMC</h3>
          <p className="text-2xl font-bold text-gray-900">
            {keyMetrics.imc?.toFixed(2) || '-'}
          </p>
          <p className={`text-sm mt-1 ${bmiClass.color}`}>
            {bmiClass.text}
          </p>
          {comparison.imc_change !== undefined && (
            <p className="text-xs mt-1 text-gray-500">
              {formatChange(comparison.imc_change)} desde última avaliação
            </p>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">% Gordura</h3>
          <p className="text-2xl font-bold text-gray-900">
            {keyMetrics.fat_percentage?.toFixed(2) || '-'}%
          </p>
          {comparison.fat_percentage_change !== undefined && (
            <p className="text-sm mt-1">
              {formatChange(comparison.fat_percentage_change, '%')} desde última avaliação
            </p>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">% Massa Magra</h3>
          <p className="text-2xl font-bold text-gray-900">
            {keyMetrics.lean_mass_percentage?.toFixed(2) || '-'}%
          </p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Metabolismo Basal</h3>
          <p className="text-xl font-bold text-gray-900">
            {keyMetrics.basal_metabolism?.toFixed(0) || '-'} kcal
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Idade Corporal</h3>
          <p className="text-xl font-bold text-gray-900">
            {keyMetrics.body_age?.toFixed(1) || '-'} anos
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Gordura Visceral</h3>
          <p className="text-xl font-bold text-gray-900">
            {keyMetrics.visceral_fat?.toFixed(1) || '-'}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Frequência Cardíaca</h3>
          <p className="text-xl font-bold text-gray-900">
            {evaluation.heart_rate_rest?.toFixed(0) || '-'} bpm
          </p>
        </div>
      </div>

      {/* Health Conditions */}
      {(healthConditions.cardiopathy || healthConditions.hypertension || healthConditions.diabetes) && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Condições de Saúde</h3>
          <div className="space-y-2">
            {healthConditions.cardiopathy && (
              <div className="flex items-start">
                <span className="text-red-600 font-medium mr-2">•</span>
                <div>
                  <span className="font-medium">Cardiopatia</span>
                  {evaluation.cardiopathy_notes && (
                    <p className="text-sm text-gray-600 mt-1">{evaluation.cardiopathy_notes}</p>
                  )}
                </div>
              </div>
            )}
            {healthConditions.hypertension && (
              <div className="flex items-start">
                <span className="text-red-600 font-medium mr-2">•</span>
                <div>
                  <span className="font-medium">Hipertensão</span>
                  {evaluation.hypertension_notes && (
                    <p className="text-sm text-gray-600 mt-1">{evaluation.hypertension_notes}</p>
                  )}
                </div>
              </div>
            )}
            {healthConditions.diabetes && (
              <div className="flex items-start">
                <span className="text-red-600 font-medium mr-2">•</span>
                <div>
                  <span className="font-medium">Diabetes</span>
                  {evaluation.diabetes_notes && (
                    <p className="text-sm text-gray-600 mt-1">{evaluation.diabetes_notes}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flexibility Tests */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Testes de Flexibilidade</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Teste de Sentar e Alcançar</span>
            <p className="text-lg font-semibold">{evaluation.wells_sit_reach_test?.toFixed(1) || '-'} cm</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Teste de Flexão do Tronco</span>
            <p className="text-lg font-semibold">{evaluation.trunk_flexion_test?.toFixed(1) || '-'} cm</p>
          </div>
        </div>
      </div>

      {/* Skinfold Measurements */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dobras Cutâneas (mm)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div>
            <span className="text-sm text-gray-500">Tríceps</span>
            <p className="text-lg font-semibold">{evaluation.skinfold_triceps?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Subescapular</span>
            <p className="text-lg font-semibold">{evaluation.skinfold_subscapular?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Subaxilar</span>
            <p className="text-lg font-semibold">{evaluation.skinfold_subaxillary?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Suprailíaca</span>
            <p className="text-lg font-semibold">{evaluation.skinfold_suprailiac?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Abdominal</span>
            <p className="text-lg font-semibold">{evaluation.skinfold_abdominal?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Quadríceps</span>
            <p className="text-lg font-semibold">{evaluation.skinfold_quadriceps?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Panturrilha</span>
            <p className="text-lg font-semibold">{evaluation.skinfold_calf?.toFixed(1) || '-'}</p>
          </div>
        </div>
      </div>

      {/* Perimeter Measurements */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Perímetros (cm)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-500">Tórax</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_chest?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Braço Direito</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_arm_r?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Braço Esquerdo</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_arm_l?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Braço Contratado D</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_arm_contracted_r?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Braço Contratado E</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_arm_contracted_l?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Antebraço Direito</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_forearm_r?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Antebraço Esquerdo</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_forearm_l?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Cintura</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_waist?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Abdominal</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_abdominal?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Quadril</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_hip?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Coxa Direita</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_thigh_r?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Coxa Esquerda</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_thigh_l?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Perna Direita</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_leg_r?.toFixed(1) || '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Perna Esquerda</span>
            <p className="text-lg font-semibold">{evaluation.perimeter_leg_l?.toFixed(1) || '-'}</p>
          </div>
        </div>
      </div>

      {/* Advanced Charts */}
      <AdvancedEvaluationCharts evaluation={evaluation} />

      {/* Notes */}
      {evaluation.notes && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{evaluation.notes}</p>
        </div>
      )}

      {/* Summary Info */}
      <div className="card bg-gray-50">
        <div className="text-sm text-gray-600">
          <p>Avaliação #{summary.evaluation_number || '-'} de {summary.total_evaluations || '-'} total</p>
          {comparison.trend && (
            <p className="mt-2">
              Tendência: <span className="font-medium capitalize">
                {comparison.trend === 'improving' ? 'Melhorando' : 
                 comparison.trend === 'maintaining' ? 'Mantendo' : 
                 'Precisa de atenção'}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

