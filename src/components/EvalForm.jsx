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
      cardiopathy: false,
      hypertension: false,
      diabetes: false,
      heart_rate_rest: '',
      wells_sit_reach_test: '',
      trunk_flexion_test: '',
      skinfold_triceps: '',
      skinfold_subscapular: '',
      skinfold_subaxillary: '',
      skinfold_suprailiac: '',
      skinfold_abdominal: '',
      skinfold_quadriceps: '',
      skinfold_calf: '',
      perimeter_chest: '',
      perimeter_arm_r: '',
      perimeter_arm_l: '',
      perimeter_arm_contracted_r: '',
      perimeter_arm_contracted_l: '',
      perimeter_forearm_r: '',
      perimeter_forearm_l: '',
      perimeter_waist: '',
      perimeter_abdominal: '',
      perimeter_hip: '',
      perimeter_thigh_r: '',
      perimeter_thigh_l: '',
      perimeter_leg_r: '',
      perimeter_leg_l: '',
      notes: '',
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
      const payload = {
        student_id: data.student_id,
        date: data.date,
        weight_kg: parseFloat(data.weight_kg),
        height_m: parseFloat(data.height_m),
        cardiopathy: Boolean(data.cardiopathy),
        cardiopathy_notes: data.cardiopathy_notes || null,
        hypertension: Boolean(data.hypertension),
        hypertension_notes: data.hypertension_notes || null,
        diabetes: Boolean(data.diabetes),
        diabetes_notes: data.diabetes_notes || null,
        heart_rate_rest: parseFloat(data.heart_rate_rest),
        wells_sit_reach_test: parseFloat(data.wells_sit_reach_test),
        trunk_flexion_test: parseFloat(data.trunk_flexion_test),
        skinfold_triceps: parseFloat(data.skinfold_triceps),
        skinfold_subscapular: parseFloat(data.skinfold_subscapular),
        skinfold_subaxillary: parseFloat(data.skinfold_subaxillary),
        skinfold_suprailiac: parseFloat(data.skinfold_suprailiac),
        skinfold_abdominal: parseFloat(data.skinfold_abdominal),
        skinfold_quadriceps: parseFloat(data.skinfold_quadriceps),
        skinfold_calf: parseFloat(data.skinfold_calf),
        perimeter_chest: parseFloat(data.perimeter_chest),
        perimeter_arm_r: parseFloat(data.perimeter_arm_r),
        perimeter_arm_l: parseFloat(data.perimeter_arm_l),
        perimeter_arm_contracted_r: parseFloat(data.perimeter_arm_contracted_r),
        perimeter_arm_contracted_l: parseFloat(data.perimeter_arm_contracted_l),
        perimeter_forearm_r: parseFloat(data.perimeter_forearm_r),
        perimeter_forearm_l: parseFloat(data.perimeter_forearm_l),
        perimeter_waist: parseFloat(data.perimeter_waist),
        perimeter_abdominal: parseFloat(data.perimeter_abdominal),
        perimeter_hip: parseFloat(data.perimeter_hip),
        perimeter_thigh_r: parseFloat(data.perimeter_thigh_r),
        perimeter_thigh_l: parseFloat(data.perimeter_thigh_l),
        perimeter_leg_r: parseFloat(data.perimeter_leg_r),
        perimeter_leg_l: parseFloat(data.perimeter_leg_l),
        notes: data.notes || null,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register('student_id')} />

      {/* Basic Information */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informações Básicas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              Altura (m) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('height_m', {
                required: 'Altura é obrigatória',
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
                IMC calculado: <strong>{calculatedBMI.toFixed(2)}</strong>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="heart_rate_rest" className="label">
              Frequência Cardíaca de Repouso (bpm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('heart_rate_rest', {
                required: 'Frequência cardíaca é obrigatória',
                min: { value: 30, message: 'Valor inválido' },
                max: { value: 220, message: 'Valor inválido' },
              })}
              type="number"
              step="1"
              id="heart_rate_rest"
              className="input-field"
              placeholder="Ex: 72"
            />
            {errors.heart_rate_rest && (
              <p className="error-text">{errors.heart_rate_rest.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Health Conditions */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Condições de Saúde
        </h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              {...register('cardiopathy')}
              type="checkbox"
              id="cardiopathy"
              className="mt-1 mr-2 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <div className="flex-1">
              <label htmlFor="cardiopathy" className="label cursor-pointer">
                Cardiopatia
              </label>
              <textarea
                {...register('cardiopathy_notes')}
                id="cardiopathy_notes"
                className="input-field mt-1"
                rows="2"
                placeholder="Observações sobre cardiopatia..."
              />
            </div>
          </div>

          <div className="flex items-start">
            <input
              {...register('hypertension')}
              type="checkbox"
              id="hypertension"
              className="mt-1 mr-2 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <div className="flex-1">
              <label htmlFor="hypertension" className="label cursor-pointer">
                Hipertensão
              </label>
              <textarea
                {...register('hypertension_notes')}
                id="hypertension_notes"
                className="input-field mt-1"
                rows="2"
                placeholder="Observações sobre hipertensão..."
              />
            </div>
          </div>

          <div className="flex items-start">
            <input
              {...register('diabetes')}
              type="checkbox"
              id="diabetes"
              className="mt-1 mr-2 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <div className="flex-1">
              <label htmlFor="diabetes" className="label cursor-pointer">
                Diabetes
              </label>
              <textarea
                {...register('diabetes_notes')}
                id="diabetes_notes"
                className="input-field mt-1"
                rows="2"
                placeholder="Observações sobre diabetes..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flexibility Tests */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Testes de Flexibilidade
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="wells_sit_reach_test" className="label">
              Teste de Sentar e Alcançar (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('wells_sit_reach_test', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="wells_sit_reach_test"
              className="input-field"
              placeholder="Ex: 25.5"
            />
            {errors.wells_sit_reach_test && (
              <p className="error-text">{errors.wells_sit_reach_test.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="trunk_flexion_test" className="label">
              Teste de Flexão do Tronco (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('trunk_flexion_test', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="trunk_flexion_test"
              className="input-field"
              placeholder="Ex: 30.0"
            />
            {errors.trunk_flexion_test && (
              <p className="error-text">{errors.trunk_flexion_test.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Skinfold Measurements */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dobras Cutâneas (mm)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="skinfold_triceps" className="label">
              Tríceps <span className="text-red-500">*</span>
            </label>
            <input
              {...register('skinfold_triceps', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="skinfold_triceps"
              className="input-field"
              placeholder="Ex: 12.5"
            />
            {errors.skinfold_triceps && (
              <p className="error-text">{errors.skinfold_triceps.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="skinfold_subscapular" className="label">
              Subescapular <span className="text-red-500">*</span>
            </label>
            <input
              {...register('skinfold_subscapular', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="skinfold_subscapular"
              className="input-field"
              placeholder="Ex: 15.0"
            />
            {errors.skinfold_subscapular && (
              <p className="error-text">{errors.skinfold_subscapular.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="skinfold_subaxillary" className="label">
              Subaxilar <span className="text-red-500">*</span>
            </label>
            <input
              {...register('skinfold_subaxillary', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="skinfold_subaxillary"
              className="input-field"
              placeholder="Ex: 10.0"
            />
            {errors.skinfold_subaxillary && (
              <p className="error-text">{errors.skinfold_subaxillary.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="skinfold_suprailiac" className="label">
              Suprailíaca <span className="text-red-500">*</span>
            </label>
            <input
              {...register('skinfold_suprailiac', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="skinfold_suprailiac"
              className="input-field"
              placeholder="Ex: 18.0"
            />
            {errors.skinfold_suprailiac && (
              <p className="error-text">{errors.skinfold_suprailiac.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="skinfold_abdominal" className="label">
              Abdominal <span className="text-red-500">*</span>
            </label>
            <input
              {...register('skinfold_abdominal', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="skinfold_abdominal"
              className="input-field"
              placeholder="Ex: 20.0"
            />
            {errors.skinfold_abdominal && (
              <p className="error-text">{errors.skinfold_abdominal.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="skinfold_quadriceps" className="label">
              Quadríceps <span className="text-red-500">*</span>
            </label>
            <input
              {...register('skinfold_quadriceps', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="skinfold_quadriceps"
              className="input-field"
              placeholder="Ex: 14.0"
            />
            {errors.skinfold_quadriceps && (
              <p className="error-text">{errors.skinfold_quadriceps.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="skinfold_calf" className="label">
              Panturrilha <span className="text-red-500">*</span>
            </label>
            <input
              {...register('skinfold_calf', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="skinfold_calf"
              className="input-field"
              placeholder="Ex: 8.0"
            />
            {errors.skinfold_calf && (
              <p className="error-text">{errors.skinfold_calf.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Perimeter Measurements */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Perímetros (cm)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="perimeter_chest" className="label">
              Tórax <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_chest', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_chest"
              className="input-field"
              placeholder="Ex: 100.0"
            />
            {errors.perimeter_chest && (
              <p className="error-text">{errors.perimeter_chest.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_arm_r" className="label">
              Braço Direito (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_arm_r', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_arm_r"
              className="input-field"
              placeholder="Ex: 32.0"
            />
            {errors.perimeter_arm_r && (
              <p className="error-text">{errors.perimeter_arm_r.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_arm_l" className="label">
              Braço Esquerdo (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_arm_l', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_arm_l"
              className="input-field"
              placeholder="Ex: 31.5"
            />
            {errors.perimeter_arm_l && (
              <p className="error-text">{errors.perimeter_arm_l.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_arm_contracted_r" className="label">
              Braço Contratado D (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_arm_contracted_r', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_arm_contracted_r"
              className="input-field"
              placeholder="Ex: 35.0"
            />
            {errors.perimeter_arm_contracted_r && (
              <p className="error-text">{errors.perimeter_arm_contracted_r.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_arm_contracted_l" className="label">
              Braço Contratado E (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_arm_contracted_l', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_arm_contracted_l"
              className="input-field"
              placeholder="Ex: 34.5"
            />
            {errors.perimeter_arm_contracted_l && (
              <p className="error-text">{errors.perimeter_arm_contracted_l.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_forearm_r" className="label">
              Antebraço Direito (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_forearm_r', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_forearm_r"
              className="input-field"
              placeholder="Ex: 28.0"
            />
            {errors.perimeter_forearm_r && (
              <p className="error-text">{errors.perimeter_forearm_r.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_forearm_l" className="label">
              Antebraço Esquerdo (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_forearm_l', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_forearm_l"
              className="input-field"
              placeholder="Ex: 27.5"
            />
            {errors.perimeter_forearm_l && (
              <p className="error-text">{errors.perimeter_forearm_l.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_waist" className="label">
              Cintura (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_waist', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_waist"
              className="input-field"
              placeholder="Ex: 85.0"
            />
            {errors.perimeter_waist && (
              <p className="error-text">{errors.perimeter_waist.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_abdominal" className="label">
              Abdominal (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_abdominal', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_abdominal"
              className="input-field"
              placeholder="Ex: 90.0"
            />
            {errors.perimeter_abdominal && (
              <p className="error-text">{errors.perimeter_abdominal.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_hip" className="label">
              Quadril (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_hip', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_hip"
              className="input-field"
              placeholder="Ex: 95.0"
            />
            {errors.perimeter_hip && (
              <p className="error-text">{errors.perimeter_hip.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_thigh_r" className="label">
              Coxa Direita (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_thigh_r', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_thigh_r"
              className="input-field"
              placeholder="Ex: 55.0"
            />
            {errors.perimeter_thigh_r && (
              <p className="error-text">{errors.perimeter_thigh_r.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_thigh_l" className="label">
              Coxa Esquerda (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_thigh_l', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_thigh_l"
              className="input-field"
              placeholder="Ex: 54.5"
            />
            {errors.perimeter_thigh_l && (
              <p className="error-text">{errors.perimeter_thigh_l.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_leg_r" className="label">
              Perna Direita (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_leg_r', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_leg_r"
              className="input-field"
              placeholder="Ex: 38.0"
            />
            {errors.perimeter_leg_r && (
              <p className="error-text">{errors.perimeter_leg_r.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="perimeter_leg_l" className="label">
              Perna Esquerda (cm) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('perimeter_leg_l', {
                required: 'Campo obrigatório',
                min: { value: 0, message: 'Valor deve ser positivo' },
              })}
              type="number"
              step="0.1"
              id="perimeter_leg_l"
              className="input-field"
              placeholder="Ex: 37.5"
            />
            {errors.perimeter_leg_l && (
              <p className="error-text">{errors.perimeter_leg_l.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="label">
          Observações Gerais
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          className="input-field"
          rows="3"
          placeholder="Observações sobre a avaliação..."
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
        <button type="submit" className="btn-primary flex-1">
          Salvar Avaliação Completa
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
