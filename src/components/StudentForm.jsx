import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../api';
import { useApp } from '../context/AppContext';

export default function StudentForm({ onSuccess, onCancel }) {
  const { addStudent } = useApp();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const newStudent = await api.students.create(data);
      addStudent(newStudent);
      toast.success('Aluno cadastrado com sucesso!');
      reset();
      if (onSuccess) onSuccess(newStudent);
    } catch (error) {
      toast.error(error.message || 'Erro ao cadastrar aluno');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="label">
          Nome <span className="text-red-500">*</span>
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
          placeholder="Nome completo"
        />
        {errors.name && (
          <p className="error-text">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="birthdate" className="label">
          Data de Nascimento
        </label>
        <input
          {...register('birthdate')}
          type="date"
          id="birthdate"
          className="input-field"
        />
        {errors.birthdate && (
          <p className="error-text">{errors.birthdate.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="label">
          Telefone
        </label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          className="input-field"
          placeholder="(11) 99999-9999"
        />
        {errors.phone && (
          <p className="error-text">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex space-x-4 pt-4">
        <button type="submit" className="btn-primary flex-1">
          Salvar
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

