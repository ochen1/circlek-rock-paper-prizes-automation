import { useState } from 'react';
import { AccountState } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Gift, Trash2, RefreshCw, Copy, ExternalLink, Clock, AlertCircle, CheckCircle2, Trophy, Zap, Coins, Edit } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { toast } from 'sonner';
import { useAccountManagement } from '@/lib/hooks';
import { EditAccountModal } from './EditAccountModal';

interface AccountCardProps {
  account: AccountState;
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
  return new Date(dateString).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const timeAgo = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30.44);
    const years = Math.round(days / 365.25);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
};

const timeLeft = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
    if (seconds < 0) return 'Expired';
    
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30.44);
    const years = Math.round(days / 365.25);

    if (seconds < 60) return `in ${seconds}s`;
    if (minutes < 60) return `in ${minutes}m`;
    if (hours < 24) return `in ${hours}h`;
    if (days < 30) return `in ${days}d`;
    if (months < 12) return `in ${months}mo`;
    return `in ${years}y`;
}

export function AccountCard({ account, onRefresh }: AccountCardProps) {
  const config = statusConfig[account.status];
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { deleteAccount, isDeleting, updateAccount, isUpdating: isUpdatingNote } = useAccountManagement();

  const [note, setNote] = useState(account.note || '');
  const [noteStatus, setNoteStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleDelete = async () => {
    await deleteAccount(account.phone);
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
      await updateAccount({ oldPhone: account.phone, newAccountData: { phone: account.phone, token: account.token, note } });
      setNoteStatus('saved');
      setTimeout(() => setNoteStatus('idle'), 1200);
    } catch (e) {
      setNoteStatus('error');
    }
  };

  return (
    <>
      <Card className={`relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 hover:shadow-2xl hover:shadow-${config.bg.split('-')[1]}-500/20 transition-all duration-500 backdrop-blur-sm ${config.glow}`}>
        <CardContent className="p-0">
          {/* Status Bar */}
          <div className={`h-1 w-full ${config.bg}`} />
          
          <div className="p-5">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{account.phone}</h3>
                  <Badge className={`${config.bg} ${config.text} border-0 gap-1.5 px-2.5 py-1 text-xs`}>
                    <config.icon className="h-3.5 w-3.5" />
                    {config.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 bg-slate-800/70 rounded-md px-2 py-1">
                    <code className="font-mono">
                      {account.token.substring(0, 12)}...
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyToken}
                      className="h-4 w-4 p-0 text-slate-400 hover:text-white"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span>Last checked: {formatDate(account.lastChecked)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(true)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Details */}
            <div className="space-y-3 mb-4">
              {account.status === 'cooldown' && account.cooldownUntil && (
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-xl p-3">
                  <div className="text-amber-200 mb-1.5 font-medium text-sm">
                    Cooldown Until: {formatDate(account.cooldownUntil)}
                  </div>
                  <CountdownTimer targetDate={new Date(account.cooldownUntil)} />
                </div>
              )}
              
              {account.status === 'prize_claimed' && account.lastPrize && (
                <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-xl p-3">
                  <span className="text-emerald-200 font-medium text-sm">🎉 Latest Prize:</span>
                  <p className="text-emerald-100 mt-1 font-medium">{account.lastPrize}</p>
                </div>
              )}
              
              {account.status === 'error' && account.error && (
                <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-xl p-3">
                  <span className="text-red-200 font-medium text-sm">⚠️ Error:</span>
                  <p className="text-red-100 mt-1 text-sm">{account.error}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Stats & Note */}
              <div className="space-y-4">
                {/* Hub Stats */}
                {account.hubStats && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-indigo-400" />
                      Daily Stats
                    </h4>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Played Today:</span>
                          <span className={`font-medium ${account.hubStats.played_today ? 'text-green-400' : 'text-slate-300'}`}>
                            {account.hubStats.played_today ? '✓ Yes' : '✗ No'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Games Won:</span>
                          <span className="text-emerald-400 font-medium">{account.hubStats.won}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Games Played:</span>
                          <span className="text-slate-200 font-medium">{account.hubStats.completed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Win Rate:</span>
                          <span className="text-slate-200 font-medium">
                            {account.hubStats.completed > 0 ? Math.round((account.hubStats.won / account.hubStats.completed) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      
                      {Object.keys(account.hubStats.rpp_bonus).length > 0 && (
                        <div className="pt-2 border-t border-slate-700">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Coins className="h-4 w-4 text-yellow-400" />
                            <span className="text-slate-400 font-medium text-sm">Bonuses</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(account.hubStats.rpp_bonus).map(([key, bonus]) => (
                              <div
                                key={key}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                                  bonus.completed 
                                    ? 'bg-green-500/20 text-green-300' 
                                    : 'bg-slate-700/50 text-slate-400'
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
                  </div>
                )}

                {/* Note Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Note</label>
                  <Textarea
                    value={note}
                    onChange={handleNoteChange}
                    onBlur={handleNoteBlur}
                    className="bg-slate-800/50 border-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none text-slate-200 text-sm"
                    placeholder="Add a note..."
                    disabled={isUpdatingNote}
                    rows={2}
                  />
                   <div className="h-4 mt-1 text-xs">
                    {noteStatus === 'saving' && <span className="text-slate-400">💾 Saving...</span>}
                    {noteStatus === 'saved' && <span className="text-emerald-400">✓ Saved!</span>}
                    {noteStatus === 'error' && <span className="text-red-400">✗ Error saving</span>}
                  </div>
                </div>
              </div>

              {/* Right Column: Prizes */}
              <div>
                {account.prizes && account.prizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Gift className="h-4 w-4 text-emerald-400" />
                        Wallet Prizes ({account.prizes.length})
                      </h4>
                      {account.walletLink && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50"
                          asChild
                        >
                          <a href={account.walletLink} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            <ExternalLink className="h-3 w-3 mr-1.5" />
                            View Wallet
                          </a>
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-2">
                      {account.prizes.map(prize => (
                        <div key={prize.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2.5 hover:bg-slate-700/30 transition-colors">
                          <h5 className="text-emerald-300 font-medium text-sm leading-tight mb-1.5">{prize.title}</h5>
                          <div className="flex justify-between items-center text-xs text-slate-400">
                            <div className="flex items-center gap-1" title={formatDate(prize.created)}>
                              <span>✓</span>
                              <span>Created {timeAgo(prize.created)}</span>
                            </div>
                            <div className="flex items-center gap-1" title={formatDate(prize.expires)}>
                              <Clock className="h-3 w-3" />
                              <span>Expires {timeLeft(prize.expires)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <EditAccountModal 
        account={account}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
        }}
      />
      </>
  );
}
