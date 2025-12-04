import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import api from '../api';
import FinanceForm from '../components/FinanceForm';
import Loading from '../components/Loading';
import { formatCurrency, formatDateTime, exportToCSV, exportToJSON } from '../utils/formatters';
import { toast } from 'react-toastify';

export default function Finance() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: financeData,
    loading,
    error,
    refetch,
  } = useFetch(() => api.finance.list(selectedDate), [selectedDate, refreshKey]);

  // Load finance data automatically when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey((prev) => prev + 1);
    refetch();
  };

  const handleExportCSV = () => {
    if (!financeData?.entries || financeData.entries.length === 0) {
      toast.warning('Não há dados para exportar');
      return;
    }

    const csvData = financeData.entries.map((entry) => ({
      Data: formatDateTime(entry.date_time),
      Tipo: entry.type === 'income' ? 'Entrada' : 'Saída',
      Valor: entry.amount,
      Categoria: entry.category || '-',
      Descrição: entry.description || '-',
    }));

    exportToCSV(csvData, `financeiro_${selectedDate}.csv`);
    toast.success('Arquivo CSV exportado com sucesso!');
  };

  const handleExportJSON = () => {
    if (!financeData?.entries || financeData.entries.length === 0) {
      toast.warning('Não há dados para exportar');
      return;
    }

    exportToJSON(financeData, `financeiro_${selectedDate}.json`);
    toast.success('Arquivo JSON exportado com sucesso!');
  };

  const handleExportExcel = async () => {
    if (!financeData?.entries || financeData.entries.length === 0) {
      toast.warning('Não há dados para exportar');
      return;
    }

    try {
      await api.finance.exportExcel(selectedDate);
      toast.success('Arquivo Excel exportado com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Erro ao exportar Excel');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Caixa / Financeiro</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn-primary w-full sm:w-auto"
        >
          {showForm ? 'Cancelar' : 'Novo Lançamento'}
        </button>
      </div>

      <div className="mb-6">
        <label htmlFor="date" className="label">
          Data:
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Registrar Lançamento</h2>
          <FinanceForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading && <Loading message="Carregando dados financeiros..." />}

      {!loading && financeData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Total Receitas
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(financeData.total_income || 0)}
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Total Despesas
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(financeData.total_expense || 0)}
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Saldo do Dia
              </h3>
              <p
                className={`text-3xl font-bold ${
                  financeData.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(financeData.balance || 0)}
              </p>
            </div>
          </div>

          {/* Entries Table */}
          <div className="card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Lançamentos do Dia</h2>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleExportExcel} 
                  className="btn-outline text-sm flex-1 sm:flex-none"
                >
                  Excel
                </button>
                <button 
                  onClick={handleExportCSV} 
                  className="btn-outline text-sm flex-1 sm:flex-none"
                >
                  CSV
                </button>
                <button 
                  onClick={handleExportJSON} 
                  className="btn-outline text-sm flex-1 sm:flex-none"
                >
                  JSON
                </button>
              </div>
            </div>

            {financeData.entries && financeData.entries.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data/Hora
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>
                          <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descrição
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {financeData.entries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {formatDateTime(entry.date_time).split(' ')[0]}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  {formatDateTime(entry.date_time).split(' ')[1]}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  entry.type === 'income'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {entry.type === 'income' ? 'Entrada' : 'Saída'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                              {formatCurrency(entry.amount)}
                            </td>
                            <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {entry.category || '-'}
                            </td>
                            <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-500">
                              <div className="max-w-xs truncate" title={entry.description || '-'}>
                                {entry.description || '-'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum lançamento registrado para esta data.
              </p>
            )}
          </div>
        </>
      )}

      {error && (
        <div className="card text-center py-8">
          <p className="text-red-600">Erro ao carregar dados financeiros</p>
        </div>
      )}
    </div>
  );
}

