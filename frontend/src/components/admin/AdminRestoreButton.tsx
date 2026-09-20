import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminRestoreButtonProps {
  resourceLabel: string;
  onRestore: () => void;
  isPending?: boolean;
}

export const AdminRestoreButton: React.FC<AdminRestoreButtonProps> = ({
  resourceLabel,
  onRestore,
  isPending,
}) => (
  <Button
    size="sm"
    variant="outline"
    leftIcon={<RotateCcw size={13} />}
    loading={isPending}
    onClick={onRestore}
    title={`Restore ${resourceLabel}`}
  >
    Restore
  </Button>
);

export default AdminRestoreButton;