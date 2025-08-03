import { useState } from 'react';
import { toast } from 'sonner';
import { AccountConfig } from './types';

type AccountData = Omit<AccountConfig, 'note'> & { note?: string };

export function useAccountManagement(onSuccess: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const addAccount = async (account: AccountData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add account');
      toast.success('Account added successfully!');
      onSuccess();
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAccount = async (oldPhone: string, newAccountData: AccountData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPhone, ...newAccountData, newPhone: newAccountData.phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update account');
      toast.success('Account updated successfully!');
      onSuccess();
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (phone: string) => {
    if (!confirm(`Are you sure you want to delete the account for ${phone}?`)) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/account?phone=${encodeURIComponent(phone)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete account');
      toast.success('Account deleted successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, addAccount, updateAccount, deleteAccount };
}
