import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import api from '../api';
import ClassForm from '../components/ClassForm';
import AttendanceModal from '../components/AttendanceModal';
import ClassEnrollmentModal from '../components/ClassEnrollmentModal';
import Loading from '../components/Loading';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

export default function Classes() {
  const { classes, loadClasses, loading } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedClassName, setSelectedClassName] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filteredClasses, setFilteredClasses] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);

  // Load all classes when component mounts - always reload to ensure fresh data
  useEffect(() => {
    const loadInitialData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Always reload classes when entering the page to ensure fresh data
          await loadClasses();
        } catch (error) {
          console.error('Error loading classes:', error);
          toast.error('Erro ao carregar aulas');
        }
      }
    };
    
    // Load immediately when component mounts
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - we want to always reload when entering the page

  // Load filtered classes when filter dates change
  useEffect(() => {
    const loadFilteredClasses = async () => {
      if (filterFromDate || filterToDate) {
        setFilterLoading(true);
        try {
          // Use the API wrapper
          const data = await api.classes.list(filterFromDate, filterToDate);
          setFilteredClasses(data);
        } catch (error) {
          console.error('Error loading filtered classes:', error);
          toast.error(error.message || 'Erro ao filtrar aulas');
          setFilteredClasses([]);
        } finally {
          setFilterLoading(false);
        }
      } else {
        // Clear filter when dates are cleared
        setFilteredClasses(null);
      }
    };
    
    loadFilteredClasses();
  }, [filterFromDate, filterToDate]);

  // Sort classes by date and time
  const sortedClasses = useMemo(() => {
    const classesToSort = filteredClasses !== null ? filteredClasses : (classes || []);
    if (classesToSort.length === 0) return [];
    return [...classesToSort].sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeA.localeCompare(timeB);
    });
  }, [classes, filteredClasses]);

  const handleExportExcel = async () => {
    if (!exportFromDate || !exportToDate) {
      toast.error('Por favor, selecione o período (data inicial e final)');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const url = `${API_BASE_URL}/classes/export/xlsx?from_date=${exportFromDate}&to_date=${exportToDate}`;
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Erro ao exportar relatório' }));
        throw new Error(errorData.detail || 'Erro ao exportar relatório');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `aulas_presenca_${exportFromDate}_a_${exportToDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Relatório exportado com sucesso!');
      setShowExportModal(false);
      setExportFromDate('');
      setExportToDate('');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error(error.message || 'Erro ao exportar relatório');
    }
  };

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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowExportModal(true)}
            className="btn-outline w-full sm:w-auto"
          >
            📊 Exportar Excel
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary w-full sm:w-auto"
          >
            {showForm ? 'Cancelar' : 'Nova Aula'}
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtrar por Período</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="filter-from-date" className="label">
              Data Inicial
            </label>
            <input
              type="date"
              id="filter-from-date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="filter-to-date" className="label">
              Data Final
            </label>
            <input
              type="date"
              id="filter-to-date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={async () => {
                setFilterFromDate('');
                setFilterToDate('');
                // Reload all classes when clearing filter
                try {
                  await loadClasses();
                } catch (error) {
                  console.error('Error reloading classes:', error);
                }
              }}
              className="btn-outline w-full"
              disabled={!filterFromDate && !filterToDate}
            >
              Limpar Filtro
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Criar Nova Aula</h2>
          <ClassForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading || filterLoading ? (
        <div className="card text-center py-12">
          <Loading />
        </div>
      ) : sortedClasses.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">
            {filterFromDate || filterToDate 
              ? 'Nenhuma aula encontrada no período selecionado.' 
              : 'Nenhuma aula cadastrada ainda.'}
          </p>
          <p className="text-sm text-gray-500">
            {filterFromDate || filterToDate 
              ? 'Tente ajustar o filtro de datas ou clique em "Limpar Filtro".'
              : 'Clique em "Nova Aula" para começar.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sortedClasses.map((classItem) => (
            <div key={classItem.id} className="card">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {classItem.name}
              </h3>
              <div className="mb-3 space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  📅 {formatDate(classItem.date)} às {classItem.time}
                </p>
                {classItem.description && (
                  <p className="text-sm text-gray-600 break-words">
                    {classItem.description}
                  </p>
                )}
              </div>
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Exportar Relatório Excel</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="export-from-date" className="label">
                  Data Inicial <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="export-from-date"
                  value={exportFromDate}
                  onChange={(e) => setExportFromDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="export-to-date" className="label">
                  Data Final <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="export-to-date"
                  value={exportToDate}
                  onChange={(e) => setExportToDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleExportExcel}
                  className="btn-primary flex-1"
                  disabled={!exportFromDate || !exportToDate}
                >
                  Exportar
                </button>
                <button
                  onClick={() => {
                    setShowExportModal(false);
                    setExportFromDate('');
                    setExportToDate('');
                  }}
                  className="btn-outline flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
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

