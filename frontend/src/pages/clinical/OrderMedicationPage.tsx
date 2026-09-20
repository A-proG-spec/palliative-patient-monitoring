import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrderMedication } from '@/hooks/useMedications';
import { usePatient } from '@/hooks/usePatients';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BackButton } from '@/components/common/BackButton';
import { PageLoader } from '@/components/common/LoadingSpinner';
import {
  createMedicationSchema,
  type CreateMedicationFormData,
} from '@/schemas/medication.schema';

const OrderMedicationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading: pLoading } = usePatient(id!);
  const mutation = useOrderMedication(id!);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMedicationFormData>({
    resolver: zodResolver(createMedicationSchema),
    defaultValues: {
      administeredAt:
        patient?.currentLocation === 'ReferredHospital' ? 'Hospital' : 'Home',
    },
  });

  const onSubmit = (data: CreateMedicationFormData) => {
    mutation.mutate(data, {
      onSuccess: () => navigate(`/patients/${id}`),
    });
  };

  if (pLoading) return <PageLoader />;

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <BackButton to={`/patients/${id}`} label="Patient" />
        <div>
          <h1 className="text-xl font-bold text-on-surface">
            Order Medication
          </h1>
          {patient && (
            <p className="text-sm text-text-secondary">
              {patient.firstName} {patient.lastName} ·{' '}
              {patient.patientDisplayId}
            </p>
          )}
        </div>
      </div>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Medication Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <Input
              label="Medication Name *"
              placeholder="e.g. Morphine"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Dosage *"
              placeholder="e.g. 10mg"
              error={errors.dosage?.message}
              {...register('dosage')}
            />
            <Input
              label="Frequency *"
              placeholder="e.g. Every 6 hours"
              error={errors.frequency?.message}
              {...register('frequency')}
            />
            <Input
              label="Route *"
              placeholder="e.g. Oral, IV, Subcutaneous, Transdermal"
              error={errors.route?.message}
              {...register('route')}
            />
            <Select
              label="Administered At *"
              options={[
                { value: 'Home', label: 'Home' },
                { value: 'Hospital', label: 'Hospital' },
              ]}
              error={errors.administeredAt?.message}
              {...register('administeredAt')}
            />
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/patients/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                {mutation.isPending ? 'Ordering…' : 'Order Medication'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderMedicationPage;