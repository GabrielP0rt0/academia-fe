import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useFetch } from '../hooks/useFetch';
import api from '../api';
import ClassForm from '../components/ClassForm';
import AttendanceModal from '../components/AttendanceModal';
import Loading from '../components/Loading';
import { formatDate } from '../utils/formatters';

export default function Classes() {
  const { classes, loadClasses } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    loadClasses();
  };

  const handleOpenAttendance = (classId) => {
    setSelectedClassId(classId);
    setShowAttendanceModal(true);
  };

  const handleAttendanceSuccess = () => {
    setShowAttendanceModal(false);
    setSelectedClassId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Aulas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div key={classItem.id} className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {classItem.name}
              </h3>
              {classItem.description && (
                <p className="text-gray-600 mb-4">{classItem.description}</p>
              )}
              <p className="text-sm text-gray-500 mb-4">
                Criada em: {formatDate(classItem.created_at)}
              </p>
              <button
                onClick={() => handleOpenAttendance(classItem.id)}
                className="btn-primary w-full"
              >
                Abrir Chamada
              </button>
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
    </div>
  );
}

