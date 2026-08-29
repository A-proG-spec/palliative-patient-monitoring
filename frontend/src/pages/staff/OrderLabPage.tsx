// src/pages/staff/OrderLabPage.tsx
// Route: /patients/:patientId/labs  |  Layout: DashboardLayout  |  Guard: ProtectedRoute (staff)

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePatient } from '@/hooks/usePatients';
import { useOrderLab } from '@/hooks/useLabs';
import { createLabSchema, type CreateLabFormData } from '@/schemas/lab.schema';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { getErrorMessage, todayISO } from '@/lib/utils';
import { ROUTES, LOCATION_OPTIONS } from '@/constants';

export const OrderLabPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading: pLoading, error: pError } = usePatient(patientId!);
  const orderMutation = useOrderLab(patientId!);

  const {
    register, handleSubmit, formState: { errors }, setError,
  } = useForm<CreateLabFormData>({
    resolver: zodResolver(createLabSchema),
    defaultValues: { location: 'Home', dateOrdered: todayISO() },
  });

  if (pLoading) return <PageLoader />;
  if (pError || !patient) return <ErrorState />;

  const onSubmit = (data: CreateLabFormData) => {
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
          Order Lab Test — {patient.firstName} {patient.lastName}
        </h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Lab Test Details</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {errors.root && (
              <div className="p-3 rounded-lg bg-error-bg text-error text-body-sm" role="alert">{(errors.root as { message?: string }).message}</div>
            )}
            <div>
              <Label htmlFor="testName" required>Test Name</Label>
              <Input id="testName" placeholder="e.g. Complete Blood Count" error={!!errors.testName} errorMessage={errors.testName?.message} {...register('testName')} />
            </div>
            <div>
              <Label htmlFor="dateOrdered" required>Date Ordered</Label>
              <Input id="dateOrdered" type="date" error={!!errors.dateOrdered} errorMessage={errors.dateOrdered?.message} {...register('dateOrdered')} />
            </div>
            <div>
              <Label htmlFor="location" required>Location</Label>
              <Select id="location" options={LOCATION_OPTIONS} error={!!errors.location} errorMessage={errors.location?.message} {...register('location')} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.PATIENT_DETAIL(patientId!))}>Cancel</Button>
            <Button type="submit" variant="primary" loading={orderMutation.isPending}>Order Lab Test</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
