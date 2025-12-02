import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../api';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/formatters';
import Loading from './Loading';

export default function AttendanceModal({ classId, onClose, onSuccess }) {
  const { students } = useApp();
  const [selectedStudents, setSelectedStudents] = useState({});
  const [loading, setLoading] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (classId) {
      loadAttendanceHistory();
    }
  }, [classId]);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Registrar Presença
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Marcar alunos presentes:
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded p-4">
                {students && students.length > 0 ? (
                  students.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents[student.id] || false}
                        onChange={() => handleToggleStudent(student.id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {student.name}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    Nenhum aluno cadastrado
                  </p>
                )}
              </div>
            </div>

            {loadingHistory ? (
              <Loading message="Carregando histórico..." />
            ) : attendanceHistory.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Presenças registradas hoje:
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {attendanceHistory.map((attendance) => {
                    const student = students?.find(
                      (s) => s.id === attendance.student_id
                    );
                    return (
                      <div
                        key={attendance.id}
                        className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                      >
                        {student?.name || 'Aluno desconhecido'} -{' '}
                        {formatDateTime(attendance.date_time)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Salvando...' : 'Salvar Presença'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-outline flex-1"
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

