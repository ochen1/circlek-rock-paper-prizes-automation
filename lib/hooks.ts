import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AccountConfig, HubResponse, WalletListResponse, GameStartResponse, CooldownResponse } from './types';

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

// Individual hooks for different account operations
export function useAccountList() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAccountHubStats(phone: string, enabled = true) {
  return useQuery({
    queryKey: ['account', phone, 'hub'],
    queryFn: async () => {
      const response = await fetch(`/api/hub/${encodeURIComponent(phone)}`);
      if (!response.ok) throw new Error('Failed to fetch hub stats');
      return response.json() as Promise<HubResponse>;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAccountWallet(phone: string, enabled = true) {
  return useQuery({
    queryKey: ['account', phone, 'wallet'],
    queryFn: async () => {
      const response = await fetch(`/api/wallet/${encodeURIComponent(phone)}`);
      if (!response.ok) throw new Error('Failed to fetch wallet');
      return response.json() as Promise<WalletListResponse>;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStartGame(phone: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/game/start/${encodeURIComponent(phone)}`);
      if (!response.ok) throw new Error('Failed to start game');
      return response.json() as Promise<GameStartResponse | CooldownResponse>;
    },
    onSuccess: () => {
      // After starting a game, invalidate hub stats and wallet
      queryClient.invalidateQueries({ queryKey: ['account', phone, 'hub'] });
    },
  });
}

export function useEndGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ phone, gameId }: { phone: string, gameId: string }) => {
      if (!confirm('Are you sure you want to claim this prize? This action cannot be undone.')) {
        throw new Error('Prize claim cancelled');
      }
      
      const response = await fetch('/api/game/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, gameId }),
      });
      if (!response.ok) throw new Error('Failed to claim prize');
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast.success('Prize claimed successfully!');
      // After claiming a prize, invalidate hub stats and wallet
      queryClient.invalidateQueries({ queryKey: ['account', variables.phone, 'hub'] });
      queryClient.invalidateQueries({ queryKey: ['account', variables.phone, 'wallet'] });
    },
    onError: (error: any) => {
      if (error.message !== 'Prize claim cancelled') {
        toast.error(`Failed to claim prize: ${error.message}`);
      }
    },
  });
}
