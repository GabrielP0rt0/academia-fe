import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import { useApp } from '../context/AppContext';
import Loading from './Loading';

export default function ClassEnrollmentModal({ classId, className, onClose, onSuccess }) {
  const { students, loadStudents } = useApp();
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    if (classId) {
      loadEnrolledStudents();
      if (!students || students.length === 0) {
        loadStudents();
      }
    }
  }, [classId]);

  const loadEnrolledStudents = async () => {
    try {
      setLoadingEnrolled(true);
      const data = await api.enrollments.getByClass(classId);
      setEnrolledStudents(data);
    } catch (error) {
      console.error('Error loading enrolled students:', error);
      toast.error('Erro ao carregar alunos matriculados');
    } finally {
      setLoadingEnrolled(false);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) {
      toast.warning('Selecione um aluno');
      return;
    }

    // Check if already enrolled
    const isEnrolled = enrolledStudents.some(
      (enrollment) => enrollment.student_id === selectedStudentId
    );

    if (isEnrolled) {
      toast.warning('Aluno já está matriculado nesta aula');
      return;
    }

    try {
      setLoading(true);
      await api.enrollments.create({
        student_id: selectedStudentId,
        class_id: classId,
      });
      toast.success('Aluno adicionado à aula com sucesso!');
      setSelectedStudentId('');
      await loadEnrolledStudents();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Erro ao adicionar aluno');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (enrollmentId, studentName) => {
    if (!window.confirm(`Deseja remover ${studentName} desta aula?`)) {
      return;
    }

    try {
      setLoading(true);
      await api.enrollments.remove(enrollmentId);
      toast.success('Aluno removido da aula com sucesso!');
      await loadEnrolledStudents();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Erro ao remover aluno');
    } finally {
      setLoading(false);
    }
  };

  // Get student names for enrolled students
  const getStudentName = (studentId) => {
    return students?.find((s) => s.id === studentId)?.name || 'Aluno desconhecido';
  };

  // Filter out already enrolled students
  const availableStudents = students?.filter(
    (student) =>
      !enrolledStudents.some((enrollment) => enrollment.student_id === student.id)
  ) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Gerenciar Alunos
              </h2>
              <p className="text-sm text-gray-500 mt-1">{className}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Add Student Section */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Adicionar Aluno à Aula</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="input-field flex-1"
                disabled={loading || availableStudents.length === 0}
              >
                <option value="">
                  {availableStudents.length === 0
                    ? 'Todos os alunos já estão matriculados'
                    : 'Selecione um aluno'}
                </option>
                {availableStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddStudent}
                disabled={loading || !selectedStudentId || availableStudents.length === 0}
                className="btn-primary whitespace-nowrap"
              >
                {loading ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>

          {/* Enrolled Students List */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Alunos Matriculados ({enrolledStudents.length})
            </h3>
            {loadingEnrolled ? (
              <Loading message="Carregando alunos..." />
            ) : enrolledStudents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum aluno matriculado nesta aula ainda.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded p-3">
                {enrolledStudents.map((enrollment) => {
                  const studentName = getStudentName(enrollment.student_id);
                  return (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {studentName}
                      </span>
                      <button
                        onClick={() =>
                          handleRemoveStudent(enrollment.id, studentName)
                        }
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        Remover
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="btn-outline">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

