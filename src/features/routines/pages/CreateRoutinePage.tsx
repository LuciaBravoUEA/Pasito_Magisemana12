import { zodResolver } from '@hookform/resolvers/zod';
import { IonSelect, IonSelectOption, IonText } from '@ionic/react';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import AppButton from '../../../components/common/AppButton';
import AppCard from '../../../components/common/AppCard';
import AppInput from '../../../components/forms/AppInput';
import AppPage from '../../../components/layout/AppPage';
import { getPreference, removePreference, setPreference } from '../../../services/storage/preferences';
import { ValidationError, getUserErrorMessage } from '../../../services/api/errorMapper';
import { ROUTINE_CATEGORIES, type CreateRoutineRequest } from '../../../types/api/routines';
import { createRoutineSchema, type CreateRoutineFormValues } from '../../../validation/routines';
import { useCreateRoutine } from '../hooks/useRoutines';
import './routines.css';

const DRAFT_KEY = 'routine_creation_draft';
const FIELD_NAMES = ['title', 'description', 'category', 'points'] as const;
type FieldName = (typeof FIELD_NAMES)[number];
const isFieldName = (value: string | undefined): value is FieldName => Boolean(value && FIELD_NAMES.includes(value as FieldName));

const CreateRoutinePage: React.FC = () => {
  const history = useHistory();
  const mutation = useCreateRoutine();
  const { control, handleSubmit, reset, setError, watch, formState: { errors, isSubmitting } } = useForm<CreateRoutineFormValues>({
    resolver: zodResolver(createRoutineSchema),
    mode: 'onBlur',
    defaultValues: { title: '', description: '', category: 'ESCUELA', points: 10 },
  });

  useEffect(() => {
    void getPreference(DRAFT_KEY).then(value => {
      if (!value) return;
      try { reset(createRoutineSchema.parse(JSON.parse(value))); } catch { void removePreference(DRAFT_KEY); }
    });
  }, [reset]);

  useEffect(() => {
    const subscription = watch(value => {
      const draft = { title: value.title ?? '', description: value.description ?? '', category: value.category ?? 'ESCUELA', points: value.points ?? 10 };
      void setPreference(DRAFT_KEY, JSON.stringify(draft));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (values: CreateRoutineFormValues): Promise<void> => {
    try {
      const request: CreateRoutineRequest = values;
      const created = await mutation.mutateAsync(request);
      await removePreference(DRAFT_KEY);
      history.replace(`/rutinas/${created.id}`);
    } catch (error) {
      if (error instanceof ValidationError) {
        error.details?.forEach(detail => { if (isFieldName(detail.field)) setError(detail.field, { type: 'server', message: detail.message }); });
      }
    }
  };

  const cancel = async (): Promise<void> => {
    await removePreference(DRAFT_KEY);
    history.push('/rutinas');
  };

  return (
    <AppPage title="Crear rutina">
      <main className="routine-page routine-page--form">
        <nav className="routine-page__navigation" aria-label="Navegación de rutina">
          <AppButton variant="secondary" onClick={() => history.push('/home')}>Inicio</AppButton>
          <AppButton variant="secondary" onClick={() => history.push('/rutinas')}>Mis rutinas</AppButton>
        </nav>
        <AppCard title="Nueva rutina" description="Define una actividad pequeña, clara y alcanzable.">
          <form className="routine-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller name="title" control={control} render={({ field }) => <AppInput label="Título" value={field.value} error={errors.title?.message} onIonInput={event => field.onChange(event.detail.value ?? '')} onIonBlur={field.onBlur} />} />
            <Controller name="description" control={control} render={({ field }) => <AppInput label="Descripción (opcional)" value={field.value ?? ''} error={errors.description?.message} onIonInput={event => field.onChange(event.detail.value ?? '')} onIonBlur={field.onBlur} />} />
            <Controller name="category" control={control} render={({ field }) => <IonSelect label="Categoría" labelPlacement="stacked" fill="outline" value={field.value} onIonChange={event => field.onChange(event.detail.value)} onIonBlur={field.onBlur} aria-label="Categoría" className={errors.category ? 'ion-invalid ion-touched' : ''}>{ROUTINE_CATEGORIES.map(category => <IonSelectOption key={category} value={category}>{category}</IonSelectOption>)}</IonSelect>} />
            {errors.category && <IonText color="danger"><p>{errors.category.message}</p></IonText>}
            <Controller name="points" control={control} render={({ field }) => <AppInput label="Puntos" type="number" inputmode="numeric" value={String(field.value)} error={errors.points?.message} onIonInput={event => field.onChange(Number(event.detail.value))} onIonBlur={field.onBlur} />} />
            {mutation.isError && !(mutation.error instanceof ValidationError) && <IonText role="alert" color="danger"><p>{getUserErrorMessage(mutation.error)}</p></IonText>}
            <div className="routine-form__actions"><AppButton variant="secondary" onClick={() => void cancel()}>Cancelar</AppButton><AppButton type="submit" isLoading={isSubmitting || mutation.isPending}>Crear rutina</AppButton></div>
          </form>
        </AppCard>
      </main>
    </AppPage>
  );
};

export default CreateRoutinePage;
