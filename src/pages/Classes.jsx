import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useFetch } from '../hooks/useFetch';
import api from '../api';
import ClassForm from '../components/ClassForm';
import AttendanceModal from '../components/AttendanceModal';
import ClassEnrollmentModal from '../components/ClassEnrollmentModal';
import Loading from '../components/Loading';
import { formatDate } from '../utils/formatters';

export default function Classes() {
  const { classes, loadClasses } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedClassName, setSelectedClassName] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load classes automatically when component mounts (only once)
  useEffect(() => {
    if (!hasLoaded) {
      loadClasses();
      setHasLoaded(true);
    }
  }, [loadClasses, hasLoaded]);

  const handleSuccess = () => {
    setShowForm(false);
    loadClasses();
  };

  const handleOpenAttendance = (classId) => {
    setSelectedClassId(classId);
    setShowAttendanceModal(true);
  };

  const handleOpenEnrollment = (classId, className) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setShowEnrollmentModal(true);
  };

  const handleAttendanceSuccess = () => {
    setShowAttendanceModal(false);
    setSelectedClassId(null);
  };

  const handleEnrollmentSuccess = () => {
    // Enrollment modal handles its own state
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Aulas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary w-full sm:w-auto"
        >
          {showForm ? 'Cancelar' : 'Nova Aula'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Criar Nova Aula</h2>
          <ClassForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {!classes || classes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">Nenhuma aula cadastrada ainda.</p>
          <p className="text-sm text-gray-500">
            Clique em "Nova Aula" para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {classes.map((classItem) => (
            <div key={classItem.id} className="card">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {classItem.name}
              </h3>
              {classItem.description && (
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 break-words">
                  {classItem.description}
                </p>
              )}
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                Criada em: {formatDate(classItem.created_at)}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleOpenEnrollment(classItem.id, classItem.name)}
                  className="btn-outline w-full text-sm sm:text-base"
                >
                  Gerenciar Alunos
                </button>
                <button
                  onClick={() => handleOpenAttendance(classItem.id)}
                  className="btn-primary w-full text-sm sm:text-base"
                >
                  Abrir Chamada
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAttendanceModal && selectedClassId && (
        <AttendanceModal
          classId={selectedClassId}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedClassId(null);
          }}
          onSuccess={handleAttendanceSuccess}
        />
      )}

      {showEnrollmentModal && selectedClassId && selectedClassName && (
        <ClassEnrollmentModal
          classId={selectedClassId}
          className={selectedClassName}
          onClose={() => {
            setShowEnrollmentModal(false);
            setSelectedClassId(null);
            setSelectedClassName(null);
          }}
          onSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  );
}

