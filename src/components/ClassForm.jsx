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
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const newClass = await api.classes.create(data);
      addClass(newClass);
      toast.success('Aula criada com sucesso!');
      reset();
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
          placeholder="Ex: Funcional, Pilates, Musculação"
        />
        {errors.name && (
          <p className="error-text">{errors.name.message}</p>
        )}
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
          placeholder="Descrição da aula..."
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

