import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import api from '../api';
import Loading from '../components/Loading';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
  } = useFetch(() => api.dashboard.summary(selectedDate), [selectedDate]);

  const {
    data: financeData,
    loading: financeLoading,
    error: financeError,
  } = useFetch(() => api.finance.list(selectedDate), [selectedDate]);

  useEffect(() => {
    if (summaryError || financeError) {
      toast.error('Erro ao carregar dados do dashboard');
    }
  }, [summaryError, financeError]);

  const balance =
    financeData?.balance !== undefined
      ? financeData.balance
      : (summary?.total_income_today || 0) - (summary?.total_expense_today || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <div className="mt-4">
          <label htmlFor="date" className="label">
            Data:
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field max-w-full sm:max-w-xs"
          />
        </div>
      </div>

      {(summaryLoading || financeLoading) && <Loading />}

      {!summaryLoading && !financeLoading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="card">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                Alunos Ativos
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {summary?.active_students || 0}
              </p>
            </div>

            <div className="card">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                Aulas Hoje
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {summary?.today_classes || 0}
              </p>
            </div>

            <div className="card">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                Receitas Hoje
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {formatCurrency(summary?.total_income_today || 0)}
              </p>
            </div>

            <div className="card">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                Despesas Hoje
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">
                {formatCurrency(summary?.total_expense_today || 0)}
              </p>
            </div>
          </div>

          {/* Balance Card */}
          <div className="card mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Saldo do Dia
            </h3>
            <p
              className={`text-3xl sm:text-4xl font-bold ${
                balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Link
                to="/students"
                className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors text-center"
              >
                <p className="font-medium text-gray-900 text-sm sm:text-base">Cadastrar Aluno</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Adicionar novo aluno ao sistema
                </p>
              </Link>

              <Link
                to="/evaluations"
                className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors text-center"
              >
                <p className="font-medium text-gray-900 text-sm sm:text-base">Registrar Avaliação</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Criar nova avaliação física
                </p>
              </Link>

              <Link
                to="/finance"
                className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors text-center sm:col-span-2 lg:col-span-1"
              >
                <p className="font-medium text-gray-900 text-sm sm:text-base">Lançar Receita</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Registrar entrada financeira
                </p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

