import { AccountState } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Clock, AlertTriangle, Users, Trophy, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStatsProps {
  accounts: AccountState[];
}

export function DashboardStats({ accounts }: DashboardStatsProps) {
  const totalPrizes = accounts.reduce((sum, acc) => sum + acc.prizes.length, 0);
  const totalClaimed = accounts.filter(acc => acc.status === 'prize_claimed').length;
  const totalCooldown = accounts.filter(acc => acc.hubStats?.played_today).length;
  const totalErrors = accounts.filter(acc => acc.status === 'error').length;
  
  // Hub stats calculations
  const playedToday = accounts.filter(acc => acc.hubStats?.played_today).length;
  const totalCompletedGames = accounts.reduce((sum, acc) => sum + (acc.hubStats?.completed || 0), 0);
  const totalWonGames = accounts.reduce((sum, acc) => sum + (acc.hubStats?.won || 0), 0);

  const stats = [
    {
      title: 'Total Accounts',
      value: accounts.length,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-600/10',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Played Today',
      value: playedToday,
      icon: Zap,
      color: 'text-cyan-400',
      bgColor: 'from-cyan-500/20 to-cyan-600/10',
      borderColor: 'border-cyan-500/30',
    },
    {
      title: 'Total Games',
      value: totalCompletedGames,
      icon: Target,
      color: 'text-indigo-400',
      bgColor: 'from-indigo-500/20 to-indigo-600/10',
      borderColor: 'border-indigo-500/30',
    },
    {
      title: 'Games Won',
      value: totalWonGames,
      icon: Trophy,
      color: 'text-emerald-400',
      bgColor: 'from-emerald-500/20 to-emerald-600/10',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Total Prizes',
      value: totalPrizes,
      icon: Gift,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-600/10',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Recently Claimed',
      value: totalClaimed,
      icon: Gift,
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-green-600/10',
      borderColor: 'border-green-500/30',
    },
    {
      title: 'On Cooldown',
      value: totalCooldown,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'from-amber-500/20 to-amber-600/10',
      borderColor: 'border-amber-500/30',
    },
    {
      title: 'Errors',
      value: totalErrors,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'from-red-500/20 to-red-600/10',
      borderColor: 'border-red-500/30',
    },
  ];

  return (
    <div 
      className="gap-4"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gridAutoRows: 'minmax(120px, auto)'
      }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="group"
        >
          <Card className={`glass-effect border ${stat.borderColor} hover:shadow-lg transition-all duration-300`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
