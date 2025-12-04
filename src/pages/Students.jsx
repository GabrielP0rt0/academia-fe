import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import StudentList from '../components/StudentList';
import StudentForm from '../components/StudentForm';
import Loading from '../components/Loading';

export default function Students() {
  const { students, loading, loadStudents } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load students automatically when component mounts (only once)
  useEffect(() => {
    if (!hasLoaded) {
      loadStudents();
      setHasLoaded(true);
    }
  }, [loadStudents, hasLoaded]);

  const handleSuccess = () => {
    setShowForm(false);
    loadStudents();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Alunos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary w-full sm:w-auto"
        >
          {showForm ? 'Cancelar' : 'Novo Aluno'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Cadastrar Novo Aluno</h2>
          <StudentForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading ? (
        <Loading message="Carregando alunos..." />
      ) : (
        <StudentList students={students} loading={loading} />
      )}
    </div>
  );
}

