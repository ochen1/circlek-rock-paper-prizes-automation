import { AccountState } from '@/lib/types';
import { GiftIcon, ClockIcon, AlertIcon } from './icons';

interface DashboardStatsProps {
  accounts: AccountState[];
}

export function DashboardStats({ accounts }: DashboardStatsProps) {
  const totalPrizes = accounts.reduce((sum, acc) => sum + acc.prizes.length, 0);
  const totalClaimed = accounts.filter(acc => acc.status === 'prize_claimed').length;
  const totalCooldown = accounts.filter(acc => acc.status === 'cooldown').length;
  const totalErrors = accounts.filter(acc => acc.status === 'error').length;

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Dashboard Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 p-3 rounded flex items-center">
          <GiftIcon className="w-5 h-5 text-green-400 mr-2" />
          <div>
            <p className="text-xs text-gray-400">Total Prizes</p>
            <p className="text-lg font-bold text-white">{totalPrizes}</p>
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded flex items-center">
          <GiftIcon className="w-5 h-5 text-indigo-400 mr-2" />
          <div>
            <p className="text-xs text-gray-400">Recently Claimed</p>
            <p className="text-lg font-bold text-white">{totalClaimed}</p>
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded flex items-center">
          <ClockIcon className="w-5 h-5 text-yellow-400 mr-2" />
          <div>
            <p className="text-xs text-gray-400">On Cooldown</p>
            <p className="text-lg font-bold text-white">{totalCooldown}</p>
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded flex items-center">
          <AlertIcon className="w-5 h-5 text-red-400 mr-2" />
          <div>
            <p className="text-xs text-gray-400">Errors</p>
            <p className="text-lg font-bold text-white">{totalErrors}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
