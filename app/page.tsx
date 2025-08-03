'use client';

import { useState, useEffect, useCallback } from 'react';
import { AccountState } from '@/lib/types';
import { AddAccountForm } from '@/components/AddAccountForm';
import { AccountCard } from '@/components/AccountCard';
import { Spinner } from '@/components/icons';
import { DashboardStats } from '@/components/DashboardStats';

export default function HomePage() {
  const [accounts, setAccounts] = useState<AccountState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch('/api/state');
      if (!response.ok) {
        throw new Error('Failed to fetch account states from server.');
      }
      const data: AccountState[] = await response.json();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchData]);

  const handleAccountAdded = () => {
    setIsLoading(true);
    fetchData(); // Immediately refresh data after adding an account
  };

  const handleAccountDeleted = () => {
    setIsLoading(true);
    fetchData(); // Refresh data after deleting an account
  };

  const handleAccountRefresh = async (phone: string) => {
    try {
      const response = await fetch(`/api/refresh-account?phone=${encodeURIComponent(phone)}`);
      if (!response.ok) {
        throw new Error('Failed to refresh account.');
      }
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter and sort accounts
  const filteredAccounts = accounts
    .filter(account => {
      // Apply status filter
      if (filter !== 'all' && account.status !== filter) return false;
      
      // Apply search filter (phone number)
      if (searchTerm && !account.phone.includes(searchTerm)) return false;
      
      return true;
    })
    .sort((a, b) => {
      // Sort by status priority: prize_claimed > cooldown > error > idle
      const statusPriority = {
        prize_claimed: 1,
        cooldown: 2,
        error: 3,
        checking: 4,
        idle: 5
      };
      
      return statusPriority[a.status] - statusPriority[b.status];
    });

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-indigo-400">Idle Farm Dashboard</h1>
          <p className="text-center text-gray-400 mt-2">Automatically managing your game sessions.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <AddAccountForm onAccountAdded={handleAccountAdded} />
            
            {accounts.length > 0 && (
              <DashboardStats accounts={accounts} />
            )}
          </div>
          
          <div className="lg:col-span-2">
            {accounts.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setFilter('all')} 
                      className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setFilter('prize_claimed')} 
                      className={`px-3 py-1 rounded-full text-sm ${filter === 'prize_claimed' ? 'bg-green-800 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      Prizes
                    </button>
                    <button 
                      onClick={() => setFilter('cooldown')} 
                      className={`px-3 py-1 rounded-full text-sm ${filter === 'cooldown' ? 'bg-yellow-800 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      Cooldown
                    </button>
                    <button 
                      onClick={() => setFilter('error')} 
                      className={`px-3 py-1 rounded-full text-sm ${filter === 'error' ? 'bg-red-800 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      Errors
                    </button>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-3 pr-10 py-1 bg-gray-700 border-none rounded-md text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {isLoading && accounts.length === 0 ? (
                <div className="flex justify-center items-center p-10">
                  <Spinner />
                  <span className="ml-4 text-lg">Loading accounts and running checks...</span>
                </div>
              ) : error ? (
                <div className="bg-red-900 border border-red-700 text-red-300 p-4 rounded-lg">
                  <p className="font-bold">An Error Occurred</p>
                  <p>{error}</p>
                </div>
              ) : filteredAccounts.length > 0 ? (
                filteredAccounts.map(account => (
                  <AccountCard 
                    key={account.phone} 
                    account={account} 
                    onDelete={handleAccountDeleted}
                    onRefresh={handleAccountRefresh}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-10">
                  {accounts.length > 0 ? (
                    <p>No accounts match your filters.</p>
                  ) : (
                    <>
                      <p>No accounts found.</p>
                      <p>Add an account using the form to get started.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
