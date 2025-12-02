import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../api';
import { calculateBMI } from '../utils/formatters';
import { useState, useEffect } from 'react';

export default function EvalForm({ studentId, onSuccess, onCancel }) {
  const [calculatedBMI, setCalculatedBMI] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      student_id: studentId,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const weight = watch('weight_kg');
  const height = watch('height_m');

  // Calculate BMI when weight or height changes
  useEffect(() => {
    if (weight && height) {
      const bmi = calculateBMI(parseFloat(weight), parseFloat(height));
      setCalculatedBMI(bmi);
    } else {
      setCalculatedBMI(null);
    }
  }, [weight, height]);

  const onSubmit = async (data) => {
    try {
      // Convert measurements object if provided
      const measurements = data.measurements
        ? JSON.parse(data.measurements)
        : null;

      const payload = {
        ...data,
        weight_kg: parseFloat(data.weight_kg),
        height_m: data.height_m ? parseFloat(data.height_m) : null,
        measurements,
      };

      await api.evaluations.create(payload);
      toast.success('Avaliação registrada com sucesso!');
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Erro ao registrar avaliação');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('student_id')} />

      <div>
        <label htmlFor="date" className="label">
          Data <span className="text-red-500">*</span>
        </label>
        <input
          {...register('date', { required: 'Data é obrigatória' })}
          type="date"
          id="date"
          className="input-field"
        />
        {errors.date && <p className="error-text">{errors.date.message}</p>}
      </div>

      <div>
        <label htmlFor="weight_kg" className="label">
          Peso (kg) <span className="text-red-500">*</span>
        </label>
        <input
          {...register('weight_kg', {
            required: 'Peso é obrigatório',
            min: { value: 0.1, message: 'Peso deve ser maior que zero' },
          })}
          type="number"
          step="0.1"
          id="weight_kg"
          className="input-field"
          placeholder="Ex: 75.5"
        />
        {errors.weight_kg && (
          <p className="error-text">{errors.weight_kg.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="height_m" className="label">
          Altura (m)
        </label>
        <input
          {...register('height_m', {
            min: { value: 0.1, message: 'Altura deve ser maior que zero' },
            max: { value: 3, message: 'Altura inválida' },
          })}
          type="number"
          step="0.01"
          id="height_m"
          className="input-field"
          placeholder="Ex: 1.75"
        />
        {errors.height_m && (
          <p className="error-text">{errors.height_m.message}</p>
        )}
        {calculatedBMI && (
          <p className="text-sm text-gray-600 mt-1">
            IMC calculado: <strong>{calculatedBMI}</strong>
          </p>
        )}
      </div>

      <div>
        <label htmlFor="measurements" className="label">
          Medidas (JSON opcional)
        </label>
        <textarea
          {...register('measurements')}
          id="measurements"
          className="input-field"
          rows="3"
          placeholder='Ex: {"waist_cm": 85, "hip_cm": 95}'
        />
        <p className="text-xs text-gray-500 mt-1">
          Formato JSON com as medidas em centímetros
        </p>
      </div>

      <div>
        <label htmlFor="notes" className="label">
          Observações
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          className="input-field"
          rows="3"
          placeholder="Observações sobre a avaliação..."
        />
      </div>

      <div className="flex space-x-4 pt-4">
        <button type="submit" className="btn-primary flex-1">
          Salvar Avaliação
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

