// src/pages/staff/OrderMedicationPage.tsx
// Route: /patients/:patientId/medications  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (staff)

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatient } from '@/hooks/usePatients';
import { useOrderMedication } from '@/hooks/useMedications';
import { createMedicationSchema, type CreateMedicationFormData } from '@/schemas/medication.schema';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { getErrorMessage } from '@/lib/utils';
import { ROUTES, ADMINISTERED_AT_OPTIONS } from '@/constants';

export const OrderMedicationPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading: pLoading, error: pError } = usePatient(patientId!);
  const orderMutation = useOrderMedication(patientId!);

  const {
    register, handleSubmit, formState: { errors }, setError,
  } = useForm<CreateMedicationFormData>({
    resolver: zodResolver(createMedicationSchema),
    defaultValues: { administeredAt: 'Home' },
  });

  if (pLoading) return <PageLoader />;
  if (pError || !patient) return <ErrorState />;

  const onSubmit = (data: CreateMedicationFormData) => {
    orderMutation.mutate(data, {
      onSuccess: () => navigate(ROUTES.PATIENT_DETAIL(patientId!)),
      onError: (err) => setError('root', { message: getErrorMessage(err) }),
    });
  };

  return (
    <div className="max-w-container-md mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PATIENT_DETAIL(patientId!))}>← Back</Button>
        <h1 className="text-heading-1 text-on-surface">
          Order Medication — {patient.firstName} {patient.lastName}
        </h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Medication Details</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {errors.root && (
              <div className="p-3 rounded-lg bg-error-bg text-error text-body-sm" role="alert">{errors.root.message}</div>
            )}
            <div>
              <Label htmlFor="name" required>Medication Name</Label>
              <Input id="name" error={!!errors.name} errorMessage={errors.name?.message} {...register('name')} />
            </div>
            <div>
              <Label htmlFor="dosage" required>Dosage</Label>
              <Input id="dosage" placeholder="e.g. 10mg" error={!!errors.dosage} errorMessage={errors.dosage?.message} {...register('dosage')} />
            </div>
            <div>
              <Label htmlFor="frequency" required>Frequency</Label>
              <Input id="frequency" placeholder="e.g. Every 6 hours" error={!!errors.frequency} errorMessage={errors.frequency?.message} {...register('frequency')} />
            </div>
            <div>
              <Label htmlFor="route" required>Route</Label>
              <Input id="route" placeholder="e.g. Oral, IV" error={!!errors.route} errorMessage={errors.route?.message} {...register('route')} />
            </div>
            <div>
              <Label htmlFor="administeredAt" required>Administered At</Label>
              <Select id="administeredAt" options={ADMINISTERED_AT_OPTIONS} error={!!errors.administeredAt} errorMessage={errors.administeredAt?.message} {...register('administeredAt')} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.PATIENT_DETAIL(patientId!))}>Cancel</Button>
            <Button type="submit" variant="primary" loading={orderMutation.isPending}>Order Medication</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
