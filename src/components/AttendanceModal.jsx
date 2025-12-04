import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import { formatDateTime } from '../utils/formatters';
import Loading from './Loading';

export default function AttendanceModal({ classId, onClose, onSuccess }) {
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (classId) {
      loadEnrolledStudents();
      loadAttendanceHistory();
    }
  }, [classId]);

  const loadEnrolledStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await api.attendance.getStudentsForAttendance(classId);
      setEnrolledStudents(data);
    } catch (error) {
      console.error('Error loading enrolled students:', error);
      toast.error('Erro ao carregar alunos matriculados');
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadAttendanceHistory = async () => {
    try {
      setLoadingHistory(true);
      const today = new Date().toISOString().split('T')[0];
      const data = await api.attendance.getByClass(classId, today, today);
      setAttendanceHistory(data);
    } catch (error) {
      console.error('Error loading attendance history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const presentStudentIds = Object.keys(selectedStudents).filter(
      (id) => selectedStudents[id]
    );

    if (presentStudentIds.length === 0) {
      toast.warning('Selecione pelo menos um aluno');
      return;
    }

    try {
      setLoading(true);
      const entries = presentStudentIds.map((studentId) => ({
        class_id: classId,
        student_id: studentId,
        status: 'present',
      }));

      await api.attendance.createBulk(entries);
      toast.success('Presença registrada com sucesso!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Erro ao registrar presença');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Registrar Presença
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                Marcar alunos presentes:
              </h3>
              {loadingStudents ? (
                <Loading message="Carregando alunos..." />
              ) : (
                <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto border border-gray-200 rounded p-3 sm:p-4">
                  {enrolledStudents && enrolledStudents.length > 0 ? (
                    enrolledStudents.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center space-x-2 sm:space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents[student.id] || false}
                          onChange={() => handleToggleStudent(student.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-gray-900 break-words">
                          {student.name}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Nenhum aluno matriculado nesta aula
                    </p>
                  )}
                </div>
              )}
            </div>

            {loadingHistory ? (
              <Loading message="Carregando histórico..." />
            ) : attendanceHistory.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                  Presenças registradas hoje:
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {attendanceHistory.map((attendance) => {
                    const student = enrolledStudents?.find(
                      (s) => s.id === attendance.student_id
                    );
                    return (
                      <div
                        key={attendance.id}
                        className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 rounded break-words"
                      >
                        <span className="font-medium">
                          {student?.name || 'Aluno desconhecido'}
                        </span>
                        {' - '}
                        <span className="text-gray-500">
                          {formatDateTime(attendance.date_time)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:space-x-0">
              <button
                type="submit"
                disabled={loading || loadingStudents}
                className="btn-primary flex-1 order-2 sm:order-1"
              >
                {loading ? 'Salvando...' : 'Salvar Presença'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-outline flex-1 order-1 sm:order-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

