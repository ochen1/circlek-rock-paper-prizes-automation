import { useState } from 'react';
import { AccountState } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Gift, Trash2, RefreshCw, Copy, ExternalLink, Clock, AlertCircle, CheckCircle2, Trophy, Zap, Coins } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { toast } from 'sonner';

interface AccountCardProps {
  account: AccountState;
  onDelete: () => void;
  onRefresh: (phone: string) => void;
}

const statusConfig = {
  idle: { 
    bg: 'bg-slate-600', 
    text: 'text-slate-100', 
    label: 'Idle', 
    icon: Clock,
    glow: 'shadow-slate-500/20'
  },
  checking: { 
    bg: 'bg-blue-600', 
    text: 'text-blue-100', 
    label: 'Checking...', 
    icon: RefreshCw,
    glow: 'shadow-blue-500/30'
  },
  cooldown: { 
    bg: 'bg-amber-600', 
    text: 'text-amber-100', 
    label: 'Cooldown', 
    icon: Clock,
    glow: 'shadow-amber-500/30'
  },
  prize_claimed: { 
    bg: 'bg-emerald-600', 
    text: 'text-emerald-100', 
    label: 'Prize Claimed!', 
    icon: CheckCircle2,
    glow: 'shadow-emerald-500/30'
  },
  error: { 
    bg: 'bg-red-600', 
    text: 'text-red-100', 
    label: 'Error', 
    icon: AlertCircle,
    glow: 'shadow-red-500/30'
  },
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

export function AccountCard({ account, onDelete, onRefresh }: AccountCardProps) {
  const config = statusConfig[account.status];
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
        
        if (!response.ok) throw new Error('Failed to delete account');
        
        toast.success('Account deleted successfully');
        onDelete();
      } catch (error) {
        toast.error('Failed to delete account');
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

  const handleCopyToken = () => {
    navigator.clipboard.writeText(account.token);
    toast.success('Token copied to clipboard');
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
    <Card className={`relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 hover:shadow-2xl hover:shadow-${config.bg.split('-')[1]}-500/20 transition-all duration-500 backdrop-blur-sm ${config.glow}`}>
      <CardContent className="p-0">
        {/* Status Bar */}
        <div className={`h-1 w-full ${config.bg}`} />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-2xl font-bold text-white">{account.phone}</h3>
                <Badge className={`${config.bg} ${config.text} border-0 gap-1.5 px-3 py-1`}>
                  <config.icon className="h-3.5 w-3.5" />
                  {config.label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-800/70 rounded-lg px-3 py-2">
                  <code className="text-xs text-slate-300 font-mono">
                    {account.token.substring(0, 12)}...
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyToken}
                    className="h-5 w-5 p-0 text-slate-400 hover:text-white"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-9 w-9 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-9 w-9 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Hub Stats */}
          {account.hubStats && (
            <div className="mb-6 bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 rounded-xl p-4">
              <h4 className="text-indigo-200 font-medium mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Daily Progress
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Played Today:</span>
                  <span className={`font-medium ${account.hubStats.played_today ? 'text-green-400' : 'text-slate-300'}`}>
                    {account.hubStats.played_today ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Games Completed:</span>
                  <span className="text-slate-200 font-medium">{account.hubStats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Games Won:</span>
                  <span className="text-emerald-400 font-medium">{account.hubStats.won}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Win Rate:</span>
                  <span className="text-slate-200 font-medium">
                    {account.hubStats.completed > 0 ? Math.round((account.hubStats.won / account.hubStats.completed) * 100) : 0}%
                  </span>
                </div>
              </div>
              
              {/* Bonus Progress */}
              {Object.keys(account.hubStats.rpp_bonus).length > 0 && (
                <div className="mt-4 pt-3 border-t border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-4 w-4 text-yellow-400" />
                    <span className="text-indigo-200 font-medium text-sm">Daily Bonuses</span>
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(account.hubStats.rpp_bonus).map(([key, bonus]) => (
                      <div
                        key={key}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          bonus.completed 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                        }`}
                      >
                        <Coins className="h-3 w-3" />
                        {bonus.value}
                        {bonus.completed && <span className="text-green-400">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Last Checked:</span> 
              <span className="text-slate-200">{formatDate(account.lastChecked)}</span>
            </div>
            
            {account.status === 'cooldown' && account.cooldownUntil && (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-xl p-4">
                <div className="text-amber-200 mb-2 font-medium">
                  Cooldown Until: {formatDate(account.cooldownUntil)}
                </div>
                <CountdownTimer targetDate={new Date(account.cooldownUntil)} />
              </div>
            )}
            
            {account.status === 'prize_claimed' && account.lastPrize && (
              <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-xl p-4">
                <span className="text-emerald-200 font-medium">🎉 Latest Prize:</span>
                <p className="text-emerald-100 mt-1 font-medium">{account.lastPrize}</p>
              </div>
            )}
            
            {account.status === 'error' && account.error && (
              <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-xl p-4">
                <span className="text-red-200 font-medium">⚠️ Error:</span>
                <p className="text-red-100 mt-1">{account.error}</p>
              </div>
            )}
          </div>

          {/* Note Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">Note</label>
            <Textarea
              value={note}
              onChange={handleNoteChange}
              onBlur={handleNoteBlur}
              className="bg-slate-800/50 border-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none text-slate-200"
              placeholder="Add a note for this account..."
              disabled={noteStatus === 'saving'}
              rows={2}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs">
                {noteStatus === 'saving' && <span className="text-slate-400">💾 Saving...</span>}
                {noteStatus === 'saved' && <span className="text-emerald-400">✓ Saved!</span>}
                {noteStatus === 'error' && <span className="text-red-400">✗ Error saving</span>}
              </div>
            </div>
          </div>

          {/* Prizes Section */}
          {account.prizes && account.prizes.length > 0 && (
            <div className="border-t border-slate-700/50 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Gift className="h-5 w-5 text-emerald-400" />
                  Wallet Prizes ({account.prizes.length})
                </h4>
                {account.walletLink && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50"
                  >
                    <a href={account.walletLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Wallet
                    </a>
                  </Button>
                )}
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {account.prizes.map(prize => (
                  <div key={prize.id} className="bg-gradient-to-r from-slate-800/70 to-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="text-emerald-400 font-medium text-sm leading-tight">{prize.title}</h5>
                      <span className="text-xs text-slate-500 font-mono">#{prize.id.substring(0, 8)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                      <div>
                        <span className="text-slate-500">Created:</span>
                        <div className="text-slate-300">{formatDate(prize.created)}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Expires:</span>
                        <div className="text-slate-300">{formatDate(prize.expires)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
