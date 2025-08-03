import { AccountState } from '@/lib/types';
import { GiftIcon, ClockIcon, AlertIcon } from './icons';

interface DashboardStatsProps {
  accounts: AccountState[];
}

export function DashboardStats({ accounts }: DashboardStatsProps) {
  const totalAccounts = accounts.length;
  const accountsInCooldown = accounts.filter(a => a.status === 'cooldown').length;
  const accountsWithPrizes = accounts.filter(a => a.prizes && a.prizes.length > 0).length;
  const totalPrizes = accounts.reduce((sum, account) => sum + (account.prizes?.length || 0), 0);
  const accountsWithErrors = accounts.filter(a => a.status === 'error').length;

  // Find the next account to come out of cooldown
  const nextAvailableAccount = accounts
    .filter(a => a.status === 'cooldown' && a.cooldownUntil)
    .sort((a, b) => new Date(a.cooldownUntil!).getTime() - new Date(b.cooldownUntil!).getTime())[0];
    
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold text-white mb-4">Dashboard Overview</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Accounts</span>
          <span className="text-xl font-bold text-white">{totalAccounts}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Active Prizes</span>
          <span className="text-xl font-bold text-green-400 flex items-center">
            <GiftIcon className="w-5 h-5 mr-1" /> {totalPrizes}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">In Cooldown</span>
          <span className="text-xl font-bold text-yellow-400 flex items-center">
            <ClockIcon className="w-5 h-5 mr-1" /> {accountsInCooldown}
          </span>
        </div>
        
        {accountsWithErrors > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Errors</span>
            <span className="text-xl font-bold text-red-400 flex items-center">
              <AlertIcon className="w-5 h-5 mr-1" /> {accountsWithErrors}
            </span>
          </div>
        )}
      </div>
      
      {nextAvailableAccount && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Next Available Account</h3>
          <p className="text-white">{nextAvailableAccount.phone}</p>
          <p className="text-yellow-400 text-sm">
            Available at {new Date(nextAvailableAccount.cooldownUntil!).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
