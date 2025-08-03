import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AccountConfig } from './types';

type AccountData = Omit<AccountConfig, 'note'> & { note?: string };

export function useAccountManagement() {
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
  };

  const addAccountMutation = useMutation({
    mutationFn: async (account: AccountData) => {
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add account');
      return data;
    },
    onSuccess: () => {
      toast.success('Account added successfully!');
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ oldPhone, newAccountData }: { oldPhone: string, newAccountData: AccountData }) => {
      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPhone, ...newAccountData, newPhone: newAccountData.phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update account');
      return data;
    },
    onSuccess: () => {
      toast.success('Account updated successfully!');
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (phone: string) => {
      if (!confirm(`Are you sure you want to delete the account for ${phone}?`)) {
        throw new Error('Deletion cancelled');
      }
      const response = await fetch(`/api/account?phone=${encodeURIComponent(phone)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete account');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Account deleted successfully');
      onSuccess();
    },
    onError: (error: any) => {
      if (error.message !== 'Deletion cancelled') {
        toast.error('Failed to delete account');
      }
    },
  });

  return {
    addAccount: addAccountMutation.mutateAsync,
    isAdding: addAccountMutation.isPending,
    updateAccount: updateAccountMutation.mutateAsync,
    isUpdating: updateAccountMutation.isPending,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeleting: deleteAccountMutation.isPending,
  };
}
