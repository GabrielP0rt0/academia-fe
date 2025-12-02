import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../api';

export default function FinanceForm({ onSuccess, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      type: 'income',
      date_time: new Date().toISOString().slice(0, 16),
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        date_time: data.date_time ? new Date(data.date_time).toISOString() : undefined,
      };

      await api.finance.create(payload);
      toast.success('Lançamento registrado com sucesso!');
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Erro ao registrar lançamento');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="type" className="label">
          Tipo <span className="text-red-500">*</span>
        </label>
        <select
          {...register('type', { required: 'Tipo é obrigatório' })}
          id="type"
          className="input-field"
        >
          <option value="income">Entrada (Receita)</option>
          <option value="expense">Saída (Despesa)</option>
        </select>
        {errors.type && <p className="error-text">{errors.type.message}</p>}
      </div>

      <div>
        <label htmlFor="amount" className="label">
          Valor (R$) <span className="text-red-500">*</span>
        </label>
        <input
          {...register('amount', {
            required: 'Valor é obrigatório',
            min: { value: 0.01, message: 'Valor deve ser maior que zero' },
          })}
          type="number"
          step="0.01"
          id="amount"
          className="input-field"
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="error-text">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="label">
          Categoria
        </label>
        <input
          {...register('category')}
          type="text"
          id="category"
          className="input-field"
          placeholder="Ex: Mensalidade, Material, Salário"
        />
      </div>

      <div>
        <label htmlFor="description" className="label">
          Descrição
        </label>
        <textarea
          {...register('description')}
          id="description"
          className="input-field"
          rows="3"
          placeholder="Descrição do lançamento..."
        />
      </div>

      <div>
        <label htmlFor="date_time" className="label">
          Data e Hora
        </label>
        <input
          {...register('date_time')}
          type="datetime-local"
          id="date_time"
          className="input-field"
        />
      </div>

      <div className="flex space-x-4 pt-4">
        <button type="submit" className="btn-primary flex-1">
          Salvar Lançamento
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline flex-1"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

