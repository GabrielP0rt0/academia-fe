import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useFetch } from '../hooks/useFetch';
import api from '../api';
import EvaluationReport from '../components/EvaluationReport';
import Loading from '../components/Loading';
import { formatDate } from '../utils/formatters';

export default function EvaluationReportPage() {
  const { students, loadStudents } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedEvaluationId, setSelectedEvaluationId] = useState('');

  // Load students if not loaded
  useEffect(() => {
    if (!students || students.length === 0) {
      loadStudents();
    }
  }, [students, loadStudents]);

  // Fetch evaluations for selected student
  const {
    data: evaluationsList,
    loading: evaluationsLoading,
  } = useFetch(
    () => {
      if (!selectedStudentId) return Promise.resolve(null);
      return api.evaluations.listByStudent(selectedStudentId);
    },
    [selectedStudentId]
  );

  // Auto-select first evaluation when evaluations load
  useEffect(() => {
    if (evaluationsList && evaluationsList.length > 0 && !selectedEvaluationId) {
      // Sort by date descending and get the latest
      const sorted = [...evaluationsList].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setSelectedEvaluationId(sorted[0].id);
    }
  }, [evaluationsList, selectedEvaluationId]);

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId);
    setSelectedEvaluationId(''); // Reset evaluation when student changes
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Relatório Completo de Avaliação
        </h1>
        <p className="text-gray-600">
          Selecione um aluno e uma avaliação para visualizar o relatório completo com todos os gráficos e análises.
        </p>
      </div>

      {/* Selection Section */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="student-select-report" className="label">
              Selecione o Aluno
            </label>
            <select
              id="student-select-report"
              value={selectedStudentId}
              onChange={handleStudentChange}
              className="input-field w-full"
            >
              <option value="">-- Selecione um aluno --</option>
              {students?.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="evaluation-select-report" className="label">
              Selecione a Avaliação
            </label>
            {evaluationsLoading ? (
              <div className="input-field w-full">
                <Loading message="Carregando avaliações..." />
              </div>
            ) : (
              <select
                id="evaluation-select-report"
                value={selectedEvaluationId}
                onChange={(e) => setSelectedEvaluationId(e.target.value)}
                className="input-field w-full"
                disabled={!selectedStudentId || !evaluationsList || evaluationsList.length === 0}
              >
                <option value="">
                  {!selectedStudentId
                    ? 'Selecione um aluno primeiro'
                    : evaluationsList && evaluationsList.length === 0
                    ? 'Nenhuma avaliação encontrada'
                    : '-- Selecione uma avaliação --'}
                </option>
                {evaluationsList?.map((evalItem) => (
                  <option key={evalItem.id} value={evalItem.id}>
                    {formatDate(evalItem.date)} - {evalItem.weight_kg?.toFixed(2)}kg - IMC: {evalItem.imc?.toFixed(2)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Report Section */}
      {selectedEvaluationId ? (
        <div className="card">
          <EvaluationReport
            evaluationId={selectedEvaluationId}
            onClose={null}
          />
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600">
            {selectedStudentId
              ? 'Selecione uma avaliação para visualizar o relatório completo.'
              : 'Selecione um aluno e uma avaliação para visualizar o relatório completo.'}
          </p>
        </div>
      )}
    </div>
  );
}

