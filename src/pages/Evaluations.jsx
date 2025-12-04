import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useFetch } from '../hooks/useFetch';
import api from '../api';
import EvalForm from '../components/EvalForm';
import EvalChart from '../components/EvalChart';
import AdvancedEvaluationCharts from '../components/AdvancedEvaluationCharts';
import EvaluationReport from '../components/EvaluationReport';
import Loading from '../components/Loading';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

export default function Evaluations() {
  const { students } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedStudentId = searchParams.get('studentId') || '';

  const [showForm, setShowForm] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedEvaluationForCharts, setSelectedEvaluationForCharts] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: evaluationsList,
    loading: evaluationsLoading,
    refetch: refetchEvaluations,
  } = useFetch(
    () => {
      if (!selectedStudentId) return Promise.resolve(null);
      return api.evaluations.listByStudent(selectedStudentId);
    },
    [selectedStudentId, refreshKey]
  );

  const {
    data: chartData,
    loading: chartLoading,
    refetch: refetchChart,
  } = useFetch(
    () => {
      if (!selectedStudentId) return Promise.resolve(null);
      return api.evaluations.chartData(selectedStudentId);
    },
    [selectedStudentId, refreshKey]
  );

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey((prev) => prev + 1);
    refetchChart();
    refetchEvaluations();
  };

  // Set the latest evaluation for advanced charts when evaluations list loads
  useEffect(() => {
    if (evaluationsList && evaluationsList.length > 0 && !selectedEvaluationForCharts) {
      // Sort by date descending and get the latest
      const sorted = [...evaluationsList].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setSelectedEvaluationForCharts(sorted[0]);
    }
  }, [evaluationsList, selectedEvaluationForCharts]);

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    if (studentId) {
      setSearchParams({ studentId });
      setShowForm(false);
      setSelectedEvaluationForCharts(null); // Reset when student changes
    } else {
      setSearchParams({});
      setSelectedEvaluationForCharts(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Avaliações</h1>

        <div className="mb-3 sm:mb-4">
          <label htmlFor="student-select" className="label">
            Selecione o Aluno
          </label>
          <select
            id="student-select"
            value={selectedStudentId}
            onChange={handleStudentChange}
            className="input-field max-w-full sm:max-w-md"
          >
            <option value="">-- Selecione um aluno --</option>
            {students?.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        {selectedStudentId && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary mb-4 w-full sm:w-auto"
          >
            {showForm ? 'Cancelar' : 'Nova Avaliação'}
          </button>
        )}
      </div>

      {showForm && selectedStudentId && (
        <div className="card mb-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
            Registrar Nova Avaliação
          </h2>
          <EvalForm
            studentId={selectedStudentId}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {selectedStudentId ? (
        <>
          {/* Evaluations List */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Histórico de Avaliações</h2>
            {evaluationsLoading ? (
              <Loading message="Carregando avaliações..." />
            ) : evaluationsList && evaluationsList.length > 0 ? (
              <div className="space-y-3">
                {evaluationsList.map((evalItem) => (
                  <div
                    key={evalItem.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Avaliação de {formatDate(evalItem.date)}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>Peso: <strong>{evalItem.weight_kg?.toFixed(2)} kg</strong></span>
                          <span>Altura: <strong>{evalItem.height_m?.toFixed(2)} m</strong></span>
                          <span>IMC: <strong>{evalItem.imc?.toFixed(2)}</strong></span>
                          {evalItem.fat_percentage && (
                            <span>% Gordura: <strong>{evalItem.fat_percentage.toFixed(2)}%</strong></span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedReportId(evalItem.id)}
                        className="btn-outline text-sm"
                      >
                        Ver Relatório Completo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhuma avaliação registrada ainda.
              </p>
            )}
          </div>

          {/* Evolution Chart */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Gráfico de Evolução</h2>
            {chartLoading ? (
              <Loading message="Carregando gráfico..." />
            ) : (
              <EvalChart chartData={chartData} />
            )}
          </div>

          {/* Advanced Charts - Show for latest evaluation */}
          {selectedEvaluationForCharts && evaluationsList && evaluationsList.length > 0 && (
            <div className="card mb-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Análises Avançadas</h2>
                <p className="text-sm text-gray-600">
                  Gráficos da avaliação de {formatDate(selectedEvaluationForCharts.date)}
                </p>
                {evaluationsList.length > 1 && (
                  <div className="mt-3">
                    <label htmlFor="eval-select-charts" className="label text-sm">
                      Selecionar outra avaliação para visualizar gráficos:
                    </label>
                    <select
                      id="eval-select-charts"
                      value={selectedEvaluationForCharts.id}
                      onChange={(e) => {
                        const selected = evaluationsList.find(ev => ev.id === e.target.value);
                        if (selected) setSelectedEvaluationForCharts(selected);
                      }}
                      className="input-field mt-1 max-w-md"
                    >
                      {evaluationsList.map((evalItem) => (
                        <option key={evalItem.id} value={evalItem.id}>
                          {formatDate(evalItem.date)} - {evalItem.weight_kg?.toFixed(2)}kg
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <AdvancedEvaluationCharts evaluation={selectedEvaluationForCharts} />
            </div>
          )}

          {/* Report Modal */}
          {selectedReportId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
              <div className="min-h-screen px-4 py-8">
                <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-xl p-6">
                  <EvaluationReport
                    evaluationId={selectedReportId}
                    onClose={() => setSelectedReportId(null)}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600">
            Selecione um aluno para visualizar ou registrar avaliações.
          </p>
        </div>
      )}
    </div>
  );
}

