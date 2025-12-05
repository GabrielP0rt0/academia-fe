import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../api';
import { useApp } from '../context/AppContext';

export default function ClassForm({ onSuccess, onCancel }) {
  const { addClass } = useApp();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Today's date
      time: '17:00', // Default time 5 PM
    },
  });

  const onSubmit = async (data) => {
    try {
      const newClass = await api.classes.create(data);
      addClass(newClass);
      toast.success('Aula criada com sucesso!');
      reset({
        date: new Date().toISOString().split('T')[0],
        time: '17:00',
      });
      if (onSuccess) onSuccess(newClass);
    } catch (error) {
      toast.error(error.message || 'Erro ao criar aula');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="label">
          Nome da Aula <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name', {
            required: 'Nome é obrigatório',
            minLength: {
              value: 2,
              message: 'Nome deve ter no mínimo 2 caracteres',
            },
          })}
          type="text"
          id="name"
          className="input-field"
          placeholder="Ex: Pilates, Funcional, Musculação"
        />
        {errors.name && (
          <p className="error-text">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="label">
            Data <span className="text-red-500">*</span>
          </label>
          <input
            {...register('date', {
              required: 'Data é obrigatória',
            })}
            type="date"
            id="date"
            className="input-field"
          />
          {errors.date && (
            <p className="error-text">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="time" className="label">
            Hora <span className="text-red-500">*</span>
          </label>
          <input
            {...register('time', {
              required: 'Hora é obrigatória',
              pattern: {
                value: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
                message: 'Hora deve estar no formato HH:MM',
              },
            })}
            type="time"
            id="time"
            className="input-field"
          />
          {errors.time && (
            <p className="error-text">{errors.time.message}</p>
          )}
        </div>
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
          placeholder="Descrição da aula (opcional)..."
        />
      </div>

      <div className="flex space-x-4 pt-4">
        <button type="submit" className="btn-primary flex-1">
          Criar Aula
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

