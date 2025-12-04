import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import api from '../api';
import Loading from '../components/Loading';
import { formatDate, formatPhone } from '../utils/formatters';
import { toast } from 'react-toastify';

export default function StudentDetail() {
  const { id } = useParams();
  const {
    data: student,
    loading: studentLoading,
    error: studentError,
  } = useFetch(() => api.students.getById(id), [id]);

  const {
    data: evaluations,
    loading: evaluationsLoading,
  } = useFetch(() => api.evaluations.listByStudent(id), [id]);

  if (studentLoading) {
    return <Loading message="Carregando dados do aluno..." />;
  }

  if (studentError || !student) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados do aluno</p>
          <Link to="/students" className="btn-primary">
            Voltar para lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <Link
          to="/students"
          className="text-primary hover:text-primary-dark mb-3 sm:mb-4 inline-block text-sm sm:text-base"
        >
          ← Voltar para lista
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          {student.name}
        </h1>
      </div>

      {/* Student Info */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Data de Nascimento</p>
            <p className="text-lg font-medium">
              {formatDate(student.birthdate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Telefone</p>
            <p className="text-lg font-medium">{formatPhone(student.phone)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cadastrado em</p>
            <p className="text-lg font-medium">
              {formatDate(student.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Ações Rápidas</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:space-x-0">
          <Link
            to={`/evaluations?studentId=${id}`}
            className="btn-primary text-center"
          >
            Nova Avaliação
          </Link>
          <Link to="/classes" className="btn-outline text-center">
            Marcar Presença
          </Link>
        </div>
      </div>

      {/* Recent Evaluations */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Últimas Avaliações</h2>
        {evaluationsLoading ? (
          <Loading message="Carregando avaliações..." />
        ) : evaluations && evaluations.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Peso (kg)
                      </th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Altura (m)
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IMC
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {evaluations.slice(0, 5).map((evaluation) => (
                      <tr key={evaluation.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                          {formatDate(evaluation.date)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                          {evaluation.weight_kg} kg
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm">
                          {evaluation.height_m ? `${evaluation.height_m} m` : '-'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          {evaluation.imc ? evaluation.imc.toFixed(2) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Nenhuma avaliação registrada ainda.</p>
        )}
      </div>
    </div>
  );
}

