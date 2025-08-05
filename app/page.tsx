'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccountState } from '@/lib/types';
import { AddAccountForm } from '@/components/AddAccountForm';
import { AccountCard } from '@/components/AccountCard';
import { DashboardStats } from '@/components/DashboardStats';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Zap, AlertCircle, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { useAccountList } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';

export default function HomePage() {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, isRefetching, refetch } = useAccountList();

  const handleRefreshAll = async () => {
    toast.loading('Refreshing accounts list...', { id: 'refresh-all' });
    try {
      await refetch();
      toast.success('Account list refreshed', { id: 'refresh-all' });
    } catch (error) {
      toast.error('Failed to refresh accounts', { id: 'refresh-all' });
    }
  };

  // Helper to get redeem URL (same as in AccountCard)
  const getRedeemUrl = (voucherId: string): string => {
    return `https://rockpaperprizes.com/?p=${voucherId}&wallet=true`;
  };

  // Helper to check if a prize is expired
  const isExpired = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date.getTime() < now.getTime();
  };

  // Copy all accounts and their prizes as text, using wallet data from react-query
  const handleCopyAllAccountsPrizes = () => {
    if (!accounts.length) return;
    let lines: string[] = [];
    accounts.forEach((account: AccountState) => {
      lines.push(`Account: ${account.phone}`);
      // Use wallet data from tanstack query cache
      const walletData = queryClient.getQueryData(["account", account.phone, "wallet"]) as { vouchers?: { id: string; title: string; expires: string }[] } | undefined;
      const prizes = walletData?.vouchers || [];
      const validPrizes = prizes.filter((prize: { expires: string }) => !isExpired(prize.expires));
      if (validPrizes.length === 0) {
        lines.push('  (No valid prizes)');
      } else {
        validPrizes.forEach((prize: { id: string; title: string }) => {
          lines.push(`  - ${prize.title}: ${getRedeemUrl(prize.id)}`);
        });
      }
      lines.push('');
    });
    const txt = lines.join('\n');
    navigator.clipboard.writeText(txt);
    toast.success('All accounts & prize links copied to clipboard');
  };

  const filteredAccounts = (accounts as AccountState[])
    .filter((account: AccountState) => {
      if (filter !== 'all' && account.status !== filter) return false;
      if (searchTerm && !account.phone.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a: AccountState, b: AccountState) => {
      const statusPriority: Record<AccountState['status'], number> = { prize_claimed: 1, cooldown: 2, error: 3, checking: 4, idle: 5 };
      return statusPriority[a.status] - statusPriority[b.status];
    });

  if (isLoading && accounts.length === 0) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-muted-foreground">Loading your idle farm dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <Zap className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              PrizePilot Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Automatically managing your Circle K prize sessions
          </p>
        </motion.div>

        {/* Stats */}
        {accounts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DashboardStats accounts={accounts} />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <AddAccountForm />
            
            {accounts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    onClick={handleRefreshAll}
                    disabled={isRefetching}
                    className="w-full"
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                    Refresh Account List
                  </Button>
                  <Button
                    onClick={handleCopyAllAccountsPrizes}
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Copy All Accounts & Prizes
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 space-y-6"
          >
            {accounts.length > 0 && (
              <SearchAndFilters
                filter={filter}
                setFilter={setFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                accountsCount={accounts.length}
                filteredCount={filteredAccounts.length}
              />
            )}

            <AnimatePresence mode="wait">
              {filteredAccounts.length > 0 ? (
                <motion.div 
                  key="accounts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-6"
                >
                  {filteredAccounts.map((account: AccountState, index: number) => (
                    <motion.div
                      key={account.phone}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AccountCard account={account} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : accounts.length > 0 ? (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card>
                    <CardContent className="flex flex-col items-center space-y-4 py-12">
                      <AlertCircle className="h-12 w-12 text-muted-foreground" />
                      <div className="text-center space-y-2">
                        <h3 className="font-semibold">No accounts match your filters</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card>
                    <CardContent className="flex flex-col items-center space-y-4 py-12">
                      <Zap className="h-12 w-12 text-muted-foreground" />
                      <div className="text-center space-y-2">
                        <h3 className="font-semibold">Welcome to your Idle Farm!</h3>
                        <p className="text-muted-foreground">
                          Add your first account to start managing your Circle K prize sessions
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
