import { useState } from 'react';
import { AccountState } from '@/lib/types';
import { GiftIcon, TrashIcon, RefreshIcon } from './icons';
import { CountdownTimer } from './CountdownTimer';

interface AccountCardProps {
  account: AccountState;
  onDelete: () => void;
  onRefresh: (phone: string) => void;
}

const statusStyles = {
  idle: { bg: 'bg-gray-700', text: 'text-gray-300', label: 'Idle' },
  checking: { bg: 'bg-blue-900', text: 'text-blue-300', label: 'Checking...' },
  cooldown: { bg: 'bg-yellow-900', text: 'text-yellow-300', label: 'Cooldown' },
  prize_claimed: { bg: 'bg-green-900', text: 'text-green-300', label: 'Prize Claimed!' },
  error: { bg: 'bg-red-900', text: 'text-red-300', label: 'Error' },
};

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
}

export function AccountCard({ account, onDelete, onRefresh }: AccountCardProps) {
  const style = statusStyles[account.status];
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [note, setNote] = useState(account.note || '');
  const [noteStatus, setNoteStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the account for ${account.phone}?`)) {
      setIsDeleting(true);
      try {
        const response = await fetch('/api/delete-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: account.phone }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete account');
        }
        
        onDelete();
      } catch (error) {
        alert('Failed to delete account. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh(account.phone);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    setNoteStatus('idle');
  };

  const handleNoteBlur = async () => {
    if (note === (account.note || '')) return;
    setNoteStatus('saving');
    try {
      const response = await fetch('/api/update-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: account.phone, note }),
      });
      if (!response.ok) throw new Error();
      setNoteStatus('saved');
      setTimeout(() => setNoteStatus('idle'), 1200);
    } catch {
      setNoteStatus('error');
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-lg ${style.bg} border border-gray-700 transition-all duration-200 hover:shadow-xl`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xl font-bold text-white">{account.phone}</p>
          <div className="flex items-center">
            <p className="text-xs text-gray-400 font-mono break-all truncate max-w-[300px]">{account.token}</p>
            <button
              onClick={() => navigator.clipboard.writeText(account.token)}
              className="ml-2 text-xs text-gray-400 hover:text-white"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="p-1.5 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh account"
          >
            <RefreshIcon className={`w-5 h-5 text-gray-400 ${isRefreshing ? 'animate-spin' : 'hover:text-white'}`} />
          </button>
          
          <button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="p-1.5 rounded-full hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete account"
          >
            <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-400" />
          </button>
          
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${style.bg} ${style.text} border ${style.text.replace('text-', 'border-')}`}>
            {style.label}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-300">
        <p><strong>Last Checked:</strong> {formatDate(account.lastChecked)}</p>
        
        {account.status === 'cooldown' && account.cooldownUntil && (
          <div>
            <p className="flex items-center">
              <strong className="mr-2">Cooldown Until:</strong> 
              <span>{formatDate(account.cooldownUntil)}</span>
            </p>
            <CountdownTimer targetDate={new Date(account.cooldownUntil)} />
          </div>
        )}
        
        {account.status === 'prize_claimed' && account.lastPrize && (
            <p className="text-green-400"><strong>Last Prize:</strong> {account.lastPrize}</p>
        )}
        
        {account.status === 'error' && account.error && (
            <p className="text-red-400"><strong>Details:</strong> {account.error}</p>
        )}
      </div>

      <div className="mt-4">
        <label className="block text-xs text-gray-400 mb-1">Note</label>
        <textarea
          value={note}
          onChange={handleNoteChange}
          onBlur={handleNoteBlur}
          className="w-full resize-none bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          placeholder="Add a note for this account..."
          disabled={noteStatus === 'saving'}
        />
        {noteStatus === 'saving' && <span className="text-xs text-gray-400 ml-2">Saving...</span>}
        {noteStatus === 'saved' && <span className="text-xs text-green-400 ml-2">Saved!</span>}
        {noteStatus === 'error' && <span className="text-xs text-red-400 ml-2">Error saving note</span>}
      </div>

      {account.prizes && account.prizes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <h4 className="font-semibold text-white mb-2 flex items-center gap-2"><GiftIcon className="w-5 h-5"/> Wallet Prizes</h4>
          <ul className="space-y-1 list-disc list-inside text-gray-400">
            {account.prizes.map(prize => (
              <li key={prize.id}>
                <span className="text-indigo-400">{prize.title}</span>
                <span className="text-xs"> (Expires: {formatDate(prize.expires)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
