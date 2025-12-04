import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useFetch } from '../hooks/useFetch';
import api from '../api';
import EvalForm from '../components/EvalForm';
import EvalChart from '../components/EvalChart';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';

export default function Evaluations() {
  const { students } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedStudentId = searchParams.get('studentId') || '';

  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    if (studentId) {
      setSearchParams({ studentId });
      setShowForm(false);
    } else {
      setSearchParams({});
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
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Gráfico de Evolução</h2>
          {chartLoading ? (
            <Loading message="Carregando gráfico..." />
          ) : (
            <EvalChart chartData={chartData} />
          )}
        </div>
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

